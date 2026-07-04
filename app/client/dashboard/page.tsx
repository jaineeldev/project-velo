import { Wallet } from "lucide-react";
import { sql } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";
import { currencyFmt } from "@/lib/format";
import {
  DashboardSections,
  type DashboardItem,
  type ProjectRow,
  type ProposalRow,
} from "./all-work-section";

// Client-only landing surface. Lists every proposal and project an
// agency has shared with this account's email. Match is on email rather
// than a join table because clients live inside each agency's `clients`
// table (the agency-owned contact record) and the same email can be a
// client of multiple agencies. LOWER(...) on both sides defends against
// case differences between the address Clerk stored at sign-up and the
// one an operator typed when creating the client record.
//
// The page splits the same data into two views:
//   "Needs attention" — proposals awaiting the client's decision
//                       (sent / changes_requested) and projects with any
//                       unpaid invoice. Derived in JS from the queries
//                       below; no extra DB hit. Hidden entirely when the
//                       toolbar filter excludes every urgent item.
//   "All work"        — every non-draft proposal and every project,
//                       regardless of status. Falls back to a no-matches
//                       state when the toolbar filter excludes everything.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ClientDashboardPage() {
  const user = await getOrCreateUser();

  const [proposals, projects, balanceRow] = (await Promise.all([
    sql`
      SELECT
        p.id, p.title, p.status, p.total_amount, p.share_token,
        p.created_at,
        u.name AS agency_name,
        (
          SELECT MAX(pe.created_at)
          FROM proposal_events pe
          WHERE pe.proposal_id = p.id AND pe.event_type = 'sent'
        ) AS sent_at
      FROM proposals p
      JOIN clients c ON c.id = p.client_id
      JOIN users u ON u.id = p.user_id
      WHERE LOWER(c.email) = LOWER(${user.email})
        AND p.status <> 'draft'
      ORDER BY p.created_at DESC
    `,
    sql`
      SELECT
        pr.id, pr.title, pr.status, pr.share_token, pr.created_at,
        u.name AS agency_name,
        COUNT(m.id)::int AS milestone_count,
        COUNT(m.id) FILTER (WHERE m.status = 'completed')::int
          AS milestones_completed,
        EXISTS (
          SELECT 1 FROM invoices i
          WHERE i.project_id = pr.id
            AND i.status = 'unpaid'
            AND i.total_amount > 0
        ) AS has_unpaid_invoice
      FROM projects pr
      JOIN proposals p ON p.id = pr.proposal_id
      JOIN clients c ON c.id = p.client_id
      JOIN users u ON u.id = pr.user_id
      LEFT JOIN milestones m ON m.proposal_id = pr.proposal_id
      WHERE LOWER(c.email) = LOWER(${user.email})
      GROUP BY pr.id, pr.title, pr.status, pr.share_token, u.name, pr.created_at
      ORDER BY pr.created_at DESC
    `,
    sql`
      SELECT
        COALESCE(SUM(i.total_amount), 0)::numeric AS owed,
        COUNT(*)::int AS count
      FROM invoices i
      JOIN clients c ON c.id = i.client_id
      WHERE LOWER(c.email) = LOWER(${user.email})
        AND i.status = 'unpaid'
        AND i.total_amount > 0
    `,
  ])) as unknown as [
    ProposalRow[],
    ProjectRow[],
    { owed: string; count: number }[],
  ];

  const balance = balanceRow[0];
  const owed = Number(balance?.owed ?? 0);
  const owedCount = balance?.count ?? 0;

  const allWork: DashboardItem[] = [
    ...proposals.map<DashboardItem>((row) => ({
      kind: "proposal",
      row,
      createdAt: new Date(row.created_at).getTime(),
    })),
    ...projects.map<DashboardItem>((row) => ({
      kind: "project",
      row,
      createdAt: new Date(row.created_at).getTime(),
    })),
  ].sort((a, b) => b.createdAt - a.createdAt);

  const isEmpty = allWork.length === 0;
  const firstName = user.name?.split(" ")[0] ?? null;

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Welcome back{firstName ? `, ${firstName}` : ""}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Here&apos;s everything shared with you.
      </p>

      {owedCount > 0 && (
        <div className="mt-8 flex items-center justify-between gap-4 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 dark:border-amber-900/60 dark:bg-amber-950/30">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
              <Wallet aria-hidden className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                {currencyFmt.format(owed)} outstanding
              </p>
              <p className="text-xs text-amber-800/80 dark:text-amber-200/80">
                Across {owedCount} unpaid{" "}
                {owedCount === 1 ? "invoice" : "invoices"}.
              </p>
            </div>
          </div>
        </div>
      )}

      {isEmpty ? (
        <CombinedEmptyState />
      ) : (
        <DashboardSections items={allWork} />
      )}
    </div>
  );
}

function CombinedEmptyState() {
  return (
    <div className="mt-12 rounded-lg border border-dashed border-border bg-card p-12 text-center">
      <p className="text-sm font-medium text-foreground">Nothing here yet.</p>
      <p className="mt-1.5 text-sm text-muted-foreground">
        You&apos;ll see proposals and projects here once an agency shares them
        with you.
      </p>
    </div>
  );
}
