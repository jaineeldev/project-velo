ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS clients_tags_idx ON clients USING gin (tags);
