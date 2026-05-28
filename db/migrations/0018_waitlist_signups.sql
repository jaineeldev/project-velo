-- Public marketing waitlist. One row per email; second submissions from the
-- same address are a no-op via ON CONFLICT, so the form looks idempotent
-- from the visitor's side. The notification email to the support inbox is
-- best-effort on top of this row; this table is the canonical record used
-- to build the launch broadcast list.
--
-- `ip` is nullable because reverse proxies can mangle it. It's stored only
-- for rate-limit forensics, never surfaced.
-- `unsubscribed_at` is set if a recipient opts out later. A re-submission
-- from the same email clears it (re-subscribe).

CREATE TABLE waitlist_signups (
  email text PRIMARY KEY,
  ip text,
  created_at timestamptz NOT NULL DEFAULT now(),
  unsubscribed_at timestamptz
);

CREATE INDEX waitlist_signups_created_at_idx
  ON waitlist_signups (created_at);
