-- Add unopened/revealed flag + user-controlled slot ordering
ALTER TABLE public.user_cards
  ADD COLUMN IF NOT EXISTS revealed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS slot_position integer;

-- Allow users to update revealed + slot_position for their own cards
CREATE POLICY "Users can update own user_cards"
ON public.user_cards
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Default new cards to unrevealed when admin sends them
CREATE OR REPLACE FUNCTION public.send_random_card(target_user_id uuid, rarity_filter card_rarity)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_card_id uuid;
  v_user_card_id uuid;
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  SELECT id INTO v_card_id FROM cards WHERE rarity = rarity_filter ORDER BY random() LIMIT 1;
  IF NOT FOUND THEN RAISE EXCEPTION 'No cards of that rarity exist'; END IF;
  INSERT INTO user_cards (user_id, card_id, revealed) VALUES (target_user_id, v_card_id, false) RETURNING id INTO v_user_card_id;
  RETURN v_user_card_id;
END;
$function$;