-- Health records are owned by Supabase auth users.
-- The previous FK depended on public.profiles existing first, which can fail for
-- users created before the profile trigger or when profile creation is delayed.

ALTER TABLE public.health_records
  DROP CONSTRAINT IF EXISTS health_records_user_id_fkey;

ALTER TABLE public.health_records
  ADD CONSTRAINT health_records_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;
