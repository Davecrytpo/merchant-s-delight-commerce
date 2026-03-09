
CREATE TABLE public.return_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  order_number text NOT NULL,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  reason text NOT NULL,
  reason_detail text,
  resolution text NOT NULL DEFAULT 'refund',
  return_request_id text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  shipping_address text,
  estimated_processing_days integer DEFAULT 7,
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.return_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own returns" ON public.return_requests
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create returns" ON public.return_requests
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins manage returns" ON public.return_requests
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all returns" ON public.return_requests
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_return_requests_updated_at
  BEFORE UPDATE ON public.return_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Notify admin on new return
CREATE OR REPLACE FUNCTION public.notify_admin_new_return()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.admin_notifications (title, message, type, link)
  VALUES (
    'New Return Request',
    'Return #' || NEW.return_request_id || ' for order #' || NEW.order_number,
    'return',
    '/admin/returns'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_return_notify_admin
  AFTER INSERT ON public.return_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_new_return();
