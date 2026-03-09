-- Create a function to trigger the return-notification Edge Function
CREATE OR REPLACE FUNCTION public.trigger_return_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger if status has changed
  IF OLD.status <> NEW.status THEN
    PERFORM
      net.http_post(
        url := current_setting('app.settings.edge_function_url') || '/return-notification',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', current_setting('app.settings.service_role_key')
        ),
        body := jsonb_build_object(
          'return_id', NEW.id,
          'return_request_id', NEW.return_request_id,
          'order_number', NEW.order_number,
          'user_id', NEW.user_id,
          'old_status', OLD.status,
          'new_status', NEW.status,
          'resolution', NEW.resolution
        )
      );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_return_status_change ON public.return_requests;
CREATE TRIGGER on_return_status_change
  AFTER UPDATE ON public.return_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_return_notification();
