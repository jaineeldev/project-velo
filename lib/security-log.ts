// Structured JSON logger for security-relevant events. Each call emits one
// JSON object per line — easy to grep locally, easy to ship to Logtail or
// Axiom or any log aggregator later without re-formatting. Never log share
// tokens, client emails, passwords, or any PII.

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
  | "comment_authorization_failed";

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
  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      level: "security",
      ...input,
    }),
  );
}
