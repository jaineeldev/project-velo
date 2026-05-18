import Link from "next/link";
import { getOrCreateUser } from "@/lib/auth";
import { getClientOptions } from "@/lib/clients-data";
import { ProposalForm } from "./proposal-form";

export default async function NewProposalPage() {
  const user = await getOrCreateUser();
  const clients = await getClientOptions(user.id);

  return (
    <div className="px-10 py-12">
      <Link
        href="/dashboard/proposals"
        className="inline-flex items-center gap-1 text-sm text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
      >
        ← Proposals
      </Link>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
        New proposal
      </h1>

      {clients.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed border-neutral-200 px-6 py-16 text-center dark:border-neutral-800">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            You need a client before you can create a proposal.
          </p>
          <Link
            href="/dashboard/clients"
            className="mt-4 inline-block text-sm font-medium text-neutral-900 underline underline-offset-2 dark:text-neutral-100"
          >
            Go to Clients →
          </Link>
        </div>
      ) : (
        <ProposalForm clients={clients} />
      )}
    </div>
  );
}
