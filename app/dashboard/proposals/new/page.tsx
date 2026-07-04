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
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Proposals
      </Link>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
        New proposal
      </h1>

      {clients.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed border-border px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            You need a client before you can create a proposal.
          </p>
          <Link
            href="/dashboard/clients"
            className="mt-4 inline-block text-sm font-medium text-foreground underline underline-offset-2"
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
