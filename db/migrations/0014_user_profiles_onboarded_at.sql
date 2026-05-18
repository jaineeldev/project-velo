-- Tracks whether a user has been through the new-user onboarding flow.
-- NULL = hasn't seen it yet, redirect them to /onboarding on next dashboard
-- visit. NON-NULL = either completed or skipped, never show again.
ALTER TABLE user_profiles ADD COLUMN onboarded_at timestamptz;

-- Backfill: every existing profile row predates this flow, so treat the
-- owner as already-onboarded. We use updated_at as a sensible historical
-- anchor rather than now() so the value reflects when the row was last touched.
UPDATE user_profiles SET onboarded_at = updated_at WHERE onboarded_at IS NULL;

-- Backfill: users who never created a profile row also predate this flow.
-- Create a stub row with onboarded_at set so they don't get pushed through
-- the welcome screen the next time they log in.
INSERT INTO user_profiles (user_id, onboarded_at)
SELECT id, now() FROM users
WHERE id NOT IN (SELECT user_id FROM user_profiles)
