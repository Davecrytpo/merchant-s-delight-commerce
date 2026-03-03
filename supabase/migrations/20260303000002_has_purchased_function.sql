
-- Function to check if a user has purchased a specific product
CREATE OR REPLACE FUNCTION public.has_purchased_product(user_uuid uuid, product_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.orders 
    WHERE user_id = user_uuid 
    AND status = 'completed'
    AND items @> jsonb_build_array(jsonb_build_object('product_id', product_uuid))
  );
END;
$$;
