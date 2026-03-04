BEGIN;

-- Ensure reward points is consistently available.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS reward_points integer DEFAULT 0;
UPDATE public.profiles SET reward_points = 0 WHERE reward_points IS NULL;
ALTER TABLE public.profiles ALTER COLUMN reward_points SET DEFAULT 0;

-- Canonical reviews table (legacy product_reviews is deprecated).
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

ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS is_verified_purchase BOOLEAN DEFAULT false;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS is_approved BOOLEAN NOT NULL DEFAULT true;

CREATE UNIQUE INDEX IF NOT EXISTS reviews_product_user_unique
  ON public.reviews (product_id, user_id);

DROP TABLE IF EXISTS public.product_reviews CASCADE;

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read approved reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins manage reviews" ON public.reviews;

CREATE POLICY "Public read approved reviews"
  ON public.reviews FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Users can create reviews"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON public.reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins manage reviews"
  ON public.reviews FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.update_product_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.products
  SET
    rating = (
      SELECT COALESCE(AVG(rating), 5.0)
      FROM public.reviews
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
        AND is_approved = true
    ),
    review_count = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
        AND is_approved = true
    )
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
  IF (TG_OP = 'INSERT' AND NEW.is_approved = true)
    OR (TG_OP = 'UPDATE' AND OLD.is_approved = false AND NEW.is_approved = true) THEN
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

-- Shipping methods: normalize columns, policies, trigger, and data seed.
ALTER TABLE public.shipping_methods
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.shipping_methods
  ADD COLUMN IF NOT EXISTS country_code text NOT NULL DEFAULT 'ALL';

CREATE UNIQUE INDEX IF NOT EXISTS shipping_methods_unique_method
  ON public.shipping_methods (carrier, name, country_code);

ALTER TABLE public.shipping_methods ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read shipping methods" ON public.shipping_methods;
DROP POLICY IF EXISTS "Admin CRUD shipping methods" ON public.shipping_methods;
DROP POLICY IF EXISTS "Admins manage shipping methods" ON public.shipping_methods;

CREATE POLICY "Public read shipping methods"
  ON public.shipping_methods FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins manage shipping methods"
  ON public.shipping_methods FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS update_shipping_methods_updated_at ON public.shipping_methods;
CREATE TRIGGER update_shipping_methods_updated_at
  BEFORE UPDATE ON public.shipping_methods
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.shipping_methods (name, carrier, description, price, min_order_amount, estimated_days, country_code, is_active)
VALUES
  ('USPS Ground Advantage', 'USPS', 'Reliable and affordable ground shipping', 5.99, 100.00, '3-5 business days', 'US', true),
  ('USPS Priority Mail', 'USPS', 'Fast delivery for urgent items', 12.99, 200.00, '1-3 business days', 'US', true),
  ('DHL Express International', 'DHL', 'Global express shipping', 24.99, 500.00, '3-5 business days', 'ALL', true),
  ('FedEx Ground', 'FedEx', 'Standard ground shipping', 9.99, 150.00, '4-6 business days', 'US', true)
ON CONFLICT (carrier, name, country_code)
DO UPDATE SET
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  min_order_amount = EXCLUDED.min_order_amount,
  estimated_days = EXCLUDED.estimated_days,
  is_active = EXCLUDED.is_active;

COMMIT;
