import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";

import { Shell, PageHeading } from "@/components/erp/Shell";
import {
  completeSale,
  fetchProducts,
  fetchSales,
  rs,
  shortDate,
  type CartLine,
  type Product,
} from "@/lib/erp";

export const Route = createFileRoute("/sales")({
  head: () => ({
    meta: [
      { title: "New Sale & Invoices — BizFlow ERP" },
      {
        name: "description",
        content:
          "Ring up a sale at the counter, apply a discount and generate an invoice while stock updates automatically.",
      },
      { property: "og:title", content: "New Sale & Invoices — BizFlow ERP" },
      {
        property: "og:description",
        content: "POS-style register with cart, discount, totals and invoice history.",
      },
    ],
  }),
  component: SalesPage,
});

function SalesPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [customer, setCustomer] = useState("");
  const [payment, setPayment] = useState("Cash");
  const [discount, setDiscount] = useState("0");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [error, setError] = useState<string | null>(null);

  const products = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const sales = useQuery({ queryKey: ["sales"], queryFn: fetchSales });

  const matches = useMemo(() => {
    const list = products.data ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return list.slice(0, 6);
    return list
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q),
      )
      .slice(0, 6);
  }, [products.data, search]);

  const subtotal = cart.reduce(
    (sum, l) => sum + Number(l.product.selling_price) * l.quantity,
    0,
  );
  const discountValue = Math.min(Math.max(Number(discount) || 0, 0), subtotal);
  const total = subtotal - discountValue;

  const addToCart = (p: Product) => {
    setError(null);
    setCart((prev) => {
      const existing = prev.find((l) => l.product.id === p.id);
      if (existing) {
        if (existing.quantity >= p.quantity) return prev;
        return prev.map((l) =>
          l.product.id === p.id ? { ...l, quantity: l.quantity + 1 } : l,
        );
      }
      if (p.quantity < 1) return prev;
      return [...prev, { product: p, quantity: 1 }];
    });
  };

  const checkout = useMutation({
    mutationFn: () =>
      completeSale({
        customerName: customer,
        paymentMethod: payment,
        discount: discountValue,
        lines: cart,
      }),
    onSuccess: (sale) => {
      setCart([]);
      setCustomer("");
      setDiscount("0");
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["sales"] });
      navigate({ to: "/invoices/$id", params: { id: sale.id } });
    },
    onError: (e: Error) => setError(e.message),
  });

  const saleList = sales.data ?? [];

  const filteredSales = useMemo(() => {
    const q = invoiceSearch.trim().toLowerCase();
    if (!q) return saleList;
    return saleList.filter(
      (s) =>
        s.invoice_number.toLowerCase().includes(q) ||
        s.customer_name.toLowerCase().includes(q) ||
        s.payment_method.toLowerCase().includes(q) ||
        String(s.total).includes(q) ||
        s.status.toLowerCase().includes(q),
    );
  }, [saleList, invoiceSearch]);

  return (
    <Shell>
      <PageHeading
        eyebrow="Point of Sale"
        title="New"
        accent="Sale"
        right={
          <div className="skew-x-[-6deg] border border-line bg-ink2/60 px-5 py-3 backdrop-blur-xl">
            <p className="-skew-x-[6deg] text-[11px] tracking-widest text-muted-foreground uppercase">
              Invoices Issued
            </p>
            <p className="-skew-x-[6deg] font-display text-xl text-volt">
              {saleList.length}
            </p>
          </div>
        }
      />

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-ink2/40 p-6 backdrop-blur-xl lg:col-span-2">
          <h2 className="font-display text-xl font-bold tracking-tight">
            Search Product
          </h2>
          <p className="text-xs text-muted-foreground">
            Search by name or barcode, then tap to add
          </p>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Wireless Mouse / SKU-0042"
            className="mt-4 w-full rounded-xl border border-line bg-ink/50 px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-volt/50"
          />
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {matches.map((p) => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                disabled={p.quantity < 1}
                className="flex items-center justify-between rounded-xl border border-line bg-ink/50 px-4 py-3 text-left text-sm transition-colors hover:border-volt/40 disabled:opacity-50"
              >
                <span>
                  {p.name}
                  <span className="block font-mono text-[10px] text-muted-foreground">
                    stock {p.quantity}
                  </span>
                </span>
                <span className="font-mono text-volt">{rs(p.selling_price)}</span>
              </button>
            ))}
            {matches.length === 0 ? (
              <p className="font-mono text-xs text-muted-foreground">
                No product matches that search.
              </p>
            ) : null}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-xl font-bold tracking-tight">
                Invoice History
              </h2>
              <p className="text-xs text-muted-foreground">
                Recent transactions & customer billing history
              </p>
            </div>

            {/* Search Input for Invoice History */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={invoiceSearch}
                onChange={(e) => setInvoiceSearch(e.target.value)}
                placeholder="Search invoice #, customer..."
                className="w-full rounded-xl border border-line bg-ink/60 py-2 pl-9 pr-8 text-xs outline-none placeholder:text-muted-foreground focus:border-volt/50 focus:ring-1 focus:ring-volt/40"
              />
              <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
              {invoiceSearch ? (
                <button
                  type="button"
                  onClick={() => setInvoiceSearch("")}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-3 divide-y divide-line">
            {filteredSales.length === 0 ? (
              <p className="py-4 font-mono text-xs text-muted-foreground">
                {invoiceSearch
                  ? `No invoices found matching "${invoiceSearch}".`
                  : "No invoice history recorded yet."}
              </p>
            ) : (
              (invoiceSearch ? filteredSales : filteredSales.slice(0, 8)).map((s) => (
                <Link
                  key={s.id}
                  to="/invoices/$id"
                  params={{ id: s.id }}
                  className="flex items-center justify-between py-3 transition-colors hover:bg-white/[0.02]"
                >
                  <div>
                    <p className="text-sm font-medium">{s.invoice_number}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {s.customer_name} · {shortDate(s.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-semibold text-volt">{rs(s.total)}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{s.payment_method}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-volt/20 bg-ink2/40 p-6 -skew-x-[2deg] backdrop-blur-xl">
          <div className="sheen absolute inset-0" />
          <div className="relative -skew-x-[2deg]">
            <h2 className="font-display text-xl font-bold tracking-tight">Register</h2>
            <p className="text-xs text-muted-foreground">Live POS</p>

            <input
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="Customer name (optional)"
              className="mt-4 w-full rounded-xl border border-line bg-ink/50 px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-volt/50"
            />

            <div className="mt-4 space-y-2">
              {cart.length === 0 ? (
                <p className="font-mono text-xs text-muted-foreground">
                  Cart is empty — add a product.
                </p>
              ) : (
                cart.map((l) => (
                  <div
                    key={l.product.id}
                    className="rounded-xl border border-line bg-ink/50 px-4 py-3 text-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium">{l.product.name}</span>
                      <span className="font-mono text-volt">
                        {rs(Number(l.product.selling_price) * l.quantity)}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between font-mono text-[11px] text-muted-foreground">
                      <span>
                        Qty {l.quantity} × {rs(l.product.selling_price)}
                      </span>
                      <button
                        onClick={() =>
                          setCart((prev) =>
                            prev.filter((x) => x.product.id !== l.product.id),
                          )
                        }
                        className="text-berry"
                      >
                        remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 space-y-2 border-t border-line pt-4 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{rs(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Discount</span>
                <input
                  type="number"
                  min={0}
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-24 rounded-md border border-line bg-ink/60 px-2 py-1 text-right text-xs outline-none focus:border-volt/50"
                />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment</span>
                <select
                  value={payment}
                  onChange={(e) => setPayment(e.target.value)}
                  className="rounded-md border border-line bg-ink/60 px-2 py-1 text-xs outline-none"
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Transfer">Transfer</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
              <span className="text-xs tracking-widest text-muted-foreground uppercase">
                Total
              </span>
              <span className="font-display text-2xl font-bold text-volt">
                {rs(total)}
              </span>
            </div>

            {error ? (
              <p className="mt-2 font-mono text-[11px] text-berry">{error}</p>
            ) : null}

            <button
              onClick={() => checkout.mutate()}
              disabled={cart.length === 0 || checkout.isPending}
              className="mt-4 w-full -skew-x-6 rounded-lg bg-volt py-3 font-display font-bold text-ink shadow-[0_0_30px_-6px_var(--volt)] disabled:opacity-50"
            >
              <span className="inline-block skew-x-6">
                {checkout.isPending ? "Saving…" : "Complete Sale"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </Shell>
  );
}
