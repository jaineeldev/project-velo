import { Resend } from "resend";
import { sql } from "@/lib/db";
import { sendDevEmailDeliveryFailure } from "@/lib/email";
import { logSecurityEvent } from "@/lib/security-log";

// TODO: switch to a branded sender once the velo.dev domain is verified
// in Resend. Until then, onboarding@resend.dev is the only sender that
// will actually deliver in test mode (Resend restricts it to the account
// owner's address, which is fine for the private beta).
const OPERATOR_FROM_ADDRESS = "onboarding@resend.dev";

let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const currencyFmt = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
});

const viewedTsFmt = new Intl.DateTimeFormat("en-AU", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Australia/Brisbane",
});

export type OperatorNotification =
  | {
      kind: "proposal_approved";
      proposalId: string;
      clientName: string;
      proposalTitle: string;
      totalAmount: number;
      projectUrl: string;
    }
  | {
      kind: "changes_requested";
      proposalId: string;
      clientName: string;
      proposalTitle: string;
      message: string;
      proposalUrl: string;
    }
  | {
      kind: "change_request_submitted";
      proposalId: string;
      clientName: string;
      projectTitle: string;
      description: string;
      projectUrl: string;
    }
  | {
      kind: "proposal_viewed";
      proposalId: string;
      clientName: string;
      proposalTitle: string;
      viewedAt: Date;
      proposalUrl: string;
    }
  | {
      kind: "invoice_paid";
      proposalId: string;
      invoiceId: string;
      clientName: string;
      projectTitle: string;
      invoiceType: "deposit" | "final";
      amount: number;
      projectUrl: string;
    };

type RenderedEmail = { subject: string; text: string };

function render(n: OperatorNotification): RenderedEmail {
  switch (n.kind) {
    case "proposal_approved":
      return {
        subject: `✓ ${n.clientName} approved ${n.proposalTitle}`,
        text: [
          `${n.clientName} just approved "${n.proposalTitle}".`,
          "",
          `Amount: ${currencyFmt.format(n.totalAmount)}`,
          "",
          `Open the project: ${n.projectUrl}`,
          "",
          "Velo",
        ].join("\n"),
      };
    case "changes_requested": {
      const trimmed =
        n.message.length > 600 ? n.message.slice(0, 600) + "..." : n.message;
      const body = [
        `${n.clientName} requested changes on "${n.proposalTitle}".`,
      ];
      if (trimmed.trim()) body.push("", trimmed);
      body.push("", `Open the proposal: ${n.proposalUrl}`, "", "Velo");
      return {
        subject: `${n.clientName} requested changes on ${n.proposalTitle}`,
        text: body.join("\n"),
      };
    }
    case "change_request_submitted": {
      const trimmed =
        n.description.length > 600
          ? n.description.slice(0, 600) + "..."
          : n.description;
      return {
        subject: `New change request on ${n.projectTitle}`,
        text: [
          `${n.clientName} just submitted a new change request on "${n.projectTitle}".`,
          "",
          trimmed,
          "",
          `Open the project: ${n.projectUrl}`,
          "",
          "Velo",
        ].join("\n"),
      };
    }
    case "proposal_viewed":
      return {
        subject: `${n.clientName} viewed your proposal`,
        text: [
          `${n.clientName} opened "${n.proposalTitle}" for the first time.`,
          "",
          `Viewed: ${viewedTsFmt.format(n.viewedAt)} (AEST)`,
          "",
          `Open the proposal: ${n.proposalUrl}`,
          "",
          "Velo",
        ].join("\n"),
      };
    case "invoice_paid": {
      const label = n.invoiceType === "deposit" ? "deposit" : "final invoice";
      return {
        subject: `$ Paid: ${n.clientName} paid the ${label} on ${n.projectTitle}`,
        text: [
          `${n.clientName} just paid the ${label} on "${n.projectTitle}".`,
          "",
          `Amount: ${currencyFmt.format(n.amount)}`,
          "",
          `Open the project: ${n.projectUrl}`,
          "",
          "Velo",
        ].join("\n"),
      };
    }
  }
}

// Looks up the agency user's email and the notifications_enabled flag in a
// single round-trip. Returns null if the user has no profile row yet (the
// profile is created lazily) or if notifications are disabled. Falls open
// when the user_profiles row is missing so a user who hasn't onboarded yet
// still receives the early signal that a client engaged with a proposal.
async function resolveRecipient(
  userId: string,
): Promise<{ email: string } | null> {
  const rows = await sql`
    SELECT u.email, up.notifications_enabled
    FROM users u
    LEFT JOIN user_profiles up ON up.user_id = u.id
    WHERE u.id = ${userId}
  `;
  const row = rows[0];
  if (!row) return null;
  if (row.notifications_enabled === false) return null;
  const email = (row.email as string | null) ?? "";
  if (!email) return null;
  return { email };
}

// Fire-and-forget operator notification. Callers MUST NOT await this; the
// helper schedules its own promise via `void` and swallows every error so a
// failed Resend call can never break the originating action. Failures are
// recorded in security_events as `notification_failed` for the admin panel.
export function sendOperatorNotification(
  userId: string,
  notification: OperatorNotification,
): void {
  void (async () => {
    try {
      const recipient = await resolveRecipient(userId);
      if (!recipient) return;

      const resend = getResend();
      if (!resend) {
        logSecurityEvent({
          event: "notification_failed",
          route: `notifications/${notification.kind}`,
          outcome: "failure",
          reason: "resend_not_configured",
          meta: { proposal_id: notification.proposalId },
        });
        return;
      }

      const { subject, text } = render(notification);
      const { error } = await resend.emails.send({
        from: OPERATOR_FROM_ADDRESS,
        to: recipient.email,
        subject,
        text,
      });

      if (error) {
        logSecurityEvent({
          event: "notification_failed",
          route: `notifications/${notification.kind}`,
          outcome: "failure",
          reason: error.message.slice(0, 200),
          meta: { proposal_id: notification.proposalId },
        });
      }
    } catch (err) {
      logSecurityEvent({
        event: "notification_failed",
        route: `notifications/${notification.kind}`,
        outcome: "failure",
        reason:
          err instanceof Error ? err.message.slice(0, 200) : "unknown_error",
        meta: { proposal_id: notification.proposalId },
      });
    }
  })();
}

// Records an 'email_failed' row in the audit trail. Best-effort: a failed
// log write should never cascade and break the underlying action.
export async function logEmailFailureEvent(
  proposalId: string,
  event: string,
): Promise<void> {
  try {
    await sql`
      INSERT INTO proposal_events (proposal_id, event_type, description)
      VALUES (${proposalId}, 'email_failed', ${`Email failed: ${event}`})
    `;
  } catch {
    // Best effort.
  }
}

// Sends the operator a delivery-failure alert and writes the audit row.
// Pass proposalId when one is in scope so the audit trail picks it up. The
// agencyEmail is the operator's address; if blank, the audit row is still
// written but no alert email goes out (nothing to send it to).
export async function notifyDevOfFailure(args: {
  proposalId: string | null;
  agencyEmail: string;
  agencyName: string;
  failedEvent: string;
  intendedRecipient: string;
  reason: string;
  contextLabel: string;
}): Promise<void> {
  if (args.proposalId) {
    await logEmailFailureEvent(args.proposalId, args.failedEvent);
  }
  if (!args.agencyEmail) return;
  try {
    await sendDevEmailDeliveryFailure({
      to: args.agencyEmail,
      agencyName: args.agencyName,
      failedEvent: args.failedEvent,
      intendedRecipient: args.intendedRecipient,
      reason: args.reason,
      contextLabel: args.contextLabel,
    });
  } catch {
    // Best effort. The originating action already succeeded.
  }
}
