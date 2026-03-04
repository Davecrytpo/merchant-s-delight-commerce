
-- Add reward_points column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS reward_points integer NOT NULL DEFAULT 0;

-- Add discount column to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount numeric NOT NULL DEFAULT 0;

-- Create trigger to award points on order completion
CREATE OR REPLACE FUNCTION public.award_purchase_points()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Award 1 point per dollar spent when order status changes to 'delivered'
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

-- Legacy cleanup: review points are handled on public.reviews by the
-- on_review_approved_award_points trigger in later schema migrations.
DO $$
BEGIN
  IF to_regclass('public.product_reviews') IS NOT NULL THEN
    EXECUTE 'DROP TRIGGER IF EXISTS on_review_created_award_points ON public.product_reviews';
  END IF;
END $$;

DROP FUNCTION IF EXISTS public.award_review_points();
