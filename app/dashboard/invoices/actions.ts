"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";
import { uuidSchema } from "@/lib/validation";

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
  return rows as InvoiceListItem[];
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
    lineItems: lineItems as InvoiceLineItem[],
  };
}

export async function markInvoiceAsPaid(invoiceId: string): Promise<void> {
  if (!uuidSchema.safeParse(invoiceId).success) throw new Error("Invoice not found.");

  const user = await getOrCreateUser();

  const result = await sql`
    UPDATE invoices
    SET status = 'paid'
    WHERE id = ${invoiceId} AND user_id = ${user.id} AND status = 'unpaid'
    RETURNING id, type, project_id
  `;
  if (result.length === 0) throw new Error("Invoice not found or already paid.");

  const invoice = result[0] as { id: string; type: string; project_id: string };

  // Paying the final invoice marks the project as delivered.
  if (invoice.type === "final") {
    await sql`
      UPDATE projects SET status = 'delivered'
      WHERE id = ${invoice.project_id} AND user_id = ${user.id}
    `;
    revalidatePath(`/dashboard/projects/${invoice.project_id}`);
    revalidatePath("/dashboard/projects");
  }

  revalidatePath(`/dashboard/invoices/${invoiceId}`);
  revalidatePath("/dashboard/invoices");
}
