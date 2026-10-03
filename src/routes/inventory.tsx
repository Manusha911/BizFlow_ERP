import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";

import { Shell, PageHeading } from "@/components/erp/Shell";
import { supabase } from "@/integrations/supabase/client";
import { fetchProducts, rs, stockState, type Product } from "@/lib/erp";

export const Route = createFileRoute("/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory — BizFlow ERP" },
      {
        name: "description",
        content:
          "Add products, update stock levels and watch low-stock alerts for your shop inventory.",
      },
      { property: "og:title", content: "Inventory — BizFlow ERP" },
      {
        property: "og:description",
        content: "Product catalogue with purchase price, selling price and stock alerts.",
      },
    ],
  }),
  component: InventoryPage,
});

const empty = {
  sku: "",
  name: "",
  category: "",
  brand: "",
  purchase_price: "",
  selling_price: "",
  quantity: "",
  minimum_stock: "5",
};

const EDIT_FIELDS = [
  ["sku", "SKU / Barcode", "text"],
  ["name", "Product name", "text"],
  ["category", "Category", "text"],
  ["brand", "Brand", "text"],
  ["purchase_price", "Purchase price", "number"],
  ["selling_price", "Selling price", "number"],
  ["quantity", "Stock quantity", "number"],
  ["minimum_stock", "Minimum stock", "number"],
] as const;

const toForm = (p: Product) => ({
  sku: p.sku,
  name: p.name,
  category: p.category,
  brand: p.brand ?? "",
  purchase_price: String(p.purchase_price),
  selling_price: String(p.selling_price),
  quantity: String(p.quantity),
  minimum_stock: String(p.minimum_stock),
});

function InventoryPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState(toForm({} as Product));
  const [editError, setEditError] = useState<string | null>(null);
  const [catalogSearch, setCatalogSearch] = useState("");
  const products = useQuery({ queryKey: ["products"], queryFn: fetchProducts });

  const openEdit = (p: Product) => {
    setEditing(p);
    setEditForm(toForm(p));
    setEditError(null);
  };

  const addProduct = useMutation({
    mutationFn: async () => {
      const { error: err } = await supabase.from("products").insert({
        sku: form.sku.trim(),
        name: form.name.trim(),
        category: form.category.trim() || "General",
        brand: form.brand.trim() || null,
        purchase_price: Number(form.purchase_price) || 0,
        selling_price: Number(form.selling_price) || 0,
        quantity: Number(form.quantity) || 0,
        minimum_stock: Number(form.minimum_stock) || 0,
      });
      if (err) throw err;
    },
    onSuccess: () => {
      setForm(empty);
      setError(null);
      qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (e: Error) => setError(e.message),
  });

  const saveEdit = useMutation({
    mutationFn: async () => {
      if (!editing) return;
      const { error: err } = await supabase
        .from("products")
        .update({
          sku: editForm.sku.trim(),
          name: editForm.name.trim(),
          category: editForm.category.trim() || "General",
          brand: editForm.brand.trim() || null,
          purchase_price: Number(editForm.purchase_price) || 0,
          selling_price: Number(editForm.selling_price) || 0,
          quantity: Number(editForm.quantity) || 0,
          minimum_stock: Number(editForm.minimum_stock) || 0,
        })
        .eq("id", editing.id);
      if (err) throw err;
    },
    onSuccess: () => {
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (e: Error) => setEditError(e.message),
  });

  const adjustStock = useMutation({
    mutationFn: async ({ p, delta }: { p: Product; delta: number }) => {
      const { error: err } = await supabase
        .from("products")
        .update({ quantity: Math.max(p.quantity + delta, 0) })
        .eq("id", p.id);
      if (err) throw err;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });

  const list = products.data ?? [];

  const filteredProducts = useMemo(() => {
    const q = catalogSearch.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q)),
    );
  }, [list, catalogSearch]);

  return (
    <Shell>
      <PageHeading
        eyebrow="Inventory Control"
        title="Products &"
        accent="Stock"
        right={
          <div className="skew-x-[-6deg] border border-line bg-ink2/60 px-5 py-3 backdrop-blur-xl">
            <p className="-skew-x-[6deg] text-[11px] tracking-widest text-muted-foreground uppercase">
              Products Tracked
            </p>
            <p className="-skew-x-[6deg] font-display text-xl text-volt">
              {list.length}
            </p>
          </div>
        }
      />

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-3xl border border-volt/20 bg-ink2/40 p-6 backdrop-blur-xl">
          <h2 className="font-display text-xl font-bold tracking-tight">Add Product</h2>
          <p className="text-xs text-muted-foreground">New catalogue entry</p>
          <form
            className="mt-4 space-y-2"
            onSubmit={(e) => {
              e.preventDefault();
              addProduct.mutate();
            }}
          >
            {(
              [
                ["sku", "SKU / Barcode", "text"],
                ["name", "Product name", "text"],
                ["category", "Category", "text"],
                ["brand", "Brand", "text"],
                ["purchase_price", "Purchase price", "number"],
                ["selling_price", "Selling price", "number"],
                ["quantity", "Opening stock", "number"],
                ["minimum_stock", "Minimum stock", "number"],
              ] as const
            ).map(([key, label, type]) => (
              <input
                key={key}
                required={key === "sku" || key === "name"}
                type={type}
                placeholder={label}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full rounded-xl border border-line bg-ink/50 px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-volt/50"
              />
            ))}
            {error ? (
              <p className="font-mono text-[11px] text-berry">{error}</p>
            ) : null}
            <button
              type="submit"
              disabled={addProduct.isPending}
              className="mt-2 w-full -skew-x-6 rounded-lg bg-volt py-3 font-display font-bold text-ink shadow-[0_0_30px_-6px_var(--volt)] disabled:opacity-60"
            >
              <span className="inline-block skew-x-6">
                {addProduct.isPending ? "Saving…" : "Save Product"}
              </span>
            </button>
          </form>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-ink2/40 backdrop-blur-xl lg:col-span-2">
          <div className="flex flex-col gap-4 border-b border-line px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-xl font-bold tracking-tight">Catalogue</h2>
              <p className="text-xs text-muted-foreground">
                Stock below minimum is flagged automatically
              </p>
            </div>

            {/* Search Input for Catalogue */}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                placeholder="Search name, SKU, category..."
                className="w-full rounded-xl border border-line bg-ink/60 py-2 pl-9 pr-8 text-xs outline-none placeholder:text-muted-foreground focus:border-volt/50 focus:ring-1 focus:ring-volt/40"
              />
              <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
              {catalogSearch ? (
                <button
                  type="button"
                  onClick={() => setCatalogSearch("")}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              ) : null}
            </div>
          </div>
          <div className="overflow-x-auto">
            {filteredProducts.length === 0 ? (
              <div className="p-8 text-center font-mono text-xs text-muted-foreground">
                No products found matching "{catalogSearch}".
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
                    <th className="px-6 py-3 text-left font-medium">Product</th>
                    <th className="px-4 py-3 text-right font-medium">Buy</th>
                    <th className="px-4 py-3 text-right font-medium">Sell</th>
                    <th className="px-4 py-3 text-right font-medium">Stock</th>
                    <th className="px-6 py-3 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-xs">
                  {filteredProducts.map((p) => {
                    const state = stockState(p);
                  return (
                    <tr key={p.id} className="border-b border-line/70 last:border-0">
                      <td className="px-6 py-3">
                        <div className="font-sans text-[13px] font-medium">{p.name}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {p.sku} · {p.category}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {rs(p.purchase_price)}
                      </td>
                      <td className="px-4 py-3 text-right">{rs(p.selling_price)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => adjustStock.mutate({ p, delta: -1 })}
                            className="size-6 rounded-md border border-line text-muted-foreground hover:border-berry/40 hover:text-berry"
                            aria-label={`Reduce stock of ${p.name}`}
                          >
                            −
                          </button>
                          <span
                            className={
                              state === "ok"
                                ? ""
                                : state === "low"
                                  ? "text-berry"
                                  : "text-muted-foreground"
                            }
                          >
                            {p.quantity}
                          </span>
                          <button
                            onClick={() => adjustStock.mutate({ p, delta: 1 })}
                            className="size-6 rounded-md border border-line text-muted-foreground hover:border-volt/40 hover:text-volt"
                            aria-label={`Add stock to ${p.name}`}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-md px-2 py-1 font-mono text-[10px] tracking-wider uppercase ${
                              state === "ok"
                                ? "bg-volt/10 text-volt"
                                : state === "low"
                                  ? "bg-berry/10 text-berry"
                                  : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {state === "ok" ? "In stock" : state === "low" ? "Low stock" : "Out"}
                          </span>
                          <button
                            onClick={() => openEdit(p)}
                            className="ml-auto rounded-md border border-line px-2.5 py-1 font-mono text-[10px] tracking-wider text-muted-foreground uppercase transition-colors hover:border-volt/40 hover:text-volt"
                            aria-label={`Edit ${p.name}`}
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          </div>
        </div>
      </div>

      {editing ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/80 p-4 backdrop-blur-sm"
          onClick={() => setEditing(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-volt/20 bg-ink2 p-6 shadow-[0_0_60px_-12px_var(--volt)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display text-xl font-bold tracking-tight">Edit Product</h2>
                <p className="text-xs text-muted-foreground">{editing.sku}</p>
              </div>
              <button
                onClick={() => setEditing(null)}
                className="grid size-8 place-items-center rounded-lg border border-line text-muted-foreground hover:border-berry/40 hover:text-berry"
                aria-label="Close edit dialog"
              >
                ✕
              </button>
            </div>
            <form
              className="mt-4 space-y-2"
              onSubmit={(e) => {
                e.preventDefault();
                saveEdit.mutate();
              }}
            >
              {EDIT_FIELDS.map(([key, label, type]) => (
                <label key={key} className="block">
                  <span className="mb-1 block font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                    {label}
                  </span>
                  <input
                    required={key === "sku" || key === "name"}
                    type={type}
                    step="any"
                    value={editForm[key]}
                    onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                    className="w-full rounded-xl border border-line bg-ink/50 px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-volt/50"
                  />
                </label>
              ))}
              {editError ? (
                <p className="font-mono text-[11px] text-berry">{editError}</p>
              ) : null}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="flex-1 rounded-lg border border-line py-3 font-display font-bold text-muted-foreground transition-colors hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveEdit.isPending}
                  className="flex-1 -skew-x-6 rounded-lg bg-volt py-3 font-display font-bold text-ink shadow-[0_0_30px_-6px_var(--volt)] disabled:opacity-60"
                >
                  <span className="inline-block skew-x-6">
                    {saveEdit.isPending ? "Saving…" : "Save Changes"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </Shell>
  );
}
