
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

-- Create trigger to award points on review submission
CREATE OR REPLACE FUNCTION public.award_review_points()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Award 50 points per review
  UPDATE public.profiles
  SET reward_points = reward_points + 50
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_review_created_award_points ON public.product_reviews;
CREATE TRIGGER on_review_created_award_points
  AFTER INSERT ON public.product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.award_review_points();
