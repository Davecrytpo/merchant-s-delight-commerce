
-- Function to award points
CREATE OR REPLACE FUNCTION public.award_reward_points(user_uuid uuid, points integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET reward_points = COALESCE(reward_points, 0) + points
  WHERE user_id = user_uuid;
END;
$$;

-- Function to deduct points
CREATE OR REPLACE FUNCTION public.deduct_reward_points(user_uuid uuid, points integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET reward_points = GREATEST(0, COALESCE(reward_points, 0) - points)
  WHERE user_id = user_uuid;
END;
$$;
