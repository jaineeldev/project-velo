import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { sql } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";
import { getProposal } from "@/app/dashboard/proposals/actions";
import { getUserProfile } from "@/lib/user-profile";
import { ProposalPdf } from "@/lib/pdf/proposal-pdf";
import { shortNumber } from "@/lib/pdf/styles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const user = await getOrCreateUser();

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

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="PRO-${shortNumber(proposal.id)}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
