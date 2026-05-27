import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getOrCreateUser } from "@/lib/auth";
import { getClientOptions } from "@/lib/clients-data";
import { getProposal } from "../../actions";
import { ProposalForm } from "../../new/proposal-form";

export default async function EditProposalPage({
  params,
}: {
  params: { id: string };
}) {
  // Proposal + client list are independent — fetch in parallel after the
  // cached user lookup. Client list is also unstable_cache'd so this is
  // typically a single proposal round-trip in steady state.
  const user = await getOrCreateUser();
  const [proposal, clients] = await Promise.all([
    getProposal(params.id),
    getClientOptions(user.id),
  ]);
  if (!proposal) notFound();

  // Only draft and changes_requested proposals can be edited — anything else
  // bounces back to the detail page.
  if (proposal.status !== "draft" && proposal.status !== "changes_requested") {
    redirect(`/dashboard/proposals/${params.id}`);
  }

  return (
    <div className="px-10 py-12">
      <Link
        href={`/dashboard/proposals/${params.id}`}
        className="inline-flex items-center gap-1 text-sm text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
      >
        ← Back to proposal
      </Link>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
        Edit proposal
      </h1>

      <ProposalForm
        clients={clients}
        proposalId={params.id}
        initialValues={{
          clientId: proposal.client_id,
          title: proposal.title,
          description: proposal.description,
          depositPercentage: proposal.deposit_percentage,
          lineItems: proposal.lineItems.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unit_price,
            estimatedDuration: item.estimated_duration,
          })),
        }}
      />
    </div>
  );
}
