"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";
import { proposalSchema, uuidSchema } from "@/lib/validation";

const GST_RATE = 0.1;

export type CreateProposalInput = {
  clientId: string;
  title: string;
  description: string;
  lineItems: { description: string; quantity: number; unitPrice: number }[];
  depositPercentage: number;
};

// ── createProposal ───────────────────────────────────────────────────────────

export async function createProposal(input: CreateProposalInput): Promise<string> {
  const user = await getOrCreateUser();

  const result = proposalSchema.safeParse(input);
  if (!result.success) throw new Error(result.error.issues[0].message);

  const { clientId, title, description, lineItems, depositPercentage } = result.data;

  const clientRows = await sql`
    SELECT id FROM clients WHERE id = ${clientId} AND user_id = ${user.id}
  `;
  if (clientRows.length === 0) throw new Error("Client not found.");

  const subtotal = lineItems.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const totalAmount = subtotal * (1 + GST_RATE);

  const [proposal] = await sql`
    INSERT INTO proposals (user_id, client_id, title, description, deposit_percentage, total_amount, status)
    VALUES (${user.id}, ${clientId}, ${title}, ${description}, ${depositPercentage}, ${totalAmount}, 'draft')
    RETURNING id
  `;

  await Promise.all([
    ...lineItems.map(
      (item) => sql`
        INSERT INTO line_items (proposal_id, description, quantity, unit_price)
        VALUES (${proposal.id}, ${item.description}, ${item.quantity}, ${item.unitPrice})
      `,
    ),
    sql`
      INSERT INTO proposal_events (proposal_id, description)
      VALUES (${proposal.id}, 'Proposal created')
    `,
  ]);

  revalidatePath("/dashboard/proposals");
  return proposal.id as string;
}

// ── updateProposal ───────────────────────────────────────────────────────────

export async function updateProposal(
  proposalId: string,
  input: CreateProposalInput,
): Promise<void> {
  if (!uuidSchema.safeParse(proposalId).success) throw new Error("Proposal not found.");

  const user = await getOrCreateUser();

  const existing = await sql`
    SELECT id, status FROM proposals WHERE id = ${proposalId} AND user_id = ${user.id}
  `;
  if (existing.length === 0) throw new Error("Proposal not found.");
  if (existing[0].status !== "draft")
    throw new Error("Only draft proposals can be edited.");

  const result = proposalSchema.safeParse(input);
  if (!result.success) throw new Error(result.error.issues[0].message);

  const { clientId, title, description, lineItems, depositPercentage } = result.data;

  const clientRows = await sql`
    SELECT id FROM clients WHERE id = ${clientId} AND user_id = ${user.id}
  `;
  if (clientRows.length === 0) throw new Error("Client not found.");

  const subtotal = lineItems.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const totalAmount = subtotal * (1 + GST_RATE);

  await sql`
    UPDATE proposals
    SET client_id = ${clientId}, title = ${title}, description = ${description},
        deposit_percentage = ${depositPercentage}, total_amount = ${totalAmount}
    WHERE id = ${proposalId} AND user_id = ${user.id}
  `;

  // Replace all line items atomically (delete-then-insert keeps things simple).
  await sql`DELETE FROM line_items WHERE proposal_id = ${proposalId}`;

  await Promise.all([
    ...lineItems.map(
      (item) => sql`
        INSERT INTO line_items (proposal_id, description, quantity, unit_price)
        VALUES (${proposalId}, ${item.description}, ${item.quantity}, ${item.unitPrice})
      `,
    ),
    sql`
      INSERT INTO proposal_events (proposal_id, description)
      VALUES (${proposalId}, 'Proposal edited')
    `,
  ]);

  revalidatePath(`/dashboard/proposals/${proposalId}`);
  revalidatePath("/dashboard/proposals");
}

// ── sendProposal ─────────────────────────────────────────────────────────────

export async function sendProposal(proposalId: string): Promise<string> {
  if (!uuidSchema.safeParse(proposalId).success) throw new Error("Proposal not found.");

  const user = await getOrCreateUser();

  const rows = await sql`
    SELECT id, status FROM proposals WHERE id = ${proposalId} AND user_id = ${user.id}
  `;
  if (rows.length === 0) throw new Error("Proposal not found.");
  if (rows[0].status !== "draft") throw new Error("Only draft proposals can be sent.");

  const token = randomBytes(32).toString("hex");

  await sql`
    UPDATE proposals
    SET status = 'sent', share_token = ${token}
    WHERE id = ${proposalId} AND user_id = ${user.id} AND status = 'draft'
  `;

  await sql`
    INSERT INTO proposal_events (proposal_id, description)
    VALUES (${proposalId}, 'Proposal sent to client')
  `;

  revalidatePath(`/dashboard/proposals/${proposalId}`);
  revalidatePath("/dashboard/proposals");

  return token;
}

// ── getProposal ──────────────────────────────────────────────────────────────

export type ProposalEvent = { description: string; created_at: string };

export type ProposalDetail = {
  id: string;
  client_id: string;
  title: string;
  description: string | null;
  status: string;
  share_token: string | null;
  total_amount: string;
  deposit_percentage: string;
  created_at: string;
  client_name: string;
  client_email: string | null;
  lineItems: { id: string; description: string; quantity: string; unit_price: string }[];
  events: ProposalEvent[];
};

export async function getProposal(proposalId: string): Promise<ProposalDetail | null> {
  if (!uuidSchema.safeParse(proposalId).success) return null;

  const user = await getOrCreateUser();

  const rows = await sql`
    SELECT
      p.id, p.client_id, p.title, p.description, p.status, p.share_token,
      p.total_amount, p.deposit_percentage, p.created_at,
      c.name AS client_name, c.email AS client_email
    FROM proposals p
    JOIN clients c ON c.id = p.client_id
    WHERE p.id = ${proposalId} AND p.user_id = ${user.id}
  `;
  if (rows.length === 0) return null;

  const [items, events] = await Promise.all([
    sql`
      SELECT id, description, quantity, unit_price
      FROM line_items
      WHERE proposal_id = ${proposalId}
      ORDER BY created_at
    `,
    sql`
      SELECT description, created_at
      FROM proposal_events
      WHERE proposal_id = ${proposalId}
      ORDER BY created_at ASC
    `,
  ]);

  return {
    ...(rows[0] as Omit<ProposalDetail, "lineItems" | "events">),
    lineItems: items as ProposalDetail["lineItems"],
    events: events as ProposalEvent[],
  };
}
