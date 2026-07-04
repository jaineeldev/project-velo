"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";
import { uuidSchema } from "@/lib/validation";
import {
  getAppBaseUrl,
  sendClientProjectDeliveredEmail,
  sendInvoicePaidEmail,
} from "@/lib/email";
import { notifyDevOfFailure } from "@/lib/notifications";

export type InvoiceListItem = {
  id: string;
  total_amount: string;
  status: string;
  type: string;
  created_at: string | Date;
  client_name: string;
  project_title: string;
};

export async function getInvoices(): Promise<InvoiceListItem[]> {
  const user = await getOrCreateUser();

  const rows = await sql`
    SELECT i.id, i.total_amount, i.status, i.type, i.created_at,
           c.name AS client_name, p.title AS project_title
    FROM invoices i
    JOIN clients c ON c.id = i.client_id
    JOIN projects p ON p.id = i.project_id
    WHERE i.user_id = ${user.id}
    ORDER BY i.created_at DESC
  `;
  return rows as unknown as InvoiceListItem[];
}

export type InvoiceLineItem = {
  description: string;
  quantity: string;
  unit_price: string;
};

export type InvoiceDetail = {
  id: string;
  status: string;
  type: string;
  total_amount: string;
  gst_amount: string;
  due_date: string | Date | null;
  created_at: string | Date;
  project: {
    id: string;
    title: string;
  };
  client: {
    name: string;
    email: string | null;
    phone: string | null;
    company_name: string | null;
  };
  proposal: {
    id: string;
    title: string;
    total_amount: string;
    deposit_percentage: string;
  };
  lineItems: InvoiceLineItem[];
};

export async function getInvoice(invoiceId: string): Promise<InvoiceDetail | null> {
  if (!uuidSchema.safeParse(invoiceId).success) return null;

  const user = await getOrCreateUser();

  // Main row + line items in parallel. The line_items query joins through
  // invoices so it can enforce ownership and target the right proposal
  // without waiting on the main query to return `proposal_id` first.
  const [rows, lineItems] = await Promise.all([
    sql`
      SELECT
        i.id, i.status, i.type, i.total_amount, i.gst_amount, i.due_date, i.created_at,
        p.id AS project_id, p.title AS project_title, p.proposal_id,
        c.name AS client_name, c.email AS client_email,
        c.phone AS client_phone, c.company_name AS client_company_name,
        pr.title AS proposal_title, pr.total_amount AS proposal_total_amount,
        pr.deposit_percentage AS proposal_deposit_percentage
      FROM invoices i
      JOIN projects p ON p.id = i.project_id
      JOIN clients c ON c.id = i.client_id
      JOIN proposals pr ON pr.id = p.proposal_id
      WHERE i.id = ${invoiceId} AND i.user_id = ${user.id}
    `,
    sql`
      SELECT li.description, li.quantity, li.unit_price
      FROM line_items li
      JOIN proposals pr ON pr.id = li.proposal_id
      JOIN projects p ON p.proposal_id = pr.id
      JOIN invoices i ON i.project_id = p.id
      WHERE i.id = ${invoiceId} AND i.user_id = ${user.id}
      ORDER BY li.created_at
    `,
  ]);
  if (rows.length === 0) return null;

  const row = rows[0];

  return {
    id: row.id as string,
    status: row.status as string,
    type: row.type as string,
    total_amount: row.total_amount as string,
    gst_amount: row.gst_amount as string,
    due_date: (row.due_date as string | Date | null) ?? null,
    created_at: row.created_at as string,
    project: {
      id: row.project_id as string,
      title: row.project_title as string,
    },
    client: {
      name: row.client_name as string,
      email: (row.client_email as string | null) ?? null,
      phone: (row.client_phone as string | null) ?? null,
      company_name: (row.client_company_name as string | null) ?? null,
    },
    proposal: {
      id: row.proposal_id as string,
      title: row.proposal_title as string,
      total_amount: row.proposal_total_amount as string,
      deposit_percentage: row.proposal_deposit_percentage as string,
    },
    lineItems: lineItems as unknown as InvoiceLineItem[],
  };
}

export async function markInvoiceAsPaid(invoiceId: string): Promise<void> {
  if (!uuidSchema.safeParse(invoiceId).success) throw new Error("Invoice not found.");

  const user = await getOrCreateUser();

  const result = await sql`
    UPDATE invoices
    SET status = 'paid'
    WHERE id = ${invoiceId} AND user_id = ${user.id} AND status = 'unpaid'
    RETURNING id, type, project_id, total_amount
  `;
  if (result.length === 0) throw new Error("Invoice not found or already paid.");

  const invoice = result[0] as {
    id: string;
    type: string;
    project_id: string;
    total_amount: string;
  };

  // Paying the final invoice marks the project as delivered.
  const justDelivered = invoice.type === "final";
  if (justDelivered) {
    await sql`
      UPDATE projects SET status = 'delivered'
      WHERE id = ${invoice.project_id} AND user_id = ${user.id}
    `;
    revalidatePath(`/dashboard/projects/${invoice.project_id}`);
    revalidatePath("/dashboard/projects");
  }

  // Look up the project + client + agency once for the receipt and the
  // optional delivered-confirmation email below. Both need the same join.
  const amount = Number(invoice.total_amount);
  const details = await sql`
    SELECT
      pr.title AS project_title,
      pr.share_token,
      pr.proposal_id,
      c.email AS client_email,
      c.name AS client_name,
      u.email AS agency_email,
      u.name AS agency_name
    FROM projects pr
    JOIN clients c ON c.id = pr.client_id
    JOIN users u ON u.id = pr.user_id
    WHERE pr.id = ${invoice.project_id} AND pr.user_id = ${user.id}
  `;
  const row = details[0];
  const clientEmail = (row?.client_email as string | undefined) ?? "";
  const clientName = (row?.client_name as string | null) ?? "";
  const agencyEmail = (row?.agency_email as string | undefined) ?? "";
  const agencyName = (row?.agency_name as string | null) ?? "";
  const projectTitle = (row?.project_title as string) ?? "";
  const proposalId = (row?.proposal_id as string | undefined) ?? null;
  const projectUrl = `${getAppBaseUrl()}/share/project/${row?.share_token}`;

  // Receipt email. Voided ($0) invoices don't need one.
  if (amount > 0 && clientEmail) {
    const res = await sendInvoicePaidEmail({
      to: clientEmail,
      clientName,
      agencyName,
      invoiceType: invoice.type === "deposit" ? "deposit" : "final",
      totalAmount: amount,
      projectTitle,
      projectUrl,
    }).catch((err: unknown) => ({
      ok: false as const,
      reason: err instanceof Error ? err.message : "send threw",
    }));
    if (!res.ok) {
      await notifyDevOfFailure({
        proposalId,
        agencyEmail,
        agencyName,
        failedEvent: "invoice_paid_receipt",
        intendedRecipient: clientEmail,
        reason: res.reason,
        contextLabel: `Receipt for "${projectTitle}"`,
      });
    }
  }

  // Delivered-confirmation email goes out the moment the final invoice is
  // marked paid, since the project status flips to 'delivered' above.
  if (justDelivered && clientEmail) {
    const res = await sendClientProjectDeliveredEmail({
      to: clientEmail,
      clientName,
      agencyName,
      projectTitle,
      projectUrl,
    }).catch((err: unknown) => ({
      ok: false as const,
      reason: err instanceof Error ? err.message : "send threw",
    }));
    if (!res.ok) {
      await notifyDevOfFailure({
        proposalId,
        agencyEmail,
        agencyName,
        failedEvent: "client_project_delivered",
        intendedRecipient: clientEmail,
        reason: res.reason,
        contextLabel: `Delivery confirmation for "${projectTitle}"`,
      });
    }
  }

  revalidatePath(`/dashboard/invoices/${invoiceId}`);
  revalidatePath("/dashboard/invoices");
}
