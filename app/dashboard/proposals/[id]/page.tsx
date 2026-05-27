import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getProposal,
  getProposalComments,
  postAgencyComment,
} from "../actions";
import { SendProposalButton } from "./send-proposal-button";
import { ShareLinkDisplay } from "./share-link-display";
import { DeleteProposalButton } from "./delete-proposal-button";
import { ProposalComments } from "@/components/proposal-comments";
import { getOrCreateUser } from "@/lib/auth";
import {
  getUserProfile,
  formatAbn,
  formatAddressLine,
} from "@/lib/user-profile";
import {
  currencyFmt,
  dateLongFmt,
  dateTimeFmt,
  splitGst,
} from "@/lib/format";
import { cn, focusRing } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function ProposalDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // Resolve user first (cached for the request), then fetch the proposal and
  // the agency profile in parallel — the "From" block doesn't depend on
  // proposal data, so there's no reason for it to wait.
  const user = await getOrCreateUser();
  const [proposal, profile, comments] = await Promise.all([
    getProposal(params.id),
    getUserProfile(user.id),
    getProposalComments(params.id),
  ]);
  if (!proposal) notFound();

  const agencyName = profile.business_name ?? user.name ?? user.email;
  const agencyAddress = formatAddressLine(profile);
  const agencyAbn = formatAbn(profile.abn);

  const { total, subtotal, gst } = splitGst(Number(proposal.total_amount));
  const depositPct = Number(proposal.deposit_percentage);
  const deposit = total * (depositPct / 100);

  return (
    <div className="px-10 py-12">
      <Link
        href="/dashboard/proposals"
        className={cn(
          "inline-flex items-center gap-1 rounded text-sm text-muted-foreground transition-colors hover:text-foreground",
          focusRing,
        )}
      >
        ← Proposals
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {proposal.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {proposal.client_name}
            {proposal.client_email ? ` · ${proposal.client_email}` : ""}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <StatusBadge status={proposal.status} />
          {(proposal.status === "draft" ||
            proposal.status === "changes_requested") && (
            <Link
              href={`/dashboard/proposals/${params.id}/edit`}
              className={cn(
                "rounded-md border border-border px-3.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent",
                focusRing,
              )}
            >
              Edit proposal
            </Link>
          )}
          {(proposal.status === "draft" ||
            proposal.status === "changes_requested") && (
            <DeleteProposalButton proposalId={params.id} />
          )}
          <a
            href={`/api/proposals/${params.id}/pdf`}
            className={cn(
              "rounded-md border border-border px-3.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent",
              focusRing,
            )}
          >
            Download PDF
          </a>
        </div>
      </div>

      {/* Agency "From" block */}
      <section className="mt-6 rounded-lg border border-border bg-card p-5">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          From
        </p>
        <p className="mt-1 text-sm font-medium text-foreground">
          {agencyName}
        </p>
        <div className="mt-1 flex flex-wrap gap-x-4 text-sm text-muted-foreground">
          {agencyAbn && <span>ABN {agencyAbn}</span>}
          {agencyAddress && <span>{agencyAddress}</span>}
          {profile.phone && <span>{profile.phone}</span>}
          {profile.website && <span>{profile.website}</span>}
        </div>
      </section>

      {proposal.description && (
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {proposal.description}
        </p>
      )}

      {proposal.status === "changes_requested" && proposal.latestChangeRequest && (
        <section className="mt-8 rounded-lg border border-warning/30 bg-warning/10 p-5">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-sm font-semibold text-warning">
              Client requested changes
            </h2>
            <span className="text-xs text-muted-foreground">
              {dateTimeFmt.format(new Date(proposal.latestChangeRequest.created_at))}
            </span>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {proposal.latestChangeRequest.message}
          </p>
        </section>
      )}

      {/* Line items */}
      <div className="mt-10">
        <div className="grid grid-cols-[1fr_4rem_7rem_7rem_6rem] gap-3 border-b border-border pb-2">
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
              className="grid grid-cols-[1fr_4rem_7rem_7rem_6rem] gap-3 border-b border-border py-3"
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

      {/* Totals */}
      <div className="mt-6 flex flex-col items-end gap-2 text-sm">
        <div className="flex w-64 justify-between gap-8">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium text-foreground">
            {currencyFmt.format(subtotal)}
          </span>
        </div>
        <div className="flex w-64 justify-between gap-8">
          <span className="text-muted-foreground">GST (10%)</span>
          <span className="font-medium text-foreground">
            {currencyFmt.format(gst)}
          </span>
        </div>
        <div className="flex w-64 justify-between gap-8 border-t border-border pt-2">
          <span className="font-semibold text-foreground">Total</span>
          <span className="font-semibold text-foreground">
            {currencyFmt.format(total)}
          </span>
        </div>
        {depositPct > 0 && (
          <div className="flex w-64 justify-between gap-8 pt-1">
            <span className="text-muted-foreground">
              Deposit ({depositPct}%)
            </span>
            <span className="font-medium text-foreground">
              {currencyFmt.format(deposit)}
            </span>
          </div>
        )}
      </div>

      {/* Send / share-link section */}
      <div className="mt-10 border-t border-border pt-6">
        {proposal.status === "draft" ? (
          <div className="flex flex-wrap items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Ready to share with your client?
            </p>
            <SendProposalButton proposalId={params.id} />
          </div>
        ) : proposal.share_token ? (
          <div>
            <p className="mb-3 text-sm font-medium text-foreground">
              Client link
            </p>
            <ShareLinkDisplay proposal={{ share_token: proposal.share_token }} />
          </div>
        ) : null}
      </div>

      {/* Event log */}
      {proposal.events.length > 0 && (
        <div className="mt-10 border-t border-border pt-8">
          <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
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
        </div>
      )}

      <div className="mt-10 border-t border-border pt-8">
        <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Comments
        </h2>
        <ProposalComments
          comments={comments}
          canPost={proposal.status !== "draft"}
          disabledReason={
            proposal.status === "draft"
              ? "Comments open once you've sent this proposal to the client."
              : undefined
          }
          postAction={async (body) => {
            "use server";
            await postAgencyComment(params.id, body);
          }}
        />
      </div>

      <p className="mt-10 text-xs text-muted-foreground">
        Created {dateLongFmt.format(new Date(proposal.created_at))}
      </p>
    </div>
  );
}
