
-- Create shipping_methods table
CREATE TABLE public.shipping_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier text NOT NULL,
  name text NOT NULL,
  description text,
  price numeric NOT NULL DEFAULT 0,
  estimated_days text,
  min_order_amount numeric,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.shipping_methods ENABLE ROW LEVEL SECURITY;

-- Everyone can read active shipping methods
CREATE POLICY "Public read shipping methods"
  ON public.shipping_methods FOR SELECT
  USING (true);

-- Admins can manage
CREATE POLICY "Admins manage shipping methods"
  ON public.shipping_methods FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Seed default shipping methods
INSERT INTO public.shipping_methods (carrier, name, description, price, estimated_days, min_order_amount) VALUES
  ('DHL', 'Express', 'International express delivery', 14.99, '2-4 business days', 200),
  ('DHL', 'Standard', 'International standard shipping', 9.99, '5-8 business days', NULL),
  ('FedEx', 'Priority', 'Express priority shipping', 19.99, '1-3 business days', NULL),
  ('FedEx', 'Ground', 'Ground shipping', 7.99, '5-7 business days', 150),
  ('UPS', 'Express Saver', 'UPS express saver', 12.99, '3-5 business days', NULL),
  ('UPS', 'Ground', 'Economical ground shipping', 5.99, '7-10 business days', 100);
