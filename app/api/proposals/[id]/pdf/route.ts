import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { sql } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";
import { getProposal } from "@/app/dashboard/proposals/actions";
import { getUserProfile } from "@/lib/user-profile";
import { ProposalPdf } from "@/lib/pdf/proposal-pdf";
import { shortNumber } from "@/lib/pdf/styles";
import { checkRateLimit } from "@/lib/rate-limit";
import { logSecurityEvent } from "@/lib/security-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  // Auth + rate-limit run outside try so Clerk redirects + 429 responses
  // propagate without being caught as 500s.
  const user = await getOrCreateUser();

  const limit = checkRateLimit(`pdf:user:${user.id}`, 10, 60_000);
  if (!limit.ok) {
    return new NextResponse("Too many requests", {
      status: 429,
      headers: { "Retry-After": String(limit.retryAfterSeconds) },
    });
  }

  try {
    const proposal = await getProposal(params.id);
    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    // The proposal action exposes name/email but not company_name — fetch it
    // separately so the PDF can include it when present.
    const clientRows = await sql`
      SELECT company_name FROM clients WHERE id = ${proposal.client_id}
    `;
    const company_name =
      (clientRows[0]?.company_name as string | null | undefined) ?? null;

    const profile = await getUserProfile(user.id);

    const buffer = await renderToBuffer(
      ProposalPdf({
        proposal: {
          id: proposal.id,
          title: proposal.title,
          description: proposal.description,
          status: proposal.status,
          total_amount: proposal.total_amount,
          deposit_percentage: proposal.deposit_percentage,
          created_at: proposal.created_at as string,
        },
        client: {
          name: proposal.client_name,
          email: proposal.client_email,
          company_name,
        },
        lineItems: proposal.lineItems,
        profile,
        account: { name: user.name, email: user.email },
      }),
    );

    logSecurityEvent({
      event: "pdf_download",
      route: "api/proposals/pdf",
      outcome: "success",
    });

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="PRO-${shortNumber(proposal.id)}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Could not generate PDF" },
      { status: 500 },
    );
  }
}
