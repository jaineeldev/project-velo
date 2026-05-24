-- Distinguishes the two account shapes the product supports.
--
--   agency : the operator using the app to send proposals and run projects.
--            This is the historical default and matches every existing row,
--            so the column defaults to 'agency' and the backfill is a no-op.
--
--   client : a counterparty who landed on a proposal share link and chose
--            to create an account from it. They never see the agency
--            dashboard; their UI is scoped to proposals shared with them.
--
-- Source of truth is this column. Clerk publicMetadata.role is kept in
-- sync from the webhook so middleware/route guards can read it without a
-- DB hit, but if the two ever disagree, the DB wins.
ALTER TABLE user_profiles
  ADD COLUMN role text NOT NULL DEFAULT 'agency'
  CHECK (role IN ('agency', 'client'));
