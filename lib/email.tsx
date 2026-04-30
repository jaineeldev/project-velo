import { Resend } from "resend";
import { ProposalReadyEmail } from "@/emails/proposal-ready";

// Resend's onboarding sender — works without a verified domain. Replace once
// the Velo domain is verified.
const FROM_ADDRESS = "Velo <onboarding@resend.dev>";

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

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: input.to,
      subject: `${input.proposalTitle} — your proposal is ready to review`,
      react: (
        <ProposalReadyEmail
          agencyName={input.agencyName}
          clientName={input.clientName}
          proposalTitle={input.proposalTitle}
          totalAmount={currencyFmt.format(input.totalAmount)}
          reviewUrl={input.reviewUrl}
        />
      ),
    });

    if (error) return { ok: false, reason: error.message };
    return { ok: true, id: data?.id ?? "" };
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : "Unknown email error",
    };
  }
}

export function getAppBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.APP_URL ??
    "http://localhost:3000"
  );
}
