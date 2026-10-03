CREATE TABLE public.shop_profile (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  shop_name text NOT NULL DEFAULT 'BizFlow Retail',
  tagline text NOT NULL DEFAULT 'Small Business ERP',
  address text NOT NULL DEFAULT 'Colombo, Sri Lanka',
  phone text,
  email text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE ON public.shop_profile TO anon, authenticated;
GRANT ALL ON public.shop_profile TO service_role;

ALTER TABLE public.shop_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shop_profile readable by all"
  ON public.shop_profile FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "shop_profile updatable"
  ON public.shop_profile FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

INSERT INTO public.shop_profile (id) VALUES (1);