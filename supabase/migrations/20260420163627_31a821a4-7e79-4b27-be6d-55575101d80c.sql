-- Add super_rare to the card_rarity enum
ALTER TYPE public.card_rarity ADD VALUE IF NOT EXISTS 'super_rare' AFTER 'legendary';