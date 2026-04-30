import { notFound } from "next/navigation";
import Link from "next/link";
import { getProposal } from "../actions";
import { SendProposalButton } from "./send-proposal-button";
import { ShareLinkDisplay } from "./share-link-display";

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

const eventFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const statusStyles: Record<string, string> = {
  draft:
    "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
  sent: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  pending:
    "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  approved:
    "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400",
  changes_requested:
    "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  accepted:
    "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400",
  declined: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
};

export default async function ProposalDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const proposal = await getProposal(params.id);
  if (!proposal) notFound();

  const total = Number(proposal.total_amount);
  const subtotal = total / 1.1;
  const gst = total - subtotal;
  const depositPct = Number(proposal.deposit_percentage);
  const deposit = total * (depositPct / 100);

  return (
    <div className="px-10 py-12">
      <Link
        href="/dashboard/proposals"
        className="inline-flex items-center gap-1 text-sm text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
      >
        ← Proposals
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            {proposal.title}
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {proposal.client_name}
            {proposal.client_email ? ` · ${proposal.client_email}` : ""}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusStyles[proposal.status] ?? statusStyles.draft}`}
          >
            {proposal.status.replace("_", " ")}
          </span>
          {proposal.status === "draft" && (
            <Link
              href={`/dashboard/proposals/${params.id}/edit`}
              className="rounded-md border border-neutral-200 px-3.5 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-900"
            >
              Edit proposal
            </Link>
          )}
        </div>
      </div>

      {proposal.description && (
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          {proposal.description}
        </p>
      )}

      {/* Line items */}
      <div className="mt-10">
        <div className="grid grid-cols-[1fr_5rem_8rem_7rem] gap-3 border-b border-neutral-200 pb-2 dark:border-neutral-800">
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
              className="grid grid-cols-[1fr_5rem_8rem_7rem] gap-3 border-b border-neutral-100 py-3 dark:border-neutral-900"
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

      {/* Totals */}
      <div className="mt-6 flex flex-col items-end gap-2 text-sm">
        <div className="flex w-64 justify-between gap-8">
          <span className="text-neutral-500 dark:text-neutral-400">
            Subtotal
          </span>
          <span className="font-medium text-neutral-900 dark:text-neutral-100">
            ${subtotal.toFixed(2)}
          </span>
        </div>
        <div className="flex w-64 justify-between gap-8">
          <span className="text-neutral-500 dark:text-neutral-400">
            GST (10%)
          </span>
          <span className="font-medium text-neutral-900 dark:text-neutral-100">
            ${gst.toFixed(2)}
          </span>
        </div>
        <div className="flex w-64 justify-between gap-8 border-t border-neutral-200 pt-2 dark:border-neutral-800">
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">
            Total
          </span>
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">
            ${total.toFixed(2)}
          </span>
        </div>
        {depositPct > 0 && (
          <div className="flex w-64 justify-between gap-8 pt-1">
            <span className="text-neutral-500 dark:text-neutral-400">
              Deposit ({depositPct}%)
            </span>
            <span className="font-medium text-neutral-900 dark:text-neutral-100">
              ${deposit.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* Send / share-link section */}
      <div className="mt-10 border-t border-neutral-200 pt-6 dark:border-neutral-800">
        {proposal.status === "draft" ? (
          <div className="flex flex-wrap items-center gap-4">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Ready to share with your client?
            </p>
            <SendProposalButton proposalId={params.id} />
          </div>
        ) : proposal.share_token ? (
          <div>
            <p className="mb-3 text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Client link
            </p>
            <ShareLinkDisplay token={proposal.share_token} />
          </div>
        ) : null}
      </div>

      {/* Event log */}
      {proposal.events.length > 0 && (
        <div className="mt-10 border-t border-neutral-200 pt-8 dark:border-neutral-800">
          <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Activity
          </h2>
          <ol className="space-y-4">
            {proposal.events.map((ev, i) => (
              <li key={i} className="flex items-baseline gap-4">
                <span className="w-40 shrink-0 text-xs text-neutral-400 dark:text-neutral-600">
                  {eventFmt.format(new Date(ev.created_at))}
                </span>
                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                  {ev.description}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <p className="mt-10 text-xs text-neutral-400 dark:text-neutral-600">
        Created {dateFmt.format(new Date(proposal.created_at))}
      </p>
    </div>
  );
}
