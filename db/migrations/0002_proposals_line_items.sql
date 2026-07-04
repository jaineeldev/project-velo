ALTER TABLE proposals
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS deposit_percentage numeric(5,2) NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS line_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity numeric(10,2) NOT NULL DEFAULT 1,
  unit_price numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
