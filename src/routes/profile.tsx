import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { Shell, PageHeading } from "@/components/erp/Shell";
import { fetchShopProfile, updateShopProfile } from "@/lib/erp";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Shop Profile — BizFlow ERP" },
      {
        name: "description",
        content:
          "Edit your shop profile — name, tagline, address, phone and email shown on every invoice.",
      },
      { property: "og:title", content: "Shop Profile — BizFlow ERP" },
      {
        property: "og:description",
        content: "Shop details used on invoices and across BizFlow ERP.",
      },
    ],
  }),
  component: ProfilePage,
});

const empty = {
  shop_name: "",
  tagline: "",
  address: "",
  phone: "",
  email: "",
};

const FIELDS = [
  ["shop_name", "Shop name"],
  ["tagline", "Tagline"],
  ["address", "Address"],
  ["phone", "Phone"],
  ["email", "Email"],
] as const;

function ProfilePage() {
  const qc = useQueryClient();
  const [form, setForm] = useState(empty);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const profile = useQuery({ queryKey: ["shopProfile"], queryFn: fetchShopProfile });

  useEffect(() => {
    const p = profile.data;
    if (!p) return;
    setForm({
      shop_name: p.shop_name,
      tagline: p.tagline,
      address: p.address,
      phone: p.phone ?? "",
      email: p.email ?? "",
    });
  }, [profile.data]);

  const save = useMutation({
    mutationFn: () =>
      updateShopProfile({
        shop_name: form.shop_name.trim(),
        tagline: form.tagline.trim(),
        address: form.address.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
      }),
    onSuccess: () => {
      setSaved(true);
      setError(null);
      setTimeout(() => setSaved(false), 2500);
      qc.invalidateQueries({ queryKey: ["shopProfile"] });
    },
    onError: (e: Error) => setError(e.message),
  });

  return (
    <Shell>
      <PageHeading
        eyebrow="Business Settings"
        title="Shop"
        accent="Profile"
        right={
          <div className="skew-x-[-6deg] border border-line bg-ink2/60 px-5 py-3 backdrop-blur-xl">
            <p className="-skew-x-[6deg] text-[11px] tracking-widest text-muted-foreground uppercase">
              Shown On
            </p>
            <p className="-skew-x-[6deg] font-display text-xl text-volt">Invoices</p>
          </div>
        }
      />

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-3xl border border-volt/20 bg-ink2/40 p-6 backdrop-blur-xl lg:col-span-2">
          <h2 className="font-display text-xl font-bold tracking-tight">Business Details</h2>
          <p className="text-xs text-muted-foreground">
            These details appear at the top of every invoice you print or save as PDF
          </p>
          <form
            className="mt-4 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate();
            }}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {FIELDS.map(([key, label]) => (
                <label key={key} className={key === "shop_name" ? "sm:col-span-2" : "block"}>
                  <span className="mb-1 block font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                    {label}
                  </span>
                  <input
                    required={key === "shop_name"}
                    type={key === "email" ? "email" : "text"}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder={label}
                    className="w-full rounded-xl border border-line bg-ink/50 px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-volt/50"
                  />
                </label>
              ))}
            </div>
            {error ? <p className="font-mono text-[11px] text-berry">{error}</p> : null}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={save.isPending}
                className="-skew-x-6 rounded-lg bg-volt px-8 py-3 font-display font-bold text-ink shadow-[0_0_30px_-6px_var(--volt)] disabled:opacity-60"
              >
                <span className="inline-block skew-x-6">
                  {save.isPending ? "Saving…" : "Save Profile"}
                </span>
              </button>
              {saved ? (
                <span className="font-mono text-[11px] text-volt">Saved ✓</span>
              ) : null}
            </div>
          </form>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-ink2/40 p-6 backdrop-blur-xl">
          <h2 className="font-display text-xl font-bold tracking-tight">Invoice Preview</h2>
          <p className="text-xs text-muted-foreground">How the header will read</p>
          <div className="mt-6 rounded-2xl border border-line bg-ink/50 p-5">
            <p className="font-display text-2xl font-bold tracking-tight">
              {form.shop_name || "Your Shop Name"}
            </p>
            <p className="font-mono text-[11px] text-muted-foreground">
              {form.tagline || "Tagline"}
            </p>
            <div className="mt-4 space-y-1 font-mono text-[11px] text-muted-foreground">
              <p>{form.address || "Address"}</p>
              {form.phone ? <p>{form.phone}</p> : null}
              {form.email ? <p>{form.email}</p> : null}
            </div>
          </div>
          <p className="mt-4 font-mono text-[10px] text-muted-foreground/70">
            Changes apply to new invoices immediately and to any invoice the next time you open it.
          </p>
        </div>
      </div>
    </Shell>
  );
}
