import { Resend } from "resend";

const FROM_ADDRESS = "onboarding@resend.dev";

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
