import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { sql } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";
import { getProposal } from "../../actions";
import { ProposalForm } from "../../new/proposal-form";

type ClientOption = { id: string; name: string };

export default async function EditProposalPage({
  params,
}: {
  params: { id: string };
}) {
  const proposal = await getProposal(params.id);
  if (!proposal) notFound();

  // Non-draft proposals cannot be edited — send the user back to the detail page.
  if (proposal.status !== "draft") {
    redirect(`/dashboard/proposals/${params.id}`);
  }

  const user = await getOrCreateUser();
  const clients = (await sql`
    SELECT id, name FROM clients WHERE user_id = ${user.id} ORDER BY name ASC
  `) as ClientOption[];

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
          })),
        }}
      />
    </div>
  );
}
