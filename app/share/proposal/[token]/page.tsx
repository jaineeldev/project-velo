import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import { ProposalActions } from "./proposal-actions";

const TOKEN_RE = /^[0-9a-f]{64}$/;

const eventFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

type LineItemRow = {
  description: string;
  quantity: string;
  unit_price: string;
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
  if (!TOKEN_RE.test(token)) return null;

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
      SELECT description, quantity, unit_price
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
    ...(rows[0] as PublicProposal),
    lineItems: items as LineItemRow[],
    events: events as EventRow[],
  };
}

export default async function ShareProposalPage({
  params,
}: {
  params: { token: string };
}) {
  const proposal = await getPublicProposal(params.token);
  if (!proposal) notFound();

  const total = Number(proposal.total_amount);
  const subtotal = total / 1.1;
  const gst = total - subtotal;
  const depositPct = Number(proposal.deposit_percentage);
  const deposit = total * (depositPct / 100);

  const isActionable = proposal.status === "sent";

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="mx-auto max-w-2xl px-6 py-16">
        {/* Header */}
        <div className="mb-10 border-b border-neutral-200 pb-8 dark:border-neutral-800">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-600">
            Proposal for {proposal.client_name}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            {proposal.title}
          </h1>
          {proposal.description && (
            <p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              {proposal.description}
            </p>
          )}
        </div>

        {/* Line items */}
        <section>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-600">
            Scope of work
          </h2>

          <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
            <div className="grid grid-cols-[1fr_4rem_7rem_6rem] gap-3 border-b border-neutral-200 bg-neutral-100 px-4 py-2 dark:border-neutral-800 dark:bg-neutral-900">
              {["Description", "Qty", "Unit price", "Total"].map((h) => (
                <span
                  key={h}
                  className="text-xs font-medium text-neutral-500 dark:text-neutral-400"
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
                  className="grid grid-cols-[1fr_4rem_7rem_6rem] gap-3 border-b border-neutral-100 px-4 py-3 last:border-0 dark:border-neutral-900"
                >
                  <span className="text-sm text-neutral-900 dark:text-neutral-100">
                    {item.description}
                  </span>
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">
                    {qty}
                  </span>
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">
                    ${price.toFixed(2)}
                  </span>
                  <span className="text-right text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    ${(qty * price).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Totals */}
        <section className="mt-6 flex flex-col items-end gap-2 text-sm">
          <div className="flex w-56 justify-between">
            <span className="text-neutral-500 dark:text-neutral-400">
              Subtotal
            </span>
            <span className="font-medium text-neutral-900 dark:text-neutral-100">
              ${subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex w-56 justify-between">
            <span className="text-neutral-500 dark:text-neutral-400">
              GST (10%)
            </span>
            <span className="font-medium text-neutral-900 dark:text-neutral-100">
              ${gst.toFixed(2)}
            </span>
          </div>
          <div className="flex w-56 justify-between border-t border-neutral-200 pt-2 dark:border-neutral-800">
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
              Total
            </span>
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
              ${total.toFixed(2)}
            </span>
          </div>
          {depositPct > 0 && (
            <div className="flex w-56 justify-between pt-1">
              <span className="text-neutral-500 dark:text-neutral-400">
                Deposit ({depositPct}%)
              </span>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                ${deposit.toFixed(2)}
              </span>
            </div>
          )}
        </section>

        {/* Client actions */}
        {isActionable && (
          <section className="mt-12 border-t border-neutral-200 pt-8 dark:border-neutral-800">
            <h2 className="mb-2 text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Your response
            </h2>
            <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
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
              <div className="rounded-lg border border-green-200 bg-green-50 p-6 dark:border-green-900 dark:bg-green-950">
                <p className="font-semibold text-green-800 dark:text-green-200">
                  Proposal approved
                </p>
                <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                  This proposal has been approved. The team is getting started.
                </p>
              </div>
            )}
            {proposal.status === "changes_requested" && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 dark:border-amber-900 dark:bg-amber-950">
                <p className="font-semibold text-amber-800 dark:text-amber-200">
                  Changes requested
                </p>
                <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                  Your change request has been received. The team will be in
                  touch with an updated proposal.
                </p>
              </div>
            )}
          </section>
        )}

        {/* Event log */}
        {proposal.events.length > 0 && (
          <section className="mt-12 border-t border-neutral-200 pt-8 dark:border-neutral-800">
            <h2 className="mb-5 text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-600">
              Activity
            </h2>
            <ol className="space-y-4">
              {proposal.events.map((ev, i) => (
                <li key={i} className="flex items-baseline gap-4">
                  <span className="w-40 shrink-0 text-xs text-neutral-400 dark:text-neutral-600">
                    {eventFmt.format(new Date(ev.created_at))}
                  </span>
                  <span className="whitespace-pre-wrap text-sm text-neutral-700 dark:text-neutral-300">
                    {ev.description}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        )}

        <p className="mt-16 text-center text-xs text-neutral-300 dark:text-neutral-700">
          Powered by whereismyapp
        </p>
      </div>
    </main>
  );
}
