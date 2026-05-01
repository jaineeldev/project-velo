-- Normalize legacy invoice status 'draft' to 'unpaid' so the canonical
-- vocabulary becomes the two-state (unpaid, paid) we expose in the UI.
UPDATE invoices SET status = 'unpaid' WHERE status = 'draft';

ALTER TABLE invoices
  ALTER COLUMN status SET DEFAULT 'unpaid',
  ADD CONSTRAINT invoices_status_check
    CHECK (status IN ('unpaid', 'paid'));
