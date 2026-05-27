import { sql } from "@/lib/db";
import { sendDevEmailDeliveryFailure } from "@/lib/email";

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
