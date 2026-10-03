import { supabase } from "@/integrations/supabase/client";

export type Product = {
  id: string;
  sku: string;
  name: string;
  category: string;
  brand: string | null;
  purchase_price: number;
  selling_price: number;
  quantity: number;
  minimum_stock: number;
  created_at: string;
};

export type Sale = {
  id: string;
  invoice_number: string;
  customer_name: string;
  subtotal: number;
  discount: number;
  total: number;
  payment_method: string;
  status: string;
  created_at: string;
};

export type SaleItem = {
  id: string;
  sale_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
};

export const rs = (value: number) =>
  `Rs. ${Math.round(Number(value) || 0).toLocaleString("en-LK")}`;

export const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const stockState = (p: Product) =>
  p.quantity <= 0 ? "out" : p.quantity < p.minimum_stock ? "low" : "ok";

export async function fetchProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("name");
  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function fetchSales() {
  const { data, error } = await supabase
    .from("sales")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Sale[];
}

export async function fetchSaleWithItems(id: string) {
  const [saleRes, itemsRes] = await Promise.all([
    supabase.from("sales").select("*").eq("id", id).maybeSingle(),
    supabase.from("sale_items").select("*").eq("sale_id", id),
  ]);
  if (saleRes.error) throw saleRes.error;
  if (itemsRes.error) throw itemsRes.error;
  return {
    sale: saleRes.data as Sale | null,
    items: (itemsRes.data ?? []) as SaleItem[],
  };
}

export type CartLine = {
  product: Product;
  quantity: number;
};

export async function completeSale(input: {
  customerName: string;
  paymentMethod: string;
  discount: number;
  lines: CartLine[];
}) {
  const subtotal = input.lines.reduce(
    (sum, l) => sum + Number(l.product.selling_price) * l.quantity,
    0,
  );
  const discount = Math.min(Math.max(input.discount || 0, 0), subtotal);
  const total = subtotal - discount;

  const { data: invoiceNumber, error: invErr } = await supabase.rpc(
    "next_invoice_number",
  );
  if (invErr) throw invErr;

  const { data: sale, error: saleErr } = await supabase
    .from("sales")
    .insert({
      invoice_number: invoiceNumber as string,
      customer_name: input.customerName.trim() || "Walk-in",
      payment_method: input.paymentMethod,
      subtotal,
      discount,
      total,
      status: "Paid",
    })
    .select()
    .single();
  if (saleErr) throw saleErr;

  const { error: itemsErr } = await supabase.from("sale_items").insert(
    input.lines.map((l) => ({
      sale_id: sale.id,
      product_id: l.product.id,
      product_name: l.product.name,
      quantity: l.quantity,
      unit_price: Number(l.product.selling_price),
      line_total: Number(l.product.selling_price) * l.quantity,
    })),
  );
  if (itemsErr) throw itemsErr;

  // Reduce inventory for each sold product.
  await Promise.all(
    input.lines.map((l) =>
      supabase
        .from("products")
        .update({ quantity: Math.max(l.product.quantity - l.quantity, 0) })
        .eq("id", l.product.id),
    ),
  );

  return sale as Sale;
}

export type ShopProfile = {
  id: number;
  shop_name: string;
  tagline: string;
  address: string;
  phone: string | null;
  email: string | null;
  updated_at: string;
};

export async function fetchShopProfile() {
  const { data, error } = await supabase
    .from("shop_profile")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw error;
  return data as ShopProfile | null;
}

export async function updateShopProfile(input: {
  shop_name: string;
  tagline: string;
  address: string;
  phone: string | null;
  email: string | null;
}) {
  const { data, error } = await supabase
    .from("shop_profile")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", 1)
    .select()
    .single();
  if (error) throw error;
  return data as ShopProfile;
}
