-- Per-user toggle for operator notifications (proposal viewed, approved,
-- changes requested, change-request submitted). Defaults true so existing
-- profiles opt in automatically. The future settings UI will flip this off.
-- Read by lib/notifications.ts:sendOperatorNotification before every send.

ALTER TABLE user_profiles
  ADD COLUMN notifications_enabled boolean NOT NULL DEFAULT true;
