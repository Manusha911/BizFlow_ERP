import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchShopProfile } from "@/lib/erp";
import { EditProfileModal } from "@/components/erp/EditProfileModal";

const nav = [
  { to: "/", label: "Dashboard" },
  { to: "/inventory", label: "Inventory" },
  { to: "/sales", label: "Sales" },
] as const;

function getInitials(name?: string | null) {
  if (!name) return "KP";
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words[0]?.[0];
  const second = words[1]?.[0];
  if (first && second) {
    return (first + second).toUpperCase();
  }
  if (first) {
    return name.trim().slice(0, 2).toUpperCase();
  }
  return "KP";
}

export function Shell({ children }: { children: ReactNode }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileQuery = useQuery({
    queryKey: ["shopProfile"],
    queryFn: fetchShopProfile,
  });

  const shopInitials = getInitials(profileQuery.data?.shop_name);

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink font-sans text-foreground selection:bg-volt/30">
      <div className="pointer-events-none fixed -top-40 -left-40 size-[560px] rounded-full bg-volt/10 blur-[120px]" />
      <div className="pointer-events-none fixed top-1/3 -right-40 size-[520px] rounded-full bg-ice/10 blur-[130px]" />
      <div className="pointer-events-none fixed bottom-0 left-1/3 size-[420px] rounded-full bg-berry/10 blur-[130px]" />
      <div className="pointer-events-none fixed top-[-12%] left-[18%] size-[520px] -rotate-12 rounded-[40px] border border-white/10 bg-white/[0.03] backdrop-blur-2xl" />
      <div className="pointer-events-none fixed bottom-[-18%] right-[8%] size-[460px] rotate-[18deg] rounded-[40px] border border-white/10 bg-white/[0.02] backdrop-blur-2xl" />

      <div className="relative mx-auto max-w-[1400px] px-6 py-6">
        <header className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/bizflow.png"
              alt="BizFlow Logo"
              className="size-9 rounded-lg object-contain bg-volt/10 p-1 border border-volt/20 shadow-[0_0_28px_-6px_var(--volt)]"
            />
            <div>
              <p className="font-display text-lg leading-none font-bold tracking-tight">
                BizFlow
              </p>
              <p className="text-[11px] tracking-[0.28em] text-muted-foreground uppercase">
                ERP · v1.0
              </p>
            </div>
          </Link>
          <nav className="hidden items-center gap-1 text-sm md:flex">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="px-4 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{
                  className:
                    "rounded-full bg-volt/15 px-4 py-1.5 font-medium text-volt hover:text-volt",
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden font-mono text-xs text-muted-foreground sm:inline">
              {new Date().toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              title="Edit Shop Profile"
              className="group relative flex cursor-pointer items-center gap-2 rounded-full border border-volt/30 bg-ink2/80 p-1 pr-3.5 text-left transition-all duration-200 hover:border-volt hover:bg-ink2 hover:shadow-[0_0_20px_-4px_var(--volt)] focus:outline-none focus:ring-2 focus:ring-volt/50"
            >
              <div className="grid size-8 place-items-center rounded-full bg-volt font-display text-xs font-bold text-ink transition-transform group-hover:scale-105 shadow-[0_0_12px_-2px_var(--volt)]">
                {shopInitials}
              </div>
              <div className="hidden flex-col md:flex">
                <span className="max-w-[120px] truncate font-display text-xs font-semibold leading-tight text-foreground group-hover:text-volt">
                  {profileQuery.data?.shop_name || "Edit Profile"}
                </span>
                <span className="text-[9px] font-mono text-muted-foreground">
                  Edit Profile
                </span>
              </div>
            </button>
          </div>
        </header>

        {children}

        <footer className="mt-8 flex items-center justify-between font-mono text-[11px] text-muted-foreground/70">
          <span>BizFlow ERP · Small Business Management</span>
          <span>Inventory · Sales · Invoices</span>
        </footer>
      </div>

      <EditProfileModal open={isProfileOpen} onOpenChange={setIsProfileOpen} />
    </div>
  );
}

export function PageHeading({
  eyebrow,
  title,
  accent,
  right,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  right?: ReactNode;
}) {
  return (
    <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
      <div>
        <p className="font-mono text-xs tracking-[0.3em] text-volt uppercase">
          {eyebrow}
        </p>
        <h1 className="mt-2 font-display text-4xl leading-[0.95] font-bold tracking-tight md:text-5xl">
          {title} {accent ? <span className="text-muted-foreground">{accent}</span> : null}
        </h1>
      </div>
      {right}
    </div>
  );
}
