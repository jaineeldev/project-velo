import { headers } from "next/headers";
import type Stripe from "stripe";
import { sql } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { logSecurityEvent } from "@/lib/security-log";
import { sendOperatorNotification } from "@/lib/notifications";
import { getAppBaseUrl } from "@/lib/email";

// Stripe signs every webhook with a secret unique to the endpoint. The
// signature is calculated over the raw request bytes, so we MUST read the
// body as text before any framework parses it. Next 14 server routes get
// the raw stream via req.text(); do not switch to req.json() here.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const ip = getClientIp(req.headers);
  const limit = await checkRateLimit(`webhook:stripe:${ip}`, 120, 60_000);
  if (!limit.ok) {
    return new Response("Too many requests", {
      status: 429,
      headers: { "Retry-After": String(limit.retryAfterSeconds) },
    });
  }

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return new Response("STRIPE_WEBHOOK_SECRET not set", { status: 500 });
  }

  const sig = headers().get("stripe-signature");
  if (!sig) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, secret);
  } catch {
    logSecurityEvent({
      event: "webhook_signature_invalid",
      route: "api/webhooks/stripe",
      ip,
      outcome: "denied",
    });
    return new Response("Invalid signature", { status: 400 });
  }

  // Stripe retries failed deliveries with the same event id; the handler
  // must be idempotent. The UPDATE below filters on status = 'unpaid' so a
  // second delivery is a no-op (zero rows updated, no double-notification).
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const invoiceId = session.metadata?.invoice_id;
    if (!invoiceId) {
      return new Response("Missing invoice_id in metadata", { status: 400 });
    }

    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : (session.payment_intent?.id ?? null);

    const updated = await sql`
      UPDATE invoices
      SET status = 'paid',
          paid_at = now(),
          stripe_payment_intent_id = ${paymentIntentId}
      WHERE id = ${invoiceId}
        AND status = 'unpaid'
      RETURNING id, project_id, user_id, total_amount, type
    `;

    if (updated.length === 0) {
      // Already-paid or unknown invoice. Stripe gets a 2xx so it stops
      // retrying; nothing useful to do here.
      return new Response("ok", { status: 200 });
    }

    const row = updated[0] as {
      id: string;
      project_id: string;
      user_id: string;
      total_amount: string | number;
      type: "deposit" | "final";
    };

    const ctxRows = await sql`
      SELECT pr.title AS project_title, pr.proposal_id, c.name AS client_name
      FROM projects pr
      JOIN clients c ON c.id = pr.client_id
      WHERE pr.id = ${row.project_id}
    `;
    const ctx = ctxRows[0] as
      | { project_title: string; proposal_id: string; client_name: string | null }
      | undefined;

    if (ctx) {
      const amount = Number(row.total_amount);
      const label = row.type === "deposit" ? "deposit" : "final invoice";

      // Audit trail on the proposal/project history. Mirrors the existing
      // 'approved' / 'changes_requested' style entries.
      await sql`
        INSERT INTO proposal_events (proposal_id, event_type, description)
        VALUES (
          ${ctx.proposal_id},
          'invoice_paid',
          ${`Client paid ${label} of $${amount.toFixed(2)}`}
        )
      `;

      sendOperatorNotification(row.user_id, {
        kind: "invoice_paid",
        proposalId: ctx.proposal_id,
        invoiceId: row.id,
        clientName: ctx.client_name ?? "Your client",
        projectTitle: ctx.project_title,
        invoiceType: row.type,
        amount,
        projectUrl: `${getAppBaseUrl()}/dashboard/projects/${row.project_id}`,
      });
    }
  }

  // Stripe expects 2xx for "delivered". Anything else triggers retries.
  return new Response("ok", { status: 200 });
}
