import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchShopProfile, updateShopProfile } from "@/lib/erp";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Store, Building2, MapPin, Phone, Mail, Sparkles, Check } from "lucide-react";

const emptyForm = {
  shop_name: "",
  tagline: "",
  address: "",
  phone: "",
  email: "",
};

export function EditProfileModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const profileQuery = useQuery({
    queryKey: ["shopProfile"],
    queryFn: fetchShopProfile,
    enabled: open,
  });

  useEffect(() => {
    if (profileQuery.data) {
      setForm({
        shop_name: profileQuery.data.shop_name || "",
        tagline: profileQuery.data.tagline || "",
        address: profileQuery.data.address || "",
        phone: profileQuery.data.phone || "",
        email: profileQuery.data.email || "",
      });
    }
  }, [profileQuery.data, open]);

  const saveMutation = useMutation({
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
      qc.invalidateQueries({ queryKey: ["shopProfile"] });
      setTimeout(() => {
        setSaved(false);
      }, 2000);
    },
    onError: (e: Error) => {
      setError(e.message || "Failed to save profile. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.shop_name.trim()) {
      setError("Shop name is required");
      return;
    }
    saveMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-line bg-ink/95 p-6 backdrop-blur-2xl sm:rounded-3xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl border border-volt/30 bg-volt/10 text-volt">
              <Store className="size-5" />
            </div>
            <div>
              <DialogTitle className="font-display text-2xl font-bold tracking-tight text-foreground">
                Edit Shop Profile
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Update business details printed on your invoices and receipts
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4 grid gap-6 md:grid-cols-5">
          {/* Form section */}
          <form onSubmit={handleSubmit} className="space-y-4 md:col-span-3">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
                <Building2 className="size-3.5 text-volt" /> Shop Name *
              </label>
              <input
                type="text"
                required
                value={form.shop_name}
                onChange={(e) => setForm({ ...form, shop_name: e.target.value })}
                placeholder="e.g. BizFlow Retail"
                className="w-full rounded-xl border border-line bg-ink2/60 px-3.5 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-volt/60 focus:ring-1 focus:ring-volt/40"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
                <Sparkles className="size-3.5 text-volt" /> Tagline / Slogan
              </label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                placeholder="e.g. Quality Goods & Electronics"
                className="w-full rounded-xl border border-line bg-ink2/60 px-3.5 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-volt/60 focus:ring-1 focus:ring-volt/40"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
                <MapPin className="size-3.5 text-volt" /> Address
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="e.g. 12 Main Street, Colombo"
                className="w-full rounded-xl border border-line bg-ink2/60 px-3.5 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-volt/60 focus:ring-1 focus:ring-volt/40"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
                  <Phone className="size-3.5 text-volt" /> Phone
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+94 77 123 4567"
                  className="w-full rounded-xl border border-line bg-ink2/60 px-3.5 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-volt/60 focus:ring-1 focus:ring-volt/40"
                />
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-1.5 font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
                  <Mail className="size-3.5 text-volt" /> Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="contact@shop.com"
                  className="w-full rounded-xl border border-line bg-ink2/60 px-3.5 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-volt/60 focus:ring-1 focus:ring-volt/40"
                />
              </div>
            </div>

            {error ? (
              <p className="rounded-lg border border-berry/30 bg-berry/10 p-2 font-mono text-xs text-berry">
                {error}
              </p>
            ) : null}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="-skew-x-6 cursor-pointer rounded-xl bg-volt px-6 py-2.5 font-display text-sm font-bold text-ink shadow-[0_0_24px_-4px_var(--volt)] transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60"
              >
                <span className="inline-block skew-x-6">
                  {saveMutation.isPending ? "Saving..." : "Save Profile"}
                </span>
              </button>

              {saved ? (
                <div className="flex items-center gap-1.5 font-mono text-xs text-volt">
                  <Check className="size-4" />
                  <span>Saved successfully!</span>
                </div>
              ) : null}
            </div>
          </form>

          {/* Live Preview section */}
          <div className="flex flex-col justify-between rounded-2xl border border-line bg-ink2/40 p-4 backdrop-blur-md md:col-span-2">
            <div>
              <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                Invoice Header Preview
              </p>

              <div className="mt-3 rounded-xl border border-white/10 bg-ink/70 p-4 shadow-inner">
                <p className="font-display text-lg font-bold tracking-tight text-foreground truncate">
                  {form.shop_name || "Your Shop Name"}
                </p>
                <p className="font-mono text-[11px] text-volt truncate">
                  {form.tagline || "Tagline / Business Slogan"}
                </p>
                <div className="mt-3 space-y-1 font-mono text-[10px] text-muted-foreground">
                  <p className="truncate">{form.address || "Shop Address"}</p>
                  {form.phone ? <p className="truncate">Tel: {form.phone}</p> : null}
                  {form.email ? <p className="truncate">Email: {form.email}</p> : null}
                </div>
              </div>
            </div>

            <p className="mt-4 font-mono text-[10px] text-muted-foreground/70">
              Changes reflect immediately across all invoices, receipts, and system navigation headers.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
