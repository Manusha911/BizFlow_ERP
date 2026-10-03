CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku text NOT NULL UNIQUE,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  brand text,
  purchase_price numeric(12,2) NOT NULL DEFAULT 0,
  selling_price numeric(12,2) NOT NULL DEFAULT 0,
  quantity integer NOT NULL DEFAULT 0,
  minimum_stock integer NOT NULL DEFAULT 5,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products readable" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "products insertable" ON public.products FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "products updatable" ON public.products FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "products deletable" ON public.products FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE public.sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text NOT NULL UNIQUE,
  customer_name text NOT NULL DEFAULT 'Walk-in',
  subtotal numeric(12,2) NOT NULL DEFAULT 0,
  discount numeric(12,2) NOT NULL DEFAULT 0,
  total numeric(12,2) NOT NULL DEFAULT 0,
  payment_method text NOT NULL DEFAULT 'Cash',
  status text NOT NULL DEFAULT 'Paid',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales TO anon, authenticated;
GRANT ALL ON public.sales TO service_role;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sales readable" ON public.sales FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "sales insertable" ON public.sales FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "sales updatable" ON public.sales FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(12,2) NOT NULL DEFAULT 0,
  line_total numeric(12,2) NOT NULL DEFAULT 0
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sale_items TO anon, authenticated;
GRANT ALL ON public.sale_items TO service_role;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sale_items readable" ON public.sale_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "sale_items insertable" ON public.sale_items FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.next_invoice_number()
RETURNS text
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT 'INV-' || to_char(now(), 'YYYY') || '-' ||
    lpad(((SELECT count(*) FROM public.sales) + 1)::text, 5, '0');
$$;

INSERT INTO public.products (sku, name, category, brand, purchase_price, selling_price, quantity, minimum_stock) VALUES
 ('SKU-0042','Logitech Wireless Mouse','Computer Accessories','Logitech',3500,4500,24,5),
 ('SKU-0117','Mechanical Keyboard','Computer Accessories','Redragon',5000,6500,20,5),
 ('SKU-0203','USB-C Cable 1m','Cables','Anker',600,1000,3,8),
 ('SKU-0098','720p Webcam','Peripherals','A4Tech',6200,8000,4,6),
 ('SKU-0331','27" IPS Monitor','Displays','Dell',26000,32000,0,4),
 ('SKU-0415','SSD 1TB Drive','Storage','Kingston',19000,24000,7,4),
 ('SKU-0520','Laptop Cooling Pad','Computer Accessories','Cosmic',2200,3200,15,5),
 ('SKU-0611','Wireless Headset','Audio','JBL',7800,10500,11,4);

INSERT INTO public.sales (invoice_number, customer_name, subtotal, discount, total, payment_method, status, created_at) VALUES
 ('INV-2026-00001','Kasun Perera',15500,500,15000,'Cash','Paid', now() - interval '2 hours'),
 ('INV-2026-00002','Nadeesha Silva',12500,0,12500,'Card','Paid', now() - interval '1 day'),
 ('INV-2026-00003','Rohan Fernando',26000,0,26000,'Transfer','Pending', now() - interval '3 days');

INSERT INTO public.sale_items (sale_id, product_id, product_name, quantity, unit_price, line_total)
SELECT s.id, p.id, p.name, 2, p.selling_price, p.selling_price * 2
FROM public.sales s JOIN public.products p ON p.sku = 'SKU-0117'
WHERE s.invoice_number = 'INV-2026-00001';

INSERT INTO public.sale_items (sale_id, product_id, product_name, quantity, unit_price, line_total)
SELECT s.id, p.id, p.name, 1, p.selling_price, p.selling_price
FROM public.sales s JOIN public.products p ON p.sku = 'SKU-0203'
WHERE s.invoice_number = 'INV-2026-00001';

INSERT INTO public.sale_items (sale_id, product_id, product_name, quantity, unit_price, line_total)
SELECT s.id, p.id, p.name, 1, p.selling_price, p.selling_price
FROM public.sales s JOIN public.products p ON p.sku = 'SKU-0098'
WHERE s.invoice_number = 'INV-2026-00002';

INSERT INTO public.sale_items (sale_id, product_id, product_name, quantity, unit_price, line_total)
SELECT s.id, p.id, p.name, 1, p.selling_price, p.selling_price
FROM public.sales s JOIN public.products p ON p.sku = 'SKU-0415'
WHERE s.invoice_number = 'INV-2026-00003';