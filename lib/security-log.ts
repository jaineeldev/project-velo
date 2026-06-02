// Structured JSON logger for security-relevant events. Each call emits one
// JSON object per line (easy to grep locally, easy to ship to Logtail or
// Axiom or any log aggregator later without re-formatting) AND inserts a
// row into security_events so the operator admin panel can query it.
//
// Never log share tokens, client emails, passwords, or any PII.

import { sql } from "@/lib/db";

export type SecurityEventType =
  | "invalid_share_token"
  | "validation_failed"
  | "webhook_signature_invalid"
  | "webhook_user_data_invalid"
  | "pdf_download"
  | "rate_limit_blocked"
  | "account_deleted"
  | "clerk_delete_failed"
  | "auth_failed"
  | "client_role_finalize_invalid"
  | "comment_authorization_failed"
  | "admin_access_denied"
  | "admin_export"
  | "admin_account_suspended"
  | "admin_account_unsuspended"
  | "notification_failed";

export type SecurityOutcome = "success" | "failure" | "denied";

export type SecurityLogInput = {
  event: SecurityEventType;
  route: string;
  ip?: string;
  outcome: SecurityOutcome;
  reason?: string;
  // Allowed: opaque IDs, status codes, counts. NOT allowed: tokens, emails,
  // names, message bodies, anything supplied by a client.
  meta?: Record<string, string | number | boolean>;
};

export function logSecurityEvent(input: SecurityLogInput): void {
  const ts = new Date().toISOString();
  console.log(
    JSON.stringify({
      ts,
      level: "security",
      ...input,
    }),
  );

  // Fire-and-forget DB write. The request path never awaits this: if Neon
  // is slow or unreachable, stdout (captured by Vercel logs) is still the
  // record. Swallowing the rejection prevents an unhandled promise from
  // crashing the worker.
  void sql`
    INSERT INTO security_events
      (created_at, level, event_type, route, ip, outcome, reason, metadata)
    VALUES (
      ${ts},
      'security',
      ${input.event},
      ${input.route},
      ${input.ip ?? null},
      ${input.outcome},
      ${input.reason ?? null},
      ${JSON.stringify(input.meta ?? {})}::jsonb
    )
  `.catch((err) => {
    console.log(
      JSON.stringify({
        ts: new Date().toISOString(),
        level: "error",
        event: "security_log_db_write_failed",
        original_event: input.event,
        reason: err instanceof Error ? err.message : "unknown",
      }),
    );
  });
}
