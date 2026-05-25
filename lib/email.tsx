import { Resend } from "resend";

const FROM_ADDRESS = "onboarding@resend.dev";
const SUPPORT_INBOX = "jaineelk.dev@gmail.com";

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

export type SendProposalEmailInput = {
  proposalId: string;
  to: string;
  agencyName: string;
  clientName: string;
  proposalTitle: string;
  totalAmount: number;
  reviewUrl: string;
};

export type SendProposalEmailResult =
  | { ok: true; id: string }
  | { ok: false; reason: string };

export async function sendProposalEmail(
  input: SendProposalEmailInput,
): Promise<SendProposalEmailResult> {
  const resend = getResend();
  if (!resend) {
    return { ok: false, reason: "RESEND_API_KEY is not configured" };
  }

  const templateId = process.env.RESEND_PROPOSAL_TEMPLATE_ID;
  if (!templateId) {
    return { ok: false, reason: "RESEND_PROPOSAL_TEMPLATE_ID is not configured" };
  }

  const payload = {
    from: FROM_ADDRESS,
    to: input.to,
    subject: input.proposalTitle,
    template: {
      id: templateId,
      variables: {
        agencyName: input.agencyName,
        clientName: input.clientName,
        proposalTitle: input.proposalTitle,
        totalAmount: currencyFmt.format(input.totalAmount),
        reviewUrl: input.reviewUrl,
      },
    },
  };

  try {
    const { data, error } = await resend.emails.send(payload);

    if (error) {
      logEmailOutcome(input.proposalId, "failed");
      return { ok: false, reason: error.message };
    }
    logEmailOutcome(input.proposalId, "sent");
    return { ok: true, id: data?.id ?? "" };
  } catch (err) {
    logEmailOutcome(input.proposalId, "failed");
    return {
      ok: false,
      reason: err instanceof Error ? err.message : "Unknown email error",
    };
  }
}

function logEmailOutcome(proposalId: string, outcome: "sent" | "failed") {
  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      event: "proposal_email",
      proposal_id: proposalId,
      outcome,
    }),
  );
}

export type SendSupportEmailInput = {
  type: "bug" | "feedback" | "help";
  subject: string | null;
  message: string;
  userName: string | null;
  userEmail: string;
  userId: string;
};

export type SendSupportEmailResult =
  | { ok: true; id: string }
  | { ok: false; reason: string };

const supportTypeLabel: Record<SendSupportEmailInput["type"], string> = {
  bug: "Bug report",
  feedback: "Feedback",
  help: "Help request",
};

// Sends a support message from an authenticated user to the support inbox.
// `replyTo` is set to the user's address so we can hit reply in Gmail and
// answer them directly without copy-pasting.
export async function sendSupportEmail(
  input: SendSupportEmailInput,
): Promise<SendSupportEmailResult> {
  const resend = getResend();
  if (!resend) {
    return { ok: false, reason: "RESEND_API_KEY is not configured" };
  }

  const typeText = supportTypeLabel[input.type];
  const subjectLine = input.subject?.trim() || typeText;
  const fullSubject = `[Velo support] ${subjectLine}`;
  const senderLine = input.userName
    ? `${input.userName} <${input.userEmail}>`
    : input.userEmail;

  const text = [
    `From: ${senderLine}`,
    `User ID: ${input.userId}`,
    `Type: ${typeText}`,
    "",
    "Message:",
    input.message,
  ].join("\n");

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: SUPPORT_INBOX,
      replyTo: input.userEmail,
      subject: fullSubject,
      text,
    });

    if (error) {
      logSupportOutcome(input.userId, "failed");
      return { ok: false, reason: error.message };
    }
    logSupportOutcome(input.userId, "sent");
    return { ok: true, id: data?.id ?? "" };
  } catch (err) {
    logSupportOutcome(input.userId, "failed");
    return {
      ok: false,
      reason: err instanceof Error ? err.message : "Unknown email error",
    };
  }
}

function logSupportOutcome(userId: string, outcome: "sent" | "failed") {
  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      event: "support_email",
      user_id: userId,
      outcome,
    }),
  );
}

export type SendWaitlistEmailInput = {
  email: string;
  ip: string;
};

export type SendWaitlistEmailResult =
  | { ok: true; id: string }
  | { ok: false; reason: string };

// Marketing-page waitlist signups. Fires a notification to the support inbox
// so we can manually compile a list until a proper Resend audience or DB
// table lands. `replyTo` is set so we can hit reply and welcome the signup
// directly without copy-pasting.
export async function sendWaitlistEmail(
  input: SendWaitlistEmailInput,
): Promise<SendWaitlistEmailResult> {
  const resend = getResend();
  if (!resend) {
    return { ok: false, reason: "RESEND_API_KEY is not configured" };
  }

  const text = [
    "New waitlist signup on velo.",
    "",
    `Email: ${input.email}`,
    `IP: ${input.ip}`,
    `When: ${new Date().toISOString()}`,
  ].join("\n");

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: SUPPORT_INBOX,
      replyTo: input.email,
      subject: `[Velo waitlist] ${input.email}`,
      text,
    });

    if (error) {
      logWaitlistOutcome("failed");
      return { ok: false, reason: error.message };
    }
    logWaitlistOutcome("sent");
    return { ok: true, id: data?.id ?? "" };
  } catch (err) {
    logWaitlistOutcome("failed");
    return {
      ok: false,
      reason: err instanceof Error ? err.message : "Unknown email error",
    };
  }
}

function logWaitlistOutcome(outcome: "sent" | "failed") {
  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      event: "waitlist_signup",
      outcome,
    }),
  );
}

// ── Client-facing notification emails ────────────────────────────────────────

type ClientNotifyResult =
  | { ok: true; id: string }
  | { ok: false; reason: string };

export type SendMilestoneCompletedEmailInput = {
  to: string;
  clientName: string;
  agencyName: string;
  milestoneTitle: string;
  projectTitle: string;
  projectUrl: string;
};

export async function sendMilestoneCompletedEmail(
  input: SendMilestoneCompletedEmailInput,
): Promise<ClientNotifyResult> {
  const resend = getResend();
  if (!resend) {
    return { ok: false, reason: "RESEND_API_KEY is not configured" };
  }

  const subject = `Milestone completed: ${input.milestoneTitle}`;
  const text = [
    `Hi ${input.clientName || "there"},`,
    "",
    `${input.agencyName || "Your team"} just marked a milestone complete on "${input.projectTitle}":`,
    "",
    `  ${input.milestoneTitle}`,
    "",
    `View the project: ${input.projectUrl}`,
    "",
    "— Velo",
  ].join("\n");

  return sendNotifyEmail({ to: input.to, subject, text, event: "milestone_completed" });
}

export type SendInvoiceIssuedEmailInput = {
  to: string;
  clientName: string;
  agencyName: string;
  invoiceType: "deposit" | "final";
  totalAmount: number;
  projectTitle: string;
  projectUrl: string;
};

export async function sendInvoiceIssuedEmail(
  input: SendInvoiceIssuedEmailInput,
): Promise<ClientNotifyResult> {
  const resend = getResend();
  if (!resend) {
    return { ok: false, reason: "RESEND_API_KEY is not configured" };
  }

  const typeLabel = input.invoiceType === "deposit" ? "Deposit" : "Final";
  const subject = `${typeLabel} invoice from ${input.agencyName || "your team"}`;
  const text = [
    `Hi ${input.clientName || "there"},`,
    "",
    `${input.agencyName || "Your team"} issued a ${typeLabel.toLowerCase()} invoice on "${input.projectTitle}".`,
    "",
    `Amount: ${currencyFmt.format(input.totalAmount)}`,
    "",
    `View the invoice: ${input.projectUrl}`,
    "",
    "Card payments are still being wired up. For now, the bank transfer details are on the issued invoice.",
    "",
    "— Velo",
  ].join("\n");

  return sendNotifyEmail({ to: input.to, subject, text, event: "invoice_issued" });
}

export type SendProposalCommentEmailInput = {
  to: string;
  recipientName: string;
  authorRole: "client" | "agency";
  authorName: string;
  proposalTitle: string;
  body: string;
  proposalUrl: string;
};

export async function sendProposalCommentEmail(
  input: SendProposalCommentEmailInput,
): Promise<ClientNotifyResult> {
  const resend = getResend();
  if (!resend) {
    return { ok: false, reason: "RESEND_API_KEY is not configured" };
  }

  const authorLabel =
    input.authorRole === "client" ? "Your client" : "Your team";
  const subject = `New comment on "${input.proposalTitle}"`;
  const trimmedBody = input.body.length > 600
    ? input.body.slice(0, 600) + "..."
    : input.body;

  const text = [
    `Hi ${input.recipientName || "there"},`,
    "",
    `${authorLabel} (${input.authorName || "unknown"}) just commented on "${input.proposalTitle}":`,
    "",
    trimmedBody,
    "",
    `Reply: ${input.proposalUrl}`,
    "",
    "— Velo",
  ].join("\n");

  return sendNotifyEmail({ to: input.to, subject, text, event: "proposal_comment" });
}

export type SendInvoicePaidEmailInput = {
  to: string;
  clientName: string;
  agencyName: string;
  invoiceType: "deposit" | "final";
  totalAmount: number;
  projectTitle: string;
  projectUrl: string;
};

export async function sendInvoicePaidEmail(
  input: SendInvoicePaidEmailInput,
): Promise<ClientNotifyResult> {
  const resend = getResend();
  if (!resend) {
    return { ok: false, reason: "RESEND_API_KEY is not configured" };
  }

  const typeLabel = input.invoiceType === "deposit" ? "deposit" : "final";
  const subject = `Payment received: ${input.projectTitle}`;
  const text = [
    `Hi ${input.clientName || "there"},`,
    "",
    `${input.agencyName || "Your team"} confirmed receipt of your ${typeLabel} payment on "${input.projectTitle}".`,
    "",
    `Amount: ${currencyFmt.format(input.totalAmount)}`,
    "",
    `View the project: ${input.projectUrl}`,
    "",
    "Thanks. This email is your receipt.",
    "",
    "— Velo",
  ].join("\n");

  return sendNotifyEmail({ to: input.to, subject, text, event: "invoice_paid" });
}

async function sendNotifyEmail(args: {
  to: string;
  subject: string;
  text: string;
  event: string;
}): Promise<ClientNotifyResult> {
  const resend = getResend();
  if (!resend) {
    return { ok: false, reason: "RESEND_API_KEY is not configured" };
  }
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: args.to,
      subject: args.subject,
      text: args.text,
    });
    if (error) {
      logNotifyOutcome(args.event, "failed");
      return { ok: false, reason: error.message };
    }
    logNotifyOutcome(args.event, "sent");
    return { ok: true, id: data?.id ?? "" };
  } catch (err) {
    logNotifyOutcome(args.event, "failed");
    return {
      ok: false,
      reason: err instanceof Error ? err.message : "Unknown email error",
    };
  }
}

function logNotifyOutcome(event: string, outcome: "sent" | "failed") {
  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      event,
      outcome,
    }),
  );
}

export function getAppBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL;
  if (url) return url;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "NEXT_PUBLIC_APP_URL is not set. Set it to the production domain (e.g. https://your-app.example.com) in the Vercel environment variables — proposal emails must not be sent with localhost share links.",
    );
  }
  return "http://localhost:3000";
}
