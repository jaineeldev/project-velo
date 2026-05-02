-- Add a public share token to projects so the client portal can be opened
-- without auth. 32 random bytes encoded as hex matches the existing
-- proposal share-token shape (64 hex chars => 256 bits of entropy).
ALTER TABLE projects ADD COLUMN share_token text;

UPDATE projects
SET share_token = encode(gen_random_bytes(32), 'hex')
WHERE share_token IS NULL;

ALTER TABLE projects
  ALTER COLUMN share_token SET NOT NULL,
  ADD CONSTRAINT projects_share_token_unique UNIQUE (share_token);
