
CREATE TABLE public.gift_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  initial_balance numeric NOT NULL DEFAULT 0,
  current_balance numeric NOT NULL DEFAULT 0,
  purchaser_id uuid,
  recipient_email text,
  recipient_name text,
  message text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  redeemed_by uuid
);

ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can validate gift cards" ON public.gift_cards
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can create gift cards" ON public.gift_cards
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = purchaser_id);

CREATE POLICY "Admins manage gift cards" ON public.gift_cards
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can redeem gift cards" ON public.gift_cards
  FOR UPDATE TO authenticated
  USING (is_active = true AND current_balance > 0);
