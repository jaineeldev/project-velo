"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { getClientIp } from "@/lib/rate-limit";
import { logSecurityEvent } from "@/lib/security-log";
import { getAppBaseUrl } from "@/lib/email";
import { sendOperatorNotification } from "@/lib/notifications";
import { getStripe } from "@/lib/stripe";

const TOKEN_RE = /^[0-9a-f]{64}$/;
const INVOICE_ID_RE = /^[0-9a-f-]{36}$/;

// Mirrors the proposal-side change_requests message cap so the operator's
// inbox can't be flooded by a single huge submission and the textarea has a
// concrete server-enforced ceiling.
const MESSAGE_MAX = 2000;

// Client-submitted change request on an active or completed project. The
// proposal-stage equivalent lives in
// app/share/proposal/[token]/actions.ts:submitChangeRequest and writes the
// same change_requests table. Both insert against proposal_id since that
// remains the row's anchor after approval.
export async function submitProjectChangeRequest(
  token: string,
  description: string,
): Promise<void> {
  if (!TOKEN_RE.test(token)) {
    logSecurityEvent({
      event: "invalid_share_token",
      route: "share/project/change",
      ip: getClientIp(headers()),
      outcome: "denied",
      reason: "token_format",
    });
    throw new Error("This link is no longer valid.");
  }

  const trimmed = description.trim();
  if (!trimmed || trimmed.length > MESSAGE_MAX) {
    logSecurityEvent({
      event: "validation_failed",
      route: "share/project/change",
      ip: getClientIp(headers()),
      outcome: "denied",
      reason: trimmed ? "message_too_long" : "message_empty",
    });
    throw new Error(
      trimmed
        ? `Please keep the description under ${MESSAGE_MAX} characters.`
        : "Please describe the change you need.",
    );
  }

  // Resolve project + owning agency + client name in one round-trip. The
  // status filter enforces the spec: 'delivered' projects are read-only
  // for change requests. 'active' and 'completed' both accept new CRs
  // (completed means all milestones done; the final invoice may still be
  // outstanding, and clients often spot late tweaks during that window).
  const rows = await sql`
    SELECT pr.id, pr.proposal_id, pr.user_id, pr.title AS project_title,
           c.name AS client_name
    FROM projects pr
    JOIN clients c ON c.id = pr.client_id
    WHERE pr.share_token = ${token}
      AND pr.status IN ('active', 'completed')
  `;
  if (rows.length === 0) {
    logSecurityEvent({
      event: "invalid_share_token",
      route: "share/project/change",
      ip: getClientIp(headers()),
      outcome: "denied",
      reason: "not_found_or_wrong_status",
    });
    throw new Error("This link is no longer valid.");
  }

  const project = rows[0] as {
    id: string;
    proposal_id: string;
    user_id: string;
    project_title: string;
    client_name: string | null;
  };

  await sql.transaction([
    sql`
      INSERT INTO change_requests (proposal_id, message)
      VALUES (${project.proposal_id}, ${trimmed})
    `,
    sql`
      INSERT INTO proposal_events (proposal_id, event_type, description)
      VALUES (
        ${project.proposal_id},
        'change_request_submitted',
        ${`Client submitted change request: ${trimmed}`}
      )
    `,
  ]);

  sendOperatorNotification(project.user_id, {
    kind: "change_request_submitted",
    proposalId: project.proposal_id,
    clientName: project.client_name ?? "",
    projectTitle: project.project_title,
    description: trimmed,
    projectUrl: `${getAppBaseUrl()}/dashboard/projects/${project.id}`,
  });

  revalidatePath(`/share/project/${token}`);
}

// Creates a Stripe Checkout Session for one invoice and returns the hosted
// URL. The client navigates to that URL; on success Stripe redirects them
// back to the project share page and our webhook flips the invoice to paid.
//
// Validation order: token format -> invoice id format -> token + invoice
// must match the same project -> invoice must be unpaid and non-zero. We
// don't trust the invoice id alone because the share page is public; the
// share token is the auth boundary.
export async function createInvoiceCheckoutSession(
  token: string,
  invoiceId: string,
): Promise<{ url: string }> {
  if (!TOKEN_RE.test(token)) {
    logSecurityEvent({
      event: "invalid_share_token",
      route: "share/project/invoice/checkout",
      ip: getClientIp(headers()),
      outcome: "denied",
      reason: "token_format",
    });
    throw new Error("This link is no longer valid.");
  }
  if (!INVOICE_ID_RE.test(invoiceId)) {
    logSecurityEvent({
      event: "validation_failed",
      route: "share/project/invoice/checkout",
      ip: getClientIp(headers()),
      outcome: "denied",
      reason: "invoice_id_format",
    });
    throw new Error("Invalid invoice reference.");
  }

  const rows = await sql`
    SELECT i.id, i.total_amount, i.status, i.type, i.stripe_session_id,
           pr.title AS project_title, c.name AS client_name
    FROM invoices i
    JOIN projects pr ON pr.id = i.project_id
    JOIN clients c ON c.id = i.client_id
    WHERE i.id = ${invoiceId}
      AND pr.share_token = ${token}
  `;
  if (rows.length === 0) {
    logSecurityEvent({
      event: "invalid_share_token",
      route: "share/project/invoice/checkout",
      ip: getClientIp(headers()),
      outcome: "denied",
      reason: "invoice_not_under_token",
    });
    throw new Error("This invoice is not available on this link.");
  }

  const invoice = rows[0] as {
    id: string;
    total_amount: string | number;
    status: string;
    type: "deposit" | "final";
    stripe_session_id: string | null;
    project_title: string;
    client_name: string | null;
  };

  if (invoice.status !== "unpaid") {
    throw new Error("This invoice has already been paid.");
  }
  const amount = Number(invoice.total_amount);
  if (!(amount > 0)) {
    throw new Error("This invoice has no balance owing.");
  }

  // Stripe wants the smallest currency unit. AUD has 2 decimals, so cents.
  // Math.round protects against floats like 99.999999 from intermediate
  // calculations producing 9999 instead of 10000.
  const amountCents = Math.round(amount * 100);

  const baseUrl = getAppBaseUrl();
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "aud",
          unit_amount: amountCents,
          product_data: {
            name: `${invoice.project_title} (${invoice.type === "deposit" ? "Deposit" : "Final invoice"})`,
          },
        },
      },
    ],
    success_url: `${baseUrl}/share/project/${token}?paid=${invoice.id}`,
    cancel_url: `${baseUrl}/share/project/${token}?cancelled=1`,
    metadata: {
      invoice_id: invoice.id,
      project_share_token: token,
    },
  });

  if (!session.url) {
    throw new Error("Stripe did not return a Checkout URL.");
  }

  await sql`
    UPDATE invoices
    SET stripe_session_id = ${session.id}
    WHERE id = ${invoice.id}
  `;

  return { url: session.url };
}
