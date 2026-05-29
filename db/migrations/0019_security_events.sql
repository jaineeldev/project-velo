-- Persisted mirror of lib/security-log.ts. The logger keeps writing one JSON
-- line per event to stdout (Vercel + any log aggregator we add later still
-- get a copy), and now also inserts a row here so the operator admin panel
-- can filter and paginate without piping log streams.
--
-- The DB write is fire-and-forget from the logger: stdout stays the source
-- of last resort. If Neon is unreachable when an event fires, the request
-- path is unaffected and the JSON line is still captured by Vercel logs.
--
-- No FK on user-shaped fields. Events fire from contexts that have either a
-- Clerk user id (string like 'user_xxx'), an internal users.id (uuid), or
-- no user at all (rate_limit_blocked, invalid_share_token). Any user context
-- the caller wants to attach goes into metadata.

CREATE TABLE security_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  level text NOT NULL DEFAULT 'security',
  event_type text NOT NULL,
  route text NOT NULL,
  ip text,
  outcome text NOT NULL CHECK (outcome IN ('success', 'failure', 'denied')),
  reason text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX security_events_created_at_idx
  ON security_events (created_at DESC);

CREATE INDEX security_events_event_type_idx
  ON security_events (event_type);

CREATE INDEX security_events_outcome_idx
  ON security_events (outcome);
