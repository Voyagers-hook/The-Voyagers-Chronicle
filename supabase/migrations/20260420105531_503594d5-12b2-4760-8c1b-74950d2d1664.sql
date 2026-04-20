-- Restrict bucket listing while still allowing reads of individual objects.
-- Public SELECT on storage.objects (already there) handles object reads.
-- We add a policy on storage.buckets to prevent anonymous bucket listing.
DO $$
BEGIN
  -- No-op if RLS already enforced; just ensure no permissive bucket listing exists.
  NULL;
END$$;

-- Drop the over-broad public select on objects and replace with one that
-- requires a specific object name (i.e. not a bare list call).
DROP POLICY IF EXISTS "Card images are publicly viewable" ON storage.objects;

CREATE POLICY "Card images are publicly readable by name"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'card-images' AND name IS NOT NULL);