ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS last_contacted_at timestamptz;

CREATE INDEX IF NOT EXISTS clients_last_contacted_at_idx
  ON clients (last_contacted_at DESC NULLS LAST);
