"use server";

import { sql } from "@/lib/db";

// 64 hex chars = 32 random bytes = 256 bits of entropy.
const TOKEN_RE = /^[0-9a-f]{64}$/;

function assertToken(token: string) {
  if (!TOKEN_RE.test(token)) throw new Error("Invalid link.");
}

export async function approveProposal(token: string): Promise<void> {
  assertToken(token);

  const rows = await sql`
    SELECT p.id, p.user_id, p.client_id, p.title,
           p.total_amount, p.deposit_percentage, p.status
    FROM proposals p
    WHERE p.share_token = ${token}
      AND p.status = 'sent'
  `;
  if (rows.length === 0) {
    throw new Error("This proposal is no longer available for approval.");
  }

  const p = rows[0];
  const proposalId = p.id as string;

  // Idempotency guard: if a project already exists, the approval already ran.
  const existing = await sql`
    SELECT id FROM projects WHERE proposal_id = ${proposalId} LIMIT 1
  `;
  if (existing.length > 0) {
    throw new Error("This proposal has already been approved.");
  }

  // Create the project.
  const [project] = await sql`
    INSERT INTO projects (proposal_id, client_id, user_id, title, status)
    VALUES (${proposalId}, ${p.client_id}, ${p.user_id}, ${p.title}, 'active')
    RETURNING id
  `;

  // Fetch line items and create a milestone for each.
  const items = await sql`
    SELECT description, quantity, unit_price
    FROM line_items
    WHERE proposal_id = ${proposalId}
    ORDER BY created_at
  `;

  await Promise.all(
    items.map((item) => {
      const amount = Number(item.quantity) * Number(item.unit_price);
      return sql`
        INSERT INTO milestones (proposal_id, title, amount, status)
        VALUES (${proposalId}, ${item.description}, ${amount}, 'pending')
      `;
    }),
  );

  // Create a deposit invoice.
  const total = Number(p.total_amount);
  const depositPct = Number(p.deposit_percentage);
  const depositTotal = total * (depositPct / 100);
  const depositGst = depositTotal / 11;

  await sql`
    INSERT INTO invoices (project_id, user_id, client_id, total_amount, gst_amount, status)
    VALUES (${project.id}, ${p.user_id}, ${p.client_id}, ${depositTotal}, ${depositGst}, 'draft')
  `;

  // Mark approved and record event last — keeps the proposal in 'sent' if
  // something above fails so the client can retry.
  await sql`
    UPDATE proposals SET status = 'approved' WHERE id = ${proposalId}
  `;

  await sql`
    INSERT INTO proposal_events (proposal_id, event_type, description)
    VALUES (${proposalId}, 'approved', 'Proposal approved by client')
  `;
}

export async function submitChangeRequest(
  token: string,
  message: string,
): Promise<void> {
  assertToken(token);

  const trimmed = message.trim();
  if (!trimmed) throw new Error("Please describe what changes you'd like.");
  if (trimmed.length > 2000)
    throw new Error("Message must be 2000 characters or fewer.");

  const rows = await sql`
    SELECT id FROM proposals
    WHERE share_token = ${token} AND status = 'sent'
  `;
  if (rows.length === 0) {
    throw new Error("This proposal is no longer available for changes.");
  }

  const proposalId = rows[0].id as string;

  await sql`
    INSERT INTO change_requests (proposal_id, message)
    VALUES (${proposalId}, ${trimmed})
  `;

  await sql`
    UPDATE proposals SET status = 'changes_requested' WHERE id = ${proposalId}
  `;

  await sql`
    INSERT INTO proposal_events (proposal_id, event_type, description)
    VALUES (
      ${proposalId},
      'changes_requested',
      ${`Client requested changes: ${trimmed}`}
    )
  `;
}
