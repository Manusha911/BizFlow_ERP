import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { Shell, PageHeading } from "@/components/erp/Shell";
import {
  fetchProducts,
  fetchSales,
  rs,
  shortDate,
  stockState,
  type Product,
  type Sale,
} from "@/lib/erp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BizFlow ERP — Store Command Center" },
      {
        name: "description",
        content:
          "BizFlow dashboard: today's sales, stock alerts, product counts and recent transactions for your shop.",
      },
      { property: "og:title", content: "BizFlow ERP — Store Command Center" },
      {
        property: "og:description",
        content:
          "Live sales, inventory and invoice figures for a small retail business in one dashboard.",
      },
    ],
  }),
  component: Dashboard,
});

function Kpi({
  label,
  value,
  note,
  tone,
  tilt,
}: {
  label: string;
  value: string;
  note: string;
  tone: "volt" | "ice" | "muted" | "berry";
  tilt: "left" | "right";
}) {
  const toneClass =
    tone === "volt"
      ? "text-volt"
      : tone === "ice"
        ? "text-ice"
        : tone === "berry"
          ? "text-berry"
          : "text-muted-foreground";
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-line bg-ink2/50 p-5 backdrop-blur-xl transition-transform hover:rotate-0 ${
        tilt === "left" ? "-rotate-1" : "rotate-1"
      }`}
    >
      <div className="sheen absolute inset-0" />
      <p className="text-[11px] tracking-widest text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-2 font-display text-3xl font-bold">{value}</p>
      <p className={`mt-1 font-mono text-xs ${toneClass}`}>{note}</p>
    </div>
  );
}

function Dashboard() {
  const products = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const sales = useQuery({
    queryKey: ["sales"],
    queryFn: fetchSales,
    refetchInterval: 5000,
  });

  const productList: Product[] = products.data ?? [];
  const saleList: Sale[] = sales.data ?? [];

  const now = new Date();

  const isSameDay = (iso: string, targetDate: Date) => {
    const d = new Date(iso);
    return (
      d.getFullYear() === targetDate.getFullYear() &&
      d.getMonth() === targetDate.getMonth() &&
      d.getDate() === targetDate.getDate()
    );
  };

  const todaySales = saleList.filter((s) => isSameDay(s.created_at, now));
  const todayTotal = todaySales.reduce((sum, s) => sum + Number(s.total), 0);
  const monthTotal = saleList
    .filter((s) => {
      const d = new Date(s.created_at);
      return (
        d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
      );
    })
    .reduce((sum, s) => sum + Number(s.total), 0);
  const alerts = productList.filter((p) => stockState(p) !== "ok");

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const matchingSales = saleList.filter((s) => isSameDay(s.created_at, d));
    const total = matchingSales.reduce((sum, s) => sum + Number(s.total), 0);
    return {
      label: d.toLocaleDateString("en-GB", { weekday: "short" }),
      dateFormatted: d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
      total,
      count: matchingSales.length,
      isToday: i === 6,
    };
  });
  const peak = Math.max(...days.map((d) => d.total), 1);

  return (
    <Shell>
      <PageHeading
        eyebrow="Business Overview"
        title="Store Command"
        accent="Center"
        right={
          <div className="flex items-center gap-2">
            <div className="skew-x-[-6deg] border border-line bg-ink2/60 px-5 py-3 backdrop-blur-xl">
              <p className="-skew-x-[6deg] text-[11px] tracking-widest text-muted-foreground uppercase">
                Sales (This Month)
              </p>
              <p className="-skew-x-[6deg] font-display text-xl text-volt">
                {rs(monthTotal)}
              </p>
            </div>
            <div className="skew-x-[-6deg] border border-berry/30 bg-berry/10 px-5 py-3 backdrop-blur-xl">
              <p className="-skew-x-[6deg] text-[11px] tracking-widest text-berry/80 uppercase">
                Stock Alerts
              </p>
              <p className="-skew-x-[6deg] font-display text-xl text-berry">
                {alerts.length} items
              </p>
            </div>
          </div>
        }
      />

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi
          label="Today's Sales"
          value={rs(todayTotal)}
          note={`${todaySales.length} invoices today`}
          tone="volt"
          tilt="left"
        />
        <Kpi
          label="Total Invoices"
          value={String(saleList.length)}
          note={`${saleList.filter((s) => s.status !== "Paid").length} pending`}
          tone="ice"
          tilt="right"
        />
        <Kpi
          label="Products"
          value={String(productList.length)}
          note={`${alerts.length} need restock`}
          tone="muted"
          tilt="left"
        />
        <Kpi
          label="Stock Value"
          value={rs(
            productList.reduce(
              (sum, p) => sum + Number(p.purchase_price) * p.quantity,
              0,
            ),
          )}
          note="at purchase price"
          tone="volt"
          tilt="right"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-ink2/40 p-6 -skew-x-[2deg] backdrop-blur-xl lg:col-span-2">
          <div className="skew-x-[2deg]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl font-bold tracking-tight">
                  Sales Overview
                </h2>
                <p className="text-xs text-muted-foreground">
                  Daily sales performance · revenue trend
                </p>
              </div>
              <span className="rounded-full border border-volt/30 bg-volt/10 px-3 py-1 font-mono text-xs text-volt">
                {peak > 1 ? `peak ${rs(peak)}` : "no sales this week"}
              </span>
            </div>
            <div className="mt-6 flex h-48 items-end justify-between gap-2">
              {days.map((d, i) => (
                <div
                  key={d.label + i}
                  title={`${d.dateFormatted}: ${rs(d.total)} (${d.count} sales)`}
                  className="group relative flex flex-1 flex-col items-center gap-1.5"
                >
                  <span className="font-mono text-[9px] text-muted-foreground transition-colors group-hover:text-volt">
                    {d.total > 0 ? rs(d.total) : "0"}
                  </span>
                  <div className="flex h-32 w-full items-end">
                    <div
                      className={`w-full rounded-t-md transition-all duration-300 group-hover:bg-volt group-hover:shadow-[0_0_20px_-2px_var(--volt)] ${
                        d.isToday
                          ? "bg-volt shadow-[0_0_24px_-4px_var(--volt)]"
                          : d.total > 0
                            ? "bg-ice/60"
                            : "bg-white/5"
                      }`}
                      style={{
                        height: `${Math.max((d.total / peak) * 100, 4)}%`,
                      }}
                    />
                  </div>
                  <span
                    className={`font-mono text-[10px] ${
                      d.isToday ? "font-bold text-volt" : "text-muted-foreground"
                    }`}
                  >
                    {d.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-berry/20 bg-ink2/40 p-6 skew-x-[2deg] backdrop-blur-xl">
          <div className="-skew-x-[2deg]">
            <h2 className="font-display text-xl font-bold tracking-tight">
              Stock Alerts
            </h2>
            <p className="text-xs text-muted-foreground">Requires restock</p>
            <div className="mt-5 space-y-3">
              {alerts.length === 0 ? (
                <p className="font-mono text-xs text-muted-foreground">
                  All products above minimum level.
                </p>
              ) : (
                alerts.slice(0, 4).map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-xl border border-line bg-ink/40 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p
                        className={`font-mono text-[11px] ${
                          stockState(p) === "out" ? "text-muted-foreground" : "text-berry"
                        }`}
                      >
                        {p.quantity} / min {p.minimum_stock}
                      </p>
                    </div>
                    <span
                      className={`rounded-full border px-2 py-0.5 font-mono text-[10px] tracking-widest uppercase ${
                        stockState(p) === "out"
                          ? "border-line text-muted-foreground"
                          : "border-berry/30 text-berry"
                      }`}
                    >
                      {stockState(p) === "out" ? "Out" : "Low"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-ink2/40 p-6 backdrop-blur-xl lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold tracking-tight">
              Recent Transactions
            </h2>
            <Link to="/sales" className="font-mono text-xs text-muted-foreground hover:text-volt">
              view all →
            </Link>
          </div>
          <div className="mt-4 divide-y divide-line">
            {saleList.slice(0, 5).map((s) => (
              <Link
                key={s.id}
                to="/invoices/$id"
                params={{ id: s.id }}
                className="flex items-center justify-between py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded-lg bg-volt/15 font-mono text-[10px] text-volt">
                    {s.invoice_number.slice(-4)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{s.customer_name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {shortDate(s.created_at)} · {s.payment_method}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm">{rs(s.total)}</p>
                  <p
                    className={`font-mono text-[10px] ${
                      s.status === "Paid" ? "text-volt" : "text-berry"
                    }`}
                  >
                    {s.status}
                  </p>
                </div>
              </Link>
            ))}
            {saleList.length === 0 ? (
              <p className="py-3 font-mono text-xs text-muted-foreground">
                No sales recorded yet.
              </p>
            ) : null}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-volt/20 bg-ink2/40 p-6 -skew-x-[2deg] backdrop-blur-xl">
          <div className="sheen absolute inset-0" />
          <div className="relative -skew-x-[2deg]">
            <h2 className="font-display text-xl font-bold tracking-tight">Quick Sale</h2>
            <p className="text-xs text-muted-foreground">Live POS</p>
            {productList.slice(0, 2).map((p) => (
              <div
                key={p.id}
                className="mt-2 rounded-xl border border-line bg-ink/50 px-4 py-3 text-sm"
              >
                {p.name}
                <span className="float-right font-mono text-volt">
                  {rs(p.selling_price)}
                </span>
              </div>
            ))}
            <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
              <span className="text-xs tracking-widest text-muted-foreground uppercase">
                Open register
              </span>
            </div>
            <Link
              to="/sales"
              className="mt-4 block w-full -skew-x-6 rounded-lg bg-volt py-3 text-center font-display font-bold text-ink shadow-[0_0_30px_-6px_var(--volt)]"
            >
              <span className="inline-block skew-x-6">New Sale</span>
            </Link>
          </div>
        </div>
      </div>
    </Shell>
  );
}
