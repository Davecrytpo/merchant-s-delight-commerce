
-- Create shipping_methods table
CREATE TABLE IF NOT EXISTS public.shipping_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier text NOT NULL,
  name text NOT NULL,
  description text,
  price numeric NOT NULL DEFAULT 0,
  estimated_days text,
  min_order_amount numeric,
  is_active boolean NOT NULL DEFAULT true,
  country_code text NOT NULL DEFAULT 'ALL',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.shipping_methods ENABLE ROW LEVEL SECURITY;

-- Replace legacy policies with canonical role-based policies.
DROP POLICY IF EXISTS "Public read shipping methods" ON public.shipping_methods;
DROP POLICY IF EXISTS "Admin CRUD shipping methods" ON public.shipping_methods;
DROP POLICY IF EXISTS "Admins manage shipping methods" ON public.shipping_methods;

-- Everyone can read active shipping methods
CREATE POLICY "Public read shipping methods"
  ON public.shipping_methods FOR SELECT
  USING (is_active = true);

-- Admins can manage
CREATE POLICY "Admins manage shipping methods"
  ON public.shipping_methods FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS update_shipping_methods_updated_at ON public.shipping_methods;
CREATE TRIGGER update_shipping_methods_updated_at
  BEFORE UPDATE ON public.shipping_methods
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE UNIQUE INDEX IF NOT EXISTS shipping_methods_unique_method
  ON public.shipping_methods (carrier, name, country_code);

-- Seed default shipping methods
INSERT INTO public.shipping_methods (carrier, name, description, price, estimated_days, min_order_amount, country_code) VALUES
  ('DHL', 'Express', 'International express delivery', 14.99, '2-4 business days', 200, 'ALL'),
  ('DHL', 'Standard', 'International standard shipping', 9.99, '5-8 business days', NULL, 'ALL'),
  ('FedEx', 'Priority', 'Express priority shipping', 19.99, '1-3 business days', NULL, 'US'),
  ('FedEx', 'Ground', 'Ground shipping', 7.99, '5-7 business days', 150, 'US'),
  ('UPS', 'Express Saver', 'UPS express saver', 12.99, '3-5 business days', NULL, 'US'),
  ('UPS', 'Ground', 'Economical ground shipping', 5.99, '7-10 business days', 100, 'US')
ON CONFLICT (carrier, name, country_code) DO NOTHING;
