-- Track agency response to each client change request. Existing rows
-- default to 'pending' so the new project-page section picks them up.
ALTER TABLE change_requests
  ADD COLUMN status text NOT NULL DEFAULT 'pending',
  ADD COLUMN response_note text,
  ADD COLUMN responded_at timestamptz,
  ADD CONSTRAINT change_requests_status_check
    CHECK (status IN ('pending', 'approved', 'rejected'));
