"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";
import {
  proposalSchema,
  uuidSchema,
  type LineItemDuration,
} from "@/lib/validation";
import {
  sendProposalEmail,
  sendProposalCommentEmail,
  getAppBaseUrl,
} from "@/lib/email";
import { notifyDevOfFailure } from "@/lib/notifications";

const GST_RATE = 0.1;

export type CreateProposalInput = {
  clientId: string;
  title: string;
  description: string;
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;
    estimatedDuration: LineItemDuration | null;
  }[];
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
        INSERT INTO line_items (proposal_id, description, quantity, unit_price, estimated_duration)
        VALUES (${proposal.id}, ${item.description}, ${item.quantity}, ${item.unitPrice}, ${item.estimatedDuration})
      `,
    ),
    sql`
      INSERT INTO proposal_events (proposal_id, event_type, description)
      VALUES (${proposal.id}, 'created', 'Proposal created')
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
  const currentStatus = existing[0].status as string;
  if (currentStatus !== "draft" && currentStatus !== "changes_requested")
    throw new Error("Only draft or changes-requested proposals can be edited.");

  const result = proposalSchema.safeParse(input);
  if (!result.success) throw new Error(result.error.issues[0].message);

  const { clientId, title, description, lineItems, depositPercentage } = result.data;

  const clientRows = await sql`
    SELECT id FROM clients WHERE id = ${clientId} AND user_id = ${user.id}
  `;
  if (clientRows.length === 0) throw new Error("Client not found.");

  const subtotal = lineItems.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const totalAmount = subtotal * (1 + GST_RATE);

  // Reset to draft when the agency edits a changes_requested proposal so it
  // can be re-reviewed and re-sent. Clearing the share_token invalidates the
  // old client-facing link.
  const wasChangesRequested = currentStatus === "changes_requested";
  if (wasChangesRequested) {
    await sql`
      UPDATE proposals
      SET client_id = ${clientId}, title = ${title}, description = ${description},
          deposit_percentage = ${depositPercentage}, total_amount = ${totalAmount},
          status = 'draft', share_token = NULL
      WHERE id = ${proposalId} AND user_id = ${user.id}
    `;
  } else {
    await sql`
      UPDATE proposals
      SET client_id = ${clientId}, title = ${title}, description = ${description},
          deposit_percentage = ${depositPercentage}, total_amount = ${totalAmount}
      WHERE id = ${proposalId} AND user_id = ${user.id}
    `;
  }

  // Replace all line items atomically (delete-then-insert keeps things simple).
  await sql`DELETE FROM line_items WHERE proposal_id = ${proposalId}`;

  await Promise.all([
    ...lineItems.map(
      (item) => sql`
        INSERT INTO line_items (proposal_id, description, quantity, unit_price, estimated_duration)
        VALUES (${proposalId}, ${item.description}, ${item.quantity}, ${item.unitPrice}, ${item.estimatedDuration})
      `,
    ),
    sql`
      INSERT INTO proposal_events (proposal_id, event_type, description)
      VALUES (${proposalId}, 'edited', 'Proposal edited')
    `,
    ...(wasChangesRequested
      ? [
          sql`
            INSERT INTO proposal_events (proposal_id, event_type, description)
            VALUES (${proposalId}, 'reset_to_draft', 'Proposal reset to draft after addressing requested changes')
          `,
        ]
      : []),
  ]);

  revalidatePath(`/dashboard/proposals/${proposalId}`);
  revalidatePath("/dashboard/proposals");
}

// ── sendProposal ─────────────────────────────────────────────────────────────

export async function sendProposal(proposalId: string): Promise<string> {
  if (!uuidSchema.safeParse(proposalId).success) throw new Error("Proposal not found.");

  const user = await getOrCreateUser();

  const rows = await sql`
    SELECT
      p.id, p.status, p.title, p.total_amount,
      c.name AS client_name, c.email AS client_email
    FROM proposals p
    JOIN clients c ON c.id = p.client_id
    WHERE p.id = ${proposalId} AND p.user_id = ${user.id}
  `;
  if (rows.length === 0) throw new Error("Proposal not found.");
  if (rows[0].status !== "draft") throw new Error("Only draft proposals can be sent.");

  const token = randomBytes(32).toString("hex");

  await sql`
    UPDATE proposals
    SET status = 'sent', share_token = ${token}
    WHERE id = ${proposalId} AND user_id = ${user.id} AND status = 'draft'
  `;

  // Bump last_contacted_at on the client so it shows up in the "recently
  // contacted" sort on the clients list. Subquery + user_id guard keeps this
  // safe even if proposalId somehow points at another agency's record.
  await sql`
    UPDATE clients
    SET last_contacted_at = now()
    WHERE id = (
      SELECT client_id FROM proposals
      WHERE id = ${proposalId} AND user_id = ${user.id}
    )
      AND user_id = ${user.id}
  `;

  await sql`
    INSERT INTO proposal_events (proposal_id, event_type, description)
    VALUES (${proposalId}, 'sent', 'Proposal sent to client')
  `;

  // Best-effort email delivery — never block the action on email failure since
  // the share link is also displayed in the UI as a fallback.
  const proposal = rows[0] as {
    title: string;
    total_amount: string;
    client_name: string;
    client_email: string | null;
  };
  if (proposal.client_email) {
    const reviewUrl = `${getAppBaseUrl()}/share/proposal/${token}`;
    const result = await sendProposalEmail({
      proposalId,
      to: proposal.client_email,
      agencyName: user.name ?? user.email,
      clientName: proposal.client_name,
      proposalTitle: proposal.title,
      totalAmount: Number(proposal.total_amount),
      reviewUrl,
    });

    await sql`
      INSERT INTO proposal_events (proposal_id, event_type, description)
      VALUES (
        ${proposalId},
        ${result.ok ? "email_sent" : "email_failed"},
        ${
          result.ok
            ? `Email sent to ${proposal.client_email}`
            : `Email to ${proposal.client_email} failed: ${result.reason}`
        }
      )
    `;
  } else {
    await sql`
      INSERT INTO proposal_events (proposal_id, event_type, description)
      VALUES (
        ${proposalId},
        'email_skipped',
        'Email not sent: client has no email address on file'
      )
    `;
  }

  revalidatePath(`/dashboard/proposals/${proposalId}`);
  revalidatePath("/dashboard/proposals");

  return token;
}

// ── deleteProposal ───────────────────────────────────────────────────────────

export async function deleteProposal(proposalId: string): Promise<void> {
  if (!uuidSchema.safeParse(proposalId).success) throw new Error("Proposal not found.");

  const user = await getOrCreateUser();

  const rows = await sql`
    SELECT id, status FROM proposals WHERE id = ${proposalId} AND user_id = ${user.id}
  `;
  if (rows.length === 0) throw new Error("Proposal not found.");
  const status = rows[0].status as string;
  if (status !== "draft" && status !== "changes_requested")
    throw new Error("Only draft or changes-requested proposals can be deleted.");

  // line_items, proposal_events, and change_requests all have ON DELETE CASCADE
  // FKs to proposals, so a single delete tears down everything.
  await sql`
    DELETE FROM proposals
    WHERE id = ${proposalId}
      AND user_id = ${user.id}
      AND status IN ('draft', 'changes_requested')
  `;

  revalidatePath("/dashboard/proposals");
}

// ── getProposal ──────────────────────────────────────────────────────────────

export type ProposalEvent = { description: string; created_at: string };

export type ChangeRequest = { message: string; created_at: string };

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
  lineItems: {
    id: string;
    description: string;
    quantity: string;
    unit_price: string;
    estimated_duration: LineItemDuration | null;
  }[];
  events: ProposalEvent[];
  latestChangeRequest: ChangeRequest | null;
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

  const [items, events, changeRequests] = await Promise.all([
    sql`
      SELECT id, description, quantity, unit_price, estimated_duration
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
    sql`
      SELECT message, created_at
      FROM change_requests
      WHERE proposal_id = ${proposalId}
      ORDER BY created_at DESC
      LIMIT 1
    `,
  ]);

  return {
    ...(rows[0] as Omit<ProposalDetail, "lineItems" | "events" | "latestChangeRequest">),
    lineItems: items as ProposalDetail["lineItems"],
    events: events as ProposalEvent[],
    latestChangeRequest: (changeRequests[0] as ChangeRequest) ?? null,
  };
}

// ── Comments ─────────────────────────────────────────────────────────────────

export type ProposalCommentRow = {
  id: string;
  author_role: "client" | "agency";
  body: string;
  created_at: string;
};

export async function getProposalComments(
  proposalId: string,
): Promise<ProposalCommentRow[]> {
  if (!uuidSchema.safeParse(proposalId).success) return [];
  // proposal_comments lands in migration 0016. Until it's applied, fall
  // back to an empty thread so the proposal detail page still renders.
  try {
    const rows = await sql`
      SELECT id, author_role, body, created_at
      FROM proposal_comments
      WHERE proposal_id = ${proposalId}
      ORDER BY created_at ASC
    `;
    return rows as ProposalCommentRow[];
  } catch {
    return [];
  }
}

const COMMENT_MAX = 2000;

export async function postAgencyComment(
  proposalId: string,
  body: string,
): Promise<void> {
  if (!uuidSchema.safeParse(proposalId).success) {
    throw new Error("Proposal not found.");
  }
  const trimmed = String(body ?? "").trim();
  if (!trimmed) throw new Error("Comment is empty.");
  if (trimmed.length > COMMENT_MAX) {
    throw new Error(`Keep it under ${COMMENT_MAX} characters.`);
  }

  const user = await getOrCreateUser();

  const rows = await sql`
    SELECT p.id, p.user_id, p.title, p.share_token,
           c.email AS client_email,
           c.name AS client_name,
           u.email AS agency_email,
           u.name AS agency_name
    FROM proposals p
    JOIN clients c ON c.id = p.client_id
    JOIN users u ON u.id = p.user_id
    WHERE p.id = ${proposalId} AND p.user_id = ${user.id}
  `;
  if (rows.length === 0) throw new Error("Proposal not found.");
  const p = rows[0] as {
    id: string;
    title: string;
    share_token: string;
    client_email: string;
    client_name: string | null;
    agency_email: string;
    agency_name: string | null;
  };

  await sql`
    INSERT INTO proposal_comments (proposal_id, author_user_id, author_role, body)
    VALUES (${proposalId}, ${user.id}, 'agency', ${trimmed})
  `;

  // Notify the client.
  if (p.client_email) {
    const res = await sendProposalCommentEmail({
      to: p.client_email,
      recipientName: p.client_name ?? "",
      authorRole: "agency",
      authorName: p.agency_name ?? user.name ?? user.email,
      proposalTitle: p.title,
      body: trimmed,
      proposalUrl: `${getAppBaseUrl()}/share/proposal/${p.share_token}`,
    }).catch((err: unknown) => ({
      ok: false as const,
      reason: err instanceof Error ? err.message : "send threw",
    }));
    if (!res.ok) {
      await notifyDevOfFailure({
        proposalId,
        agencyEmail: p.agency_email ?? "",
        agencyName: p.agency_name ?? "",
        failedEvent: "proposal_comment_to_client",
        intendedRecipient: p.client_email,
        reason: res.reason,
        contextLabel: `Comment on "${p.title}"`,
      });
    }
  }

  revalidatePath(`/dashboard/proposals/${proposalId}`);
}
