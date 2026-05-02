-- One profile row per user. Created lazily — getUserProfile returns nulls
-- for a user with no row yet. UNIQUE on user_id enforces 1:1.
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  business_name text,
  abn text,
  street text,
  city text,
  state text,
  postcode text,
  phone text,
  website text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
