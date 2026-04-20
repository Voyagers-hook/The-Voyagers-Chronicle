
-- Drop challenges table (no longer needed)
DROP TABLE IF EXISTS public.challenges;

-- Add stat columns to cards
ALTER TABLE public.cards 
  ADD COLUMN IF NOT EXISTS power integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stealth integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS beauty integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS energy integer NOT NULL DEFAULT 0;

-- Profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  display_name text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles viewable by authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Trigger for updated_at on profiles
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- User cards collection (allows duplicates of same card)
CREATE TABLE public.user_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  card_id uuid NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  obtained_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view all user cards" ON public.user_cards FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert user cards" ON public.user_cards FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete user cards" ON public.user_cards FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update user cards" ON public.user_cards FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_user_cards_user_id ON public.user_cards(user_id);
CREATE INDEX idx_user_cards_card_id ON public.user_cards(card_id);

-- Catch submissions
CREATE TABLE public.catch_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  photo_url text,
  species text NOT NULL,
  weight text,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Validation trigger instead of CHECK constraint for status
CREATE OR REPLACE FUNCTION public.validate_catch_submission_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status NOT IN ('pending', 'approved', 'rejected') THEN
    RAISE EXCEPTION 'Invalid status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_catch_status
  BEFORE INSERT OR UPDATE ON public.catch_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_catch_submission_status();

ALTER TABLE public.catch_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own submissions" ON public.catch_submissions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create submissions" ON public.catch_submissions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all submissions" ON public.catch_submissions FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update submissions" ON public.catch_submissions FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_catch_submissions_updated_at BEFORE UPDATE ON public.catch_submissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trade offers
CREATE TABLE public.trade_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid NOT NULL,
  to_user_id uuid NOT NULL,
  offered_card_id uuid NOT NULL REFERENCES public.user_cards(id) ON DELETE CASCADE,
  requested_card_id uuid NOT NULL REFERENCES public.user_cards(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Validation trigger for trade status
CREATE OR REPLACE FUNCTION public.validate_trade_offer_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status NOT IN ('pending', 'accepted', 'declined', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_trade_status
  BEFORE INSERT OR UPDATE ON public.trade_offers
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_trade_offer_status();

ALTER TABLE public.trade_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trades" ON public.trade_offers FOR SELECT TO authenticated USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
CREATE POLICY "Users can create trades" ON public.trade_offers FOR INSERT TO authenticated WITH CHECK (auth.uid() = from_user_id);
CREATE POLICY "Users can update trades they are in" ON public.trade_offers FOR UPDATE TO authenticated USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
CREATE POLICY "Admins can view all trades" ON public.trade_offers FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_trade_offers_updated_at BEFORE UPDATE ON public.trade_offers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for catch photos
INSERT INTO storage.buckets (id, name, public) VALUES ('catch-photos', 'catch-photos', true) ON CONFLICT DO NOTHING;

CREATE POLICY "Users can upload catch photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'catch-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Catch photos are viewable" ON storage.objects FOR SELECT USING (bucket_id = 'catch-photos');

-- Leaderboard function
CREATE OR REPLACE FUNCTION public.get_leaderboard()
RETURNS TABLE(user_id uuid, display_name text, total_power bigint, total_stealth bigint, total_beauty bigint, total_energy bigint, total_cards bigint, total_score bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.user_id,
    p.display_name,
    COALESCE(SUM(c.power), 0) as total_power,
    COALESCE(SUM(c.stealth), 0) as total_stealth,
    COALESCE(SUM(c.beauty), 0) as total_beauty,
    COALESCE(SUM(c.energy), 0) as total_energy,
    COUNT(uc.id) as total_cards,
    COALESCE(SUM(c.power), 0) + COALESCE(SUM(c.stealth), 0) + COALESCE(SUM(c.beauty), 0) + COALESCE(SUM(c.energy), 0) as total_score
  FROM public.profiles p
  LEFT JOIN public.user_cards uc ON uc.user_id = p.user_id
  LEFT JOIN public.cards c ON c.id = uc.card_id
  GROUP BY p.user_id, p.display_name
  ORDER BY total_score DESC
$$;

-- Accept trade function (atomic swap)
CREATE OR REPLACE FUNCTION public.accept_trade(trade_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_trade trade_offers;
BEGIN
  SELECT * INTO v_trade FROM trade_offers WHERE id = trade_id AND status = 'pending';
  IF NOT FOUND THEN RAISE EXCEPTION 'Trade not found or not pending'; END IF;
  IF auth.uid() != v_trade.to_user_id THEN RAISE EXCEPTION 'Not authorized'; END IF;
  
  -- Swap ownership
  UPDATE user_cards SET user_id = v_trade.to_user_id WHERE id = v_trade.offered_card_id;
  UPDATE user_cards SET user_id = v_trade.from_user_id WHERE id = v_trade.requested_card_id;
  
  -- Mark trade as accepted
  UPDATE trade_offers SET status = 'accepted', updated_at = now() WHERE id = trade_id;
END;
$$;

-- Send random card function (admin only)
CREATE OR REPLACE FUNCTION public.send_random_card(target_user_id uuid, rarity_filter card_rarity)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_card_id uuid;
  v_user_card_id uuid;
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  
  SELECT id INTO v_card_id FROM cards WHERE rarity = rarity_filter ORDER BY random() LIMIT 1;
  IF NOT FOUND THEN RAISE EXCEPTION 'No cards of that rarity exist'; END IF;
  
  INSERT INTO user_cards (user_id, card_id) VALUES (target_user_id, v_card_id) RETURNING id INTO v_user_card_id;
  
  RETURN v_user_card_id;
END;
$$;
