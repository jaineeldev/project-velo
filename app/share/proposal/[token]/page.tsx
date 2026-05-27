import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { CheckCircle2, Lock, MessageSquare } from "lucide-react";
import { sql } from "@/lib/db";
import { getClientIp } from "@/lib/rate-limit";
import { logSecurityEvent } from "@/lib/security-log";
import { currencyFmt, dateTimeFmt, splitGst } from "@/lib/format";
import { cn, focusRing } from "@/lib/utils";
import { ProposalActions } from "./proposal-actions";
import { ShareBackLink } from "@/components/share-back-link";
import { SharePaymentButton } from "@/components/share-payment-button";
import {
  ProposalComments,
  type ProposalCommentRow,
} from "@/components/proposal-comments";
import { postClientComment } from "./actions";

// Public portal — always fetch fresh and never let a CDN cache token-keyed
// content. The Cache-Control header is also enforced from middleware.
export const dynamic = "force-dynamic";
export const revalidate = 0;

const TOKEN_RE = /^[0-9a-f]{64}$/;

type LineItemRow = {
  description: string;
  quantity: string;
  unit_price: string;
  estimated_duration: string | null;
};

type PublicProposal = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  total_amount: string;
  deposit_percentage: string;
  client_name: string;
};

type EventRow = { description: string; created_at: string };

async function getPublicProposal(token: string) {
  if (!TOKEN_RE.test(token)) {
    logSecurityEvent({
      event: "invalid_share_token",
      route: "share/proposal",
      ip: getClientIp(headers()),
      outcome: "denied",
      reason: "token_format",
    });
    return null;
  }

  // Query by share_token only — no user or client IDs in the WHERE clause.
  // We never return user_id, client_id, client_email, or any internal IDs.
  const rows = await sql`
    SELECT
      p.id, p.title, p.description, p.status,
      p.total_amount, p.deposit_percentage,
      c.name AS client_name
    FROM proposals p
    JOIN clients c ON c.id = p.client_id
    WHERE p.share_token = ${token}
      AND p.status <> 'draft'
  `;
  if (rows.length === 0) return null;

  const proposalId = rows[0].id as string;

  const [items, events] = await Promise.all([
    sql`
      SELECT description, quantity, unit_price, estimated_duration
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

  // proposal_comments was added in migration 0016. Tolerate the table not
  // existing yet so older deployments don't 500 the entire share page
  // when this feature lands. Once the migration is applied everywhere,
  // this fallback is harmless (no error path to hit).
  let comments: ProposalCommentRow[] = [];
  try {
    const commentRows = await sql`
      SELECT id, author_role, body, created_at
      FROM proposal_comments
      WHERE proposal_id = ${proposalId}
      ORDER BY created_at ASC
    `;
    comments = commentRows as ProposalCommentRow[];
  } catch {
    // Table not yet migrated. Render an empty thread.
  }

  return {
    ...(rows[0] as PublicProposal),
    lineItems: items as LineItemRow[],
    events: events as EventRow[],
    comments,
  };
}

export default async function ShareProposalPage({
  params,
}: {
  params: { token: string };
}) {
  const { userId } = await auth();

  // Account-required gate. Unauthenticated visitors never see proposal
  // content — we don't even hit the DB for them, which avoids leaking
  // "this token resolves to a real proposal" to anyone who hasn't signed
  // up yet. Token format is still validated so a malformed link 404s
  // exactly the same way it would for an authed visitor (matches the
  // existing identical-error-for-all-failures security posture).
  if (!userId) {
    if (!TOKEN_RE.test(params.token)) {
      logSecurityEvent({
        event: "invalid_share_token",
        route: "share/proposal",
        ip: getClientIp(headers()),
        outcome: "denied",
        reason: "token_format",
      });
      notFound();
    }
    return <SignUpGate token={params.token} />;
  }

  const proposal = await getPublicProposal(params.token);
  if (!proposal) notFound();

  // Role lookup serves two purposes: deciding the back-to-dashboard link
  // destination, and the terminal-status redirect below. We read it once
  // from the DB (not the JWT) so this works even when the session-token
  // claim hasn't refreshed after sign-up.
  let viewerRole: "client" | "agency" | null = null;
  if (userId) {
    const roleRows = await sql`
      SELECT up.role
      FROM user_profiles up
      JOIN users u ON u.id = up.user_id
      WHERE u.clerk_id = ${userId}
    `;
    const r = roleRows[0]?.role;
    if (r === "client" || r === "agency") viewerRole = r;
  }

  // Clients land on the dashboard for "delivered" — there's nothing left
  // to do on the share page for that terminal state. "approved" stays
  // open so the client can see the pay-deposit CTA below.
  if (viewerRole === "client" && proposal.status === "delivered") {
    redirect("/client/dashboard");
  }

  const backHref =
    viewerRole === "client"
      ? "/client/dashboard"
      : viewerRole === "agency"
        ? "/dashboard"
        : null;

  const { total, subtotal, gst } = splitGst(Number(proposal.total_amount));
  const depositPct = Number(proposal.deposit_percentage);
  const deposit = total * (depositPct / 100);

  const isActionable = proposal.status === "sent";

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-6 py-16">
        {backHref && (
          <div className="mb-8">
            <ShareBackLink href={backHref} />
          </div>
        )}

        <div className="mb-10 border-b border-border pb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Proposal for {proposal.client_name}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            {proposal.title}
          </h1>
          {proposal.description && (
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {proposal.description}
            </p>
          )}
        </div>

        {/* Line items */}
        <section>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Scope of work
          </h2>

          <div className="overflow-hidden rounded-lg border border-border">
            <div className="grid grid-cols-[1fr_3.5rem_6rem_6.5rem_5.5rem] gap-3 border-b border-border bg-muted px-4 py-2">
              {["Description", "Qty", "Unit price", "Duration", "Total"].map((h) => (
                <span
                  key={h}
                  className="text-xs font-medium text-muted-foreground"
                >
                  {h}
                </span>
              ))}
            </div>

            {proposal.lineItems.map((item, i) => {
              const qty = Number(item.quantity);
              const price = Number(item.unit_price);
              return (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_3.5rem_6rem_6.5rem_5.5rem] gap-3 border-b border-border px-4 py-3 last:border-0"
                >
                  <span className="text-sm text-foreground">
                    {item.description}
                  </span>
                  <span className="text-sm text-muted-foreground">{qty}</span>
                  <span className="text-sm text-muted-foreground">
                    {currencyFmt.format(price)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {item.estimated_duration ?? "—"}
                  </span>
                  <span className="text-right text-sm font-medium text-foreground">
                    {currencyFmt.format(qty * price)}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Totals */}
        <section className="mt-6 flex flex-col items-end gap-2 text-sm">
          <div className="flex w-56 justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium text-foreground">
              {currencyFmt.format(subtotal)}
            </span>
          </div>
          <div className="flex w-56 justify-between">
            <span className="text-muted-foreground">GST (10%)</span>
            <span className="font-medium text-foreground">
              {currencyFmt.format(gst)}
            </span>
          </div>
          <div className="flex w-56 justify-between border-t border-border pt-2">
            <span className="font-semibold text-foreground">Total</span>
            <span className="font-semibold text-foreground">
              {currencyFmt.format(total)}
            </span>
          </div>
          {depositPct > 0 && (
            <div className="flex w-56 justify-between pt-1">
              <span className="text-muted-foreground">
                Deposit ({depositPct}%)
              </span>
              <span className="font-medium text-foreground">
                {currencyFmt.format(deposit)}
              </span>
            </div>
          )}
        </section>

        {/* Client actions */}
        {isActionable && (
          <section className="mt-12 border-t border-border pt-8">
            <h2 className="mb-2 text-base font-semibold text-foreground">
              Your response
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Review the proposal above and let us know how you&apos;d like to
              proceed.
            </p>
            <ProposalActions
              token={params.token}
              initialStatus={proposal.status}
            />
          </section>
        )}

        {/* Non-actionable status banners */}
        {!isActionable && (
          <section className="mt-12">
            {proposal.status === "approved" && (
              <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
                    <CheckCircle2
                      aria-hidden
                      className="h-5 w-5 text-primary"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      Proposal approved
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      This proposal has been approved. The team is getting
                      started.
                    </p>
                  </div>
                </div>
                {depositPct > 0 && (
                  <div className="mt-6 border-t border-border pt-5">
                    {deposit > 0 ? (
                      <>
                        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                          Deposit owed
                        </p>
                        <div className="mt-3">
                          <SharePaymentButton
                            label="Pay deposit"
                            amount={currencyFmt.format(deposit)}
                          />
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                          Deposit
                        </p>
                        <span className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                          Voided · {currencyFmt.format(0)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {proposal.status === "changes_requested" && (
              <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-6 shadow-sm">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
                  <MessageSquare
                    aria-hidden
                    className="h-5 w-5 text-muted-foreground"
                  />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    Changes requested
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Your change request has been received. The team will be in
                    touch with an updated proposal.
                  </p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Event log */}
        {proposal.events.length > 0 && (
          <section className="mt-12 border-t border-border pt-8">
            <h2 className="mb-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Activity
            </h2>
            <ol className="space-y-4">
              {proposal.events.map((ev, i) => (
                <li key={i} className="flex items-baseline gap-4">
                  <span className="w-40 shrink-0 text-xs text-muted-foreground">
                    {dateTimeFmt.format(new Date(ev.created_at))}
                  </span>
                  <span className="whitespace-pre-wrap text-sm text-foreground">
                    {ev.description}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        )}

        <section className="mt-12 border-t border-border pt-8">
          <h2 className="mb-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Comments
          </h2>
          <ProposalComments
            comments={proposal.comments}
            canPost={viewerRole === "client"}
            disabledReason={
              viewerRole === "agency"
                ? "You're viewing this as the agency. Comment from your dashboard instead."
                : viewerRole === null
                  ? "Sign in to comment on this proposal."
                  : undefined
            }
            postAction={async (body) => {
              "use server";
              await postClientComment(params.token, body);
            }}
          />
        </section>

        <div className="mt-16 flex flex-col items-center gap-1 text-xs text-muted-foreground">
          <p>Powered by Velo</p>
          <Link
            href="/privacy"
            className="rounded underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </main>
  );
}

// Account-required gate shown to anonymous visitors. Carries the share
// token through to sign-up via the ?proposal= query param so the new
// account lands back on this page after onboarding. The sign-in fallback
// uses Clerk's redirect_url so returning clients also end up here.
function SignUpGate({ token }: { token: string }) {
  const signUpHref = `/sign-up/client?proposal=${token}`;
  const signInHref = `/sign-in?redirect_url=${encodeURIComponent(
    `/share/proposal/${token}`,
  )}`;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Lock aria-hidden className="h-5 w-5" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-foreground">
          Create your free Velo account to view and approve this proposal
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Client accounts are always free. Signing up gives you a verified
          identity trail on every approval and a single place to track every
          proposal and project shared with you.
        </p>
        <Link
          href={signUpHref}
          className={cn(
            "mt-8 inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90",
            focusRing,
          )}
        >
          Create free account
        </Link>
        <p className="mt-4 text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link
            href={signInHref}
            className={cn(
              "rounded font-medium text-foreground underline-offset-2 hover:underline",
              focusRing,
            )}
          >
            Sign in
          </Link>
        </p>
        <div className="mt-16 flex flex-col items-center gap-1 text-xs text-muted-foreground">
          <p>Powered by Velo</p>
          <Link
            href="/privacy"
            className={cn(
              "rounded underline-offset-2 hover:underline",
              focusRing,
            )}
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </main>
  );
}
