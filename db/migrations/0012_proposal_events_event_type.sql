-- Adds the `event_type` column to proposal_events that the application code
-- has been writing since the change-request feature shipped. Earlier envs had
-- this column applied by hand; this migration brings every environment into
-- alignment with the schema the app actually expects.
--
-- Values written by the codebase today:
--   created, edited, sent, email_sent, email_failed, email_skipped,
--   reset_to_draft, approved, changes_requested,
--   change_request_approved, change_request_declined
--
-- The column is nullable so the bootstrap migration runner can backfill into
-- environments that already have data without a NOT NULL violation.
ALTER TABLE proposal_events
  ADD COLUMN IF NOT EXISTS event_type text;
