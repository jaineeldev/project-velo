import Link from "next/link";
import { FileText } from "lucide-react";
import { sql } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";
import { cn, focusRing } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { ProposalsList, type ProposalListRow } from "./proposals-list";

export default async function ProposalsPage() {
  const user = await getOrCreateUser();

  const proposals = (await sql`
    SELECT p.id, p.title, p.status, p.total_amount, p.created_at, c.name AS client_name
    FROM proposals p
    JOIN clients c ON c.id = p.client_id
    WHERE p.user_id = ${user.id}
    ORDER BY p.created_at DESC
  `) as ProposalListRow[];

  return (
    <div className="px-10 py-12">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Proposals
        </h1>
        <Link
          href="/dashboard/proposals/new"
          className={cn(
            "rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
            focusRing,
          )}
        >
          New proposal
        </Link>
      </header>

      {proposals.length === 0 ? (
        <Card className="mt-10 border-dashed shadow-none">
          <CardContent className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <FileText aria-hidden className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              No proposals yet. Create your first proposal to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ProposalsList proposals={proposals} />
      )}
    </div>
  );
}
