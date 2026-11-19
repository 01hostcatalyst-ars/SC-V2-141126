-- Additive migration: existing users, contracts, and Google identities are preserved.
BEGIN;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS better_auth_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS users_better_auth_id_key ON public.users (better_auth_id);
COMMIT;
