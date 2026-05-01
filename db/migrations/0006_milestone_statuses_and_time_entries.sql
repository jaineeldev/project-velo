-- Normalize legacy milestone status 'pending' to 'not_started' so the new
-- three-state vocabulary (not_started, in_progress, completed) is the only
-- one in use. Existing approval flow already inserts 'pending' rows, so we
-- update both the data and (in a follow-up) the insertion site.
UPDATE milestones SET status = 'not_started' WHERE status = 'pending';

ALTER TABLE milestones
  ALTER COLUMN status SET DEFAULT 'not_started',
  ADD CONSTRAINT milestones_status_check
    CHECK (status IN ('not_started', 'in_progress', 'completed'));

CREATE TABLE time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  description text NOT NULL,
  hours numeric(6,2) NOT NULL CHECK (hours > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX time_entries_project_id_idx ON time_entries(project_id);
