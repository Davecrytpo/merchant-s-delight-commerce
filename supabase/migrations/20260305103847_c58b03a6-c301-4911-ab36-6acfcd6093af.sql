BEGIN;

-- Ensure reviews table is secured and normalized
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

CREATE UNIQUE INDEX IF NOT EXISTS reviews_product_user_unique
  ON public.reviews (product_id, user_id);

-- Keep product aggregates in sync with reviews
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

-- Review reward points
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

-- Purchase reward points
CREATE OR REPLACE FUNCTION public.award_purchase_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' AND NEW.user_id IS NOT NULL THEN
    UPDATE public.profiles
    SET reward_points = reward_points + GREATEST(1, FLOOR(NEW.total))
    WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_order_delivered_award_points ON public.orders;
CREATE TRIGGER on_order_delivered_award_points
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.award_purchase_points();

-- Shipping methods normalization
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

COMMIT;