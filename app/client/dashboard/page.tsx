import Link from "next/link";
import { Wallet } from "lucide-react";
import { sql } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";
import { currencyFmt, dateShortFmt, formatStatus } from "@/lib/format";
import { cn, focusRing } from "@/lib/utils";
import {
  AllWorkSection,
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
//                       below; no extra DB hit. Stays unfiltered so the
//                       client never accidentally hides something urgent.
//   "All work"        — every non-draft proposal and every project,
//                       regardless of status. Filterable via a toolbar.
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
  ])) as [
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

  const needsAttention = allWork.filter((item) =>
    item.kind === "proposal"
      ? item.row.status === "sent" ||
        item.row.status === "changes_requested"
      : item.row.has_unpaid_invoice,
  );

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
        <div className="mt-12 space-y-16">
          {needsAttention.length > 0 && (
            <NeedsAttentionSection items={needsAttention} />
          )}
          <AllWorkSection items={allWork} />
        </div>
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

function PaymentPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
      <Wallet aria-hidden className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

// Static (no toolbar) section above the filterable list. Keeping this one
// unfiltered avoids accidentally hiding something the client actually
// needs to act on.
function NeedsAttentionSection({ items }: { items: DashboardItem[] }) {
  return (
    <section>
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Needs attention
      </h2>
      <ul className="overflow-hidden rounded-lg border border-border bg-card">
        {items.map((item) => (
          <li
            key={`${item.kind}-${item.row.id}`}
            className="border-b border-border last:border-0"
          >
            <NeedsAttentionCard item={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function NeedsAttentionCard({ item }: { item: DashboardItem }) {
  const cardClass = cn(
    "block px-7 py-6 transition-colors hover:bg-accent",
    focusRing,
  );

  if (item.kind === "proposal") {
    const p = item.row;
    return (
      <Link href={`/share/proposal/${p.share_token}`} className={cardClass}>
        <CardHeader
          kindLabel="Proposal"
          title={p.title}
          agencyName={p.agency_name}
          status={p.status}
        />
        <div className="mt-4 flex items-end justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            {p.sent_at
              ? `Sent ${dateShortFmt.format(new Date(p.sent_at))}`
              : ""}
          </p>
          <div className="text-right">
            <p className="text-sm font-medium tabular-nums text-foreground">
              {currencyFmt.format(Number(p.total_amount))}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Total incl. GST
            </p>
          </div>
        </div>
      </Link>
    );
  }

  const pr = item.row;
  const total = pr.milestone_count;
  const done = pr.milestones_completed;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <Link href={`/share/project/${pr.share_token}`} className={cardClass}>
      <CardHeader
        kindLabel="Project"
        title={pr.title}
        agencyName={pr.agency_name}
        status={pr.status}
      />
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {done}/{total} milestones
          </span>
          <span className="tabular-nums">{pct}%</span>
        </div>
        <div
          className="mt-2 h-1 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${pct}% complete`}
        >
          <div
            className="h-full bg-primary transition-[width]"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      {pr.has_unpaid_invoice && (
        <div className="mt-3">
          <PaymentPill label="Payment outstanding" />
        </div>
      )}
    </Link>
  );
}

function CardHeader({
  kindLabel,
  title,
  agencyName,
  status,
}: {
  kindLabel: string;
  title: string;
  agencyName: string | null;
  status: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{title}</p>
        <p className="mt-1 truncate text-xs text-muted-foreground">
          {kindLabel} · {agencyName ?? "Agency"}
        </p>
      </div>
      <StatusBadge status={status} />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "approved" ||
    status === "completed" ||
    status === "delivered"
      ? "border-primary/30 bg-primary/10 text-primary"
      : status === "changes_requested"
        ? "border-border bg-muted text-foreground"
        : "border-border bg-muted text-muted-foreground";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        tone,
      )}
    >
      {formatStatus(status)}
    </span>
  );
}
