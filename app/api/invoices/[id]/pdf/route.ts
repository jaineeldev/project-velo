import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getOrCreateUser } from "@/lib/auth";
import { getInvoice } from "@/app/dashboard/invoices/actions";
import { getUserProfile } from "@/lib/user-profile";
import { InvoicePdf } from "@/lib/pdf/invoice-pdf";
import { shortNumber } from "@/lib/pdf/styles";

// react-pdf relies on Node-only APIs (fontkit, streams) — pin the runtime so
// Next.js never tries to run this on the Edge.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const user = await getOrCreateUser();

  const invoice = await getInvoice(params.id);
  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const profile = await getUserProfile(user.id);

  const buffer = await renderToBuffer(
    InvoicePdf({
      invoice: {
        id: invoice.id,
        type: invoice.type,
        status: invoice.status,
        total_amount: invoice.total_amount,
        gst_amount: invoice.gst_amount,
        created_at: invoice.created_at as string,
        due_date: invoice.due_date as string | null,
      },
      client: invoice.client,
      project: invoice.project,
      proposal: invoice.proposal,
      lineItems: invoice.lineItems,
      profile,
      account: { name: user.name, email: user.email },
    }),
  );

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="INV-${shortNumber(invoice.id)}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
