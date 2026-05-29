-- Profile picture pointer. Stores the Vercel Blob pathname (e.g.
-- 'avatars/user_abc123/1717049200000.png'), not a fully-qualified URL.
-- Pathname is the stable handle we need for both:
--   * del(pathname) to remove the old blob when the user uploads a new one,
--   * issueSignedToken + presignUrl to mint short-lived signed GET URLs for
--     display on every page load.
-- The column is named avatar_url to match the conventional surface name in
-- code (the API responses return signed URLs), but internally we treat the
-- value as the blob pathname.

ALTER TABLE user_profiles
  ADD COLUMN avatar_url text;
