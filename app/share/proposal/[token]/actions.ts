"use server";

import { randomBytes, randomUUID } from "crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { getClientIp } from "@/lib/rate-limit";
import { logSecurityEvent } from "@/lib/security-log";
import {
  getAppBaseUrl,
  sendDevChangesRequestedEmail,
  sendDevProposalApprovedEmail,
  sendInvoiceIssuedEmail,
  sendProposalCommentEmail,
} from "@/lib/email";
import { logEmailFailureEvent, notifyDevOfFailure } from "@/lib/notifications";
import { getOrCreateUser } from "@/lib/auth";

// 64 hex chars = 32 random bytes = 256 bits of entropy.
const TOKEN_RE = /^[0-9a-f]{64}$/;

function assertToken(token: string, route: string) {
  if (!TOKEN_RE.test(token)) {
    logSecurityEvent({
      event: "invalid_share_token",
      route,
      ip: getClientIp(headers()),
      outcome: "denied",
      reason: "token_format",
    });
    // Identical error message regardless of failure reason — prevents
    // attackers distinguishing "bad format" from "not found".
    throw new Error("This link is no longer valid.");
  }
}

export async function approveProposal(token: string): Promise<void> {
  assertToken(token, "share/proposal/approve");

  const rows = await sql`
    SELECT p.id, p.user_id, p.client_id, p.title,
           p.total_amount, p.deposit_percentage, p.status
    FROM proposals p
    WHERE p.share_token = ${token}
      AND p.status = 'sent'
  `;
  if (rows.length === 0) {
    logSecurityEvent({
      event: "invalid_share_token",
      route: "share/proposal/approve",
      ip: getClientIp(headers()),
      outcome: "denied",
      reason: "not_found_or_wrong_status",
    });
    throw new Error("This link is no longer valid.");
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

  const items = await sql`
    SELECT description, quantity, unit_price, estimated_duration
    FROM line_items
    WHERE proposal_id = ${proposalId}
    ORDER BY created_at
  `;

  // Generate the project UUID up-front so the invoice insert can reference it
  // inside the same atomic batch — Neon's sql.transaction() can't pass values
  // between queries. The share_token powers the public client portal at
  // /share/project/[token] — 32 random bytes => 256 bits of entropy.
  const projectId = randomUUID();
  const projectShareToken = randomBytes(32).toString("hex");

  const total = Number(p.total_amount);
  const depositPct = Number(p.deposit_percentage);
  const depositTotal = total * (depositPct / 100);
  const depositGst = depositTotal / 11;

  // All writes in a single transaction — partial state on mid-batch failure
  // would otherwise leave a project with no invoice or vice-versa.
  await sql.transaction([
    sql`
      INSERT INTO projects (id, proposal_id, client_id, user_id, title, status, share_token)
      VALUES (${projectId}, ${proposalId}, ${p.client_id}, ${p.user_id}, ${p.title}, 'active', ${projectShareToken})
    `,
    ...items.map((item) => {
      const amount = Number(item.quantity) * Number(item.unit_price);
      return sql`
        INSERT INTO milestones (proposal_id, title, amount, status, estimated_duration)
        VALUES (${proposalId}, ${item.description}, ${amount}, 'not_started', ${item.estimated_duration})
      `;
    }),
    sql`
      INSERT INTO invoices (project_id, user_id, client_id, total_amount, gst_amount, status, type)
      VALUES (${projectId}, ${p.user_id}, ${p.client_id}, ${depositTotal}, ${depositGst}, 'unpaid', 'deposit')
    `,
    sql`
      UPDATE proposals SET status = 'approved' WHERE id = ${proposalId}
    `,
    sql`
      INSERT INTO proposal_events (proposal_id, event_type, description)
      VALUES (${proposalId}, 'approved', 'Proposal approved by client')
    `,
  ]);

  // Fetch agency + client details once so both the dev-side approval
  // notification and the client-side deposit invoice email can be sent
  // from the same data. Agency email is used for operator alerts.
  const details = await sql`
    SELECT
      c.email AS client_email,
      c.name AS client_name,
      u.email AS agency_email,
      u.name AS agency_name
    FROM clients c
    JOIN users u ON u.id = ${p.user_id}
    WHERE c.id = ${p.client_id}
  `;
  const row = details[0];
  const clientEmail = (row?.client_email as string | undefined) ?? "";
  const clientName = (row?.client_name as string | null) ?? "";
  const agencyEmail = (row?.agency_email as string | undefined) ?? "";
  const agencyName = (row?.agency_name as string | null) ?? "";
  const proposalUrl = `${getAppBaseUrl()}/dashboard/proposals/${proposalId}`;
  const projectUrl = `${getAppBaseUrl()}/share/project/${projectShareToken}`;

  // Dev-side: tell the operator their proposal was approved.
  if (agencyEmail) {
    try {
      const res = await sendDevProposalApprovedEmail({
        to: agencyEmail,
        agencyName,
        proposalTitle: (p.title as string) ?? "",
        clientName,
        totalAmount: total,
        proposalUrl,
      });
      if (!res.ok) {
        await logEmailFailureEvent(proposalId, "dev_proposal_approved");
      }
    } catch {
      await logEmailFailureEvent(proposalId, "dev_proposal_approved");
    }
  }

  // Client-side: deposit invoice notification. Voided ($0) deposits don't
  // need an email since there's nothing to pay.
  if (depositTotal > 0 && clientEmail) {
    const res = await sendInvoiceIssuedEmail({
      to: clientEmail,
      clientName,
      agencyName,
      invoiceType: "deposit",
      totalAmount: depositTotal,
      projectTitle: (p.title as string) ?? "",
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
        failedEvent: "invoice_issued_deposit",
        intendedRecipient: clientEmail,
        reason: res.reason,
        contextLabel: `Deposit invoice for "${p.title}"`,
      });
    }
  }
}


export async function submitChangeRequest(
  token: string,
  message: string,
): Promise<void> {
  assertToken(token, "share/proposal/change");

  const trimmed = message.trim();
  if (!trimmed || trimmed.length > 2000) {
    logSecurityEvent({
      event: "validation_failed",
      route: "share/proposal/change",
      ip: getClientIp(headers()),
      outcome: "denied",
      reason: trimmed ? "message_too_long" : "message_empty",
    });
    throw new Error(
      trimmed
        ? "Message must be 2000 characters or fewer."
        : "Please describe what changes you'd like.",
    );
  }

  const rows = await sql`
    SELECT id FROM proposals
    WHERE share_token = ${token} AND status = 'sent'
  `;
  if (rows.length === 0) {
    logSecurityEvent({
      event: "invalid_share_token",
      route: "share/proposal/change",
      ip: getClientIp(headers()),
      outcome: "denied",
      reason: "not_found_or_wrong_status",
    });
    throw new Error("This link is no longer valid.");
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

  // Dev-side: tell the operator their client wants changes.
  try {
    const details = await sql`
      SELECT
        p.title AS proposal_title,
        c.name AS client_name,
        u.email AS agency_email,
        u.name AS agency_name
      FROM proposals p
      JOIN clients c ON c.id = p.client_id
      JOIN users u ON u.id = p.user_id
      WHERE p.id = ${proposalId}
    `;
    const row = details[0];
    const agencyEmail = (row?.agency_email as string | undefined) ?? "";
    if (agencyEmail) {
      const res = await sendDevChangesRequestedEmail({
        to: agencyEmail,
        agencyName: (row?.agency_name as string | null) ?? "",
        proposalTitle: (row?.proposal_title as string) ?? "",
        clientName: (row?.client_name as string | null) ?? "",
        message: trimmed,
        proposalUrl: `${getAppBaseUrl()}/dashboard/proposals/${proposalId}`,
      });
      if (!res.ok) {
        await logEmailFailureEvent(proposalId, "dev_changes_requested");
      }
    }
  } catch {
    await logEmailFailureEvent(proposalId, "dev_changes_requested");
  }
}

// ── Comments ─────────────────────────────────────────────────────────────────

const COMMENT_MAX = 2000;

export async function postClientComment(
  token: string,
  body: string,
): Promise<void> {
  assertToken(token, "share/proposal/comment");

  const trimmed = String(body ?? "").trim();
  if (!trimmed) throw new Error("Comment is empty.");
  if (trimmed.length > COMMENT_MAX) {
    throw new Error(`Keep it under ${COMMENT_MAX} characters.`);
  }

  const user = await getOrCreateUser();

  // Look up the proposal + matching client. The signed-in user must be
  // the client (case-insensitive email match) before they can post.
  // Draft proposals can't be commented on — the client shouldn't even
  // see them.
  const rows = await sql`
    SELECT p.id, p.user_id, p.title, p.share_token,
           c.email AS client_email,
           c.name AS client_name,
           u.name AS agency_name,
           u.email AS agency_email
    FROM proposals p
    JOIN clients c ON c.id = p.client_id
    JOIN users u ON u.id = p.user_id
    WHERE p.share_token = ${token} AND p.status <> 'draft'
  `;
  if (rows.length === 0) throw new Error("This link is no longer valid.");
  const p = rows[0] as {
    id: string;
    user_id: string;
    title: string;
    share_token: string;
    client_email: string;
    client_name: string | null;
    agency_name: string | null;
    agency_email: string;
  };

  if (String(p.client_email).toLowerCase() !== user.email.toLowerCase()) {
    logSecurityEvent({
      event: "comment_authorization_failed",
      route: "share/proposal/comment",
      ip: getClientIp(headers()),
      outcome: "denied",
      reason: "email_mismatch",
    });
    throw new Error("Only the client this proposal was sent to can comment.");
  }

  await sql`
    INSERT INTO proposal_comments (proposal_id, author_user_id, author_role, body)
    VALUES (${p.id}, ${user.id}, 'client', ${trimmed})
  `;

  // Notify the agency. The target is the operator, so a failed send is
  // logged in the audit trail; there's no follow-up email since we can't
  // alert the dev via the channel that just failed.
  try {
    const res = await sendProposalCommentEmail({
      to: p.agency_email,
      recipientName: p.agency_name ?? "",
      authorRole: "client",
      authorName: user.name ?? user.email,
      proposalTitle: p.title,
      body: trimmed,
      proposalUrl: `${getAppBaseUrl()}/dashboard/proposals/${p.id}`,
    });
    if (!res.ok) await logEmailFailureEvent(p.id, "proposal_comment_to_agency");
  } catch {
    await logEmailFailureEvent(p.id, "proposal_comment_to_agency");
  }

  revalidatePath(`/share/proposal/${token}`);
}
