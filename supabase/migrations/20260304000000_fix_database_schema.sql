
-- Cleanup conflicting tables
DROP TABLE IF EXISTS public.product_reviews CASCADE;

-- Ensure reviews table has correct columns and references
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT true,
  is_verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, user_id)
);

-- Ensure profiles has reward_points
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS reward_points INTEGER DEFAULT 0;

-- Add country_code to shipping_methods
ALTER TABLE public.shipping_methods ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT 'ALL';

-- Seed refined shipping methods
DELETE FROM public.shipping_methods;
INSERT INTO public.shipping_methods (name, carrier, description, price, min_order_amount, estimated_days, country_code) VALUES 
('USPS Ground Advantage', 'USPS', 'Reliable and affordable ground shipping', 5.99, 100.00, '3-5 business days', 'US'),
('USPS Priority Mail', 'USPS', 'Fast delivery for urgent items', 12.99, 200.00, '1-3 business days', 'US'),
('DHL Express International', 'DHL', 'Global express shipping', 24.99, 500.00, '3-5 business days', 'ALL'),
('FedEx Ground', 'FedEx', 'Standard ground shipping', 9.99, 150.00, '4-6 business days', 'US');

-- Ensure triggers are correctly set up
CREATE OR REPLACE FUNCTION public.update_product_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.products
  SET 
    rating = (SELECT COALESCE(AVG(rating), 5.0) FROM public.reviews WHERE product_id = COALESCE(NEW.product_id, OLD.product_id) AND is_approved = true),
    review_count = (SELECT COUNT(*) FROM public.reviews WHERE product_id = COALESCE(NEW.product_id, OLD.product_id) AND is_approved = true)
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS on_review_change ON public.reviews;
CREATE TRIGGER on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_product_rating();

CREATE OR REPLACE FUNCTION public.award_points_for_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.is_approved = true) OR (TG_OP = 'UPDATE' AND OLD.is_approved = false AND NEW.is_approved = true) THEN
    UPDATE public.profiles
    SET reward_points = COALESCE(reward_points, 0) + 50
    WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_review_approved_award_points ON public.reviews;
CREATE TRIGGER on_review_approved_award_points
  AFTER INSERT OR UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.award_points_for_review();
