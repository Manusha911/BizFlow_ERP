import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { Shell } from "@/components/erp/Shell";
import { fetchSaleWithItems, fetchShopProfile, rs, shortDate } from "@/lib/erp";

export const Route = createFileRoute("/invoices/$id")({
  head: () => ({
    meta: [
      { title: "Invoice — BizFlow ERP" },
      {
        name: "description",
        content: "Printable invoice with line items, discount and total for a completed sale.",
      },
      { property: "og:title", content: "Invoice — BizFlow ERP" },
      {
        property: "og:description",
        content: "Invoice detail for a BizFlow sale, ready to print or save as PDF.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: InvoicePage,
});

function InvoicePage() {
  const { id } = Route.useParams();
  const invoice = useQuery({
    queryKey: ["invoice", id],
    queryFn: () => fetchSaleWithItems(id),
  });
  const profileQuery = useQuery({
    queryKey: ["shopProfile"],
    queryFn: fetchShopProfile,
  });

  const sale = invoice.data?.sale;
  const items = invoice.data?.items ?? [];
  const profile = profileQuery.data;

  return (
    <Shell>
      <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="font-mono text-xs tracking-[0.3em] text-volt uppercase">
            Invoice
          </p>
          <h1 className="mt-2 font-display text-4xl leading-[0.95] font-bold tracking-tight md:text-5xl">
            {sale ? sale.invoice_number : "Loading…"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="skew-x-[-6deg] border border-volt/40 bg-volt/10 px-5 py-3 font-display text-sm font-bold text-volt"
          >
            <span className="inline-block skew-x-[6deg]">Print / Save PDF</span>
          </button>
          <Link
            to="/sales"
            className="skew-x-[-6deg] border border-line bg-ink2/60 px-5 py-3 font-display text-sm text-muted-foreground backdrop-blur-xl"
          >
            <span className="inline-block skew-x-[6deg]">Back to register</span>
          </Link>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-ink2/40 p-8 backdrop-blur-xl">
        {!sale ? (
          <p className="font-mono text-xs text-muted-foreground">
            {invoice.isLoading ? "Loading invoice…" : "Invoice not found."}
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-6 border-b border-line pb-6">
              <div>
                <p className="font-display text-2xl font-bold tracking-tight text-foreground">
                  {profile?.shop_name || "BizFlow Retail"}
                </p>
                <p className="font-mono text-[11px] text-volt">
                  {profile?.tagline || "Small Business ERP"}
                </p>
                <div className="mt-2 space-y-0.5 font-mono text-[11px] text-muted-foreground">
                  <p>{profile?.address || "Colombo, Sri Lanka"}</p>
                  {profile?.phone ? <p>Tel: {profile.phone}</p> : null}
                  {profile?.email ? <p>Email: {profile.email}</p> : null}
                </div>
              </div>
              <div className="text-right font-mono text-xs text-muted-foreground">
                <p>Date: {shortDate(sale.created_at)}</p>
                <p>Payment: {sale.payment_method}</p>
                <p>Status: {sale.status}</p>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-[11px] tracking-widest text-muted-foreground uppercase">
                Billed to
              </p>
              <p className="mt-1 font-display text-lg">{sale.customer_name}</p>
            </div>

            <table className="mt-6 w-full text-sm">
              <thead>
                <tr className="border-b border-line font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
                  <th className="py-3 text-left font-medium">Product</th>
                  <th className="py-3 text-right font-medium">Qty</th>
                  <th className="py-3 text-right font-medium">Price</th>
                  <th className="py-3 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs">
                {items.map((it) => (
                  <tr key={it.id} className="border-b border-line/70">
                    <td className="py-3 font-sans text-[13px]">{it.product_name}</td>
                    <td className="py-3 text-right">{it.quantity}</td>
                    <td className="py-3 text-right text-muted-foreground">
                      {rs(it.unit_price)}
                    </td>
                    <td className="py-3 text-right">{rs(it.line_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-6 ml-auto w-full max-w-xs space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{rs(sale.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-berry">- {rs(sale.discount)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-line pt-3">
                <span className="font-display text-sm font-semibold">Total</span>
                <span className="font-display text-2xl font-bold text-volt">
                  {rs(sale.total)}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </Shell>
  );
}
