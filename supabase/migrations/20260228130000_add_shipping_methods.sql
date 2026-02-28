-- Shipping Methods Table
CREATE TABLE IF NOT EXISTS public.shipping_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  carrier TEXT NOT NULL, -- e.g., 'FedEx', 'DHL', 'USPS'
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  min_order_amount NUMERIC(10,2) DEFAULT 0,
  estimated_days TEXT, -- e.g., '3-5 business days'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.shipping_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read shipping methods" ON public.shipping_methods FOR SELECT USING (is_active = true);
CREATE POLICY "Admin CRUD shipping methods" ON public.shipping_methods 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true));

-- Update trigger
CREATE TRIGGER update_shipping_methods_updated_at BEFORE UPDATE ON public.shipping_methods FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed Data for Standard Carriers
INSERT INTO public.shipping_methods (name, carrier, description, price, min_order_amount, estimated_days) VALUES 
('Standard Ground', 'FedEx', 'Reliable door-to-door delivery', 9.99, 100.00, '5-7 business days'),
('Express Saver', 'DHL', 'Faster delivery for urgent items', 19.99, 500.00, '2-3 business days'),
('Priority Overnight', 'FedEx', 'Next business day delivery', 35.00, 1000.00, '1 business day')
ON CONFLICT DO NOTHING;
