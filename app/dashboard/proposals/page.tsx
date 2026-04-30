import Link from "next/link";
import { sql } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";

type ProposalRow = {
  id: string;
  title: string;
  status: string;
  total_amount: string;
  created_at: string | Date;
  client_name: string;
};

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const statusStyles: Record<string, string> = {
  draft:
    "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
  sent: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  pending:
    "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  accepted:
    "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400",
  declined: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
};

export default async function ProposalsPage() {
  const user = await getOrCreateUser();

  const proposals = (await sql`
    SELECT p.id, p.title, p.status, p.total_amount, p.created_at, c.name AS client_name
    FROM proposals p
    JOIN clients c ON c.id = p.client_id
    WHERE p.user_id = ${user.id}
    ORDER BY p.created_at DESC
  `) as ProposalRow[];

  return (
    <div className="px-10 py-12">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Proposals
        </h1>
        <Link
          href="/dashboard/proposals/new"
          className="rounded-md bg-neutral-900 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          New proposal
        </Link>
      </header>

      {proposals.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed border-neutral-200 px-6 py-16 text-center dark:border-neutral-800">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No proposals yet. Create your first proposal to get started.
          </p>
        </div>
      ) : (
        <ul className="mt-10 divide-y divide-neutral-200 border-t border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
          {proposals.map((p) => (
            <li key={p.id}>
              <Link
                href={`/dashboard/proposals/${p.id}`}
                className="flex items-center justify-between py-4 transition-colors hover:text-neutral-700 dark:hover:text-neutral-300"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {p.title}
                  </p>
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    {p.client_name}
                  </p>
                </div>
                <div className="ml-4 flex shrink-0 items-center gap-4">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusStyles[p.status] ?? statusStyles.draft}`}
                  >
                    {p.status}
                  </span>
                  <p className="w-24 text-right text-sm text-neutral-500 dark:text-neutral-400">
                    ${Number(p.total_amount).toFixed(2)}
                  </p>
                  <p className="w-28 text-right text-sm text-neutral-500 dark:text-neutral-400">
                    {dateFmt.format(new Date(p.created_at))}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
