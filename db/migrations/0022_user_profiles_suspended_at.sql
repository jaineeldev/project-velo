-- Operator-only suspension flag. When non-null, the user is blocked from
-- the agency and client surfaces and is redirected to /suspended. The
-- admin user-detail page sets and clears this from suspend/unsuspend
-- buttons; both actions also write to security_events.
--
-- A timestamp (not a boolean) so the operator can see when the suspension
-- was applied without having to cross-reference security_events.

ALTER TABLE user_profiles
  ADD COLUMN suspended_at timestamptz;
