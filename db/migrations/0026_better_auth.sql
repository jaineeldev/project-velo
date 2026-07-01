-- Migrate auth from Clerk to Better Auth. See CLAUDE.md §12 for the full plan.
--
-- DESTRUCTIVE. This migration TRUNCATEs users (and cascades through clients,
-- proposals, projects, invoices, user_profiles, and every downstream FK
-- child). Chosen path B per §12.1 — Velo is pre-beta and invite-only, so
-- there are no production users to preserve. Do NOT run against a database
-- with real users.
--
-- users.clerk_id is intentionally kept (nullable) for the rollback window.
-- The follow-up migration 0027_drop_clerk_id.sql removes it after 7 days
-- of prod stability on Better Auth.

TRUNCATE TABLE users RESTART IDENTITY CASCADE;

ALTER TABLE users ALTER COLUMN clerk_id DROP NOT NULL;
ALTER TABLE users ALTER COLUMN name SET DEFAULT '';
ALTER TABLE users ALTER COLUMN name SET NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified boolean NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS image text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled boolean NOT NULL DEFAULT false;

CREATE TABLE session (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expires_at timestamptz NOT NULL,
  token text NOT NULL UNIQUE,
  ip_address text,
  user_agent text,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX session_user_id_idx ON session (user_id);

CREATE TABLE account (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id text NOT NULL,
  provider_id text NOT NULL,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  access_token text,
  refresh_token text,
  id_token text,
  access_token_expires_at timestamptz,
  refresh_token_expires_at timestamptz,
  scope text,
  password text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX account_user_id_idx ON account (user_id);

CREATE TABLE verification (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  value text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX verification_identifier_idx ON verification (identifier);

CREATE TABLE two_factor (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  secret text NOT NULL,
  backup_codes text NOT NULL,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  verified boolean NOT NULL DEFAULT true,
  failed_verification_count integer NOT NULL DEFAULT 0,
  locked_until timestamptz
);

CREATE INDEX two_factor_secret_idx ON two_factor (secret);
CREATE INDEX two_factor_user_id_idx ON two_factor (user_id);
