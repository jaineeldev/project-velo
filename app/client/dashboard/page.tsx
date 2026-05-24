import { redirect } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";
import { Wallet } from "lucide-react";
import { sql } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";
import { currencyFmt, dateShortFmt, formatStatus } from "@/lib/format";
import { cn, focusRing } from "@/lib/utils";

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
//                       below; no extra DB hit.
//   "All work"        — every non-draft proposal and every project,
//                       regardless of status. Items appear here even if
//                       they're already in Needs attention.
export const dynamic = "force-dynamic";
export const revalidate = 0;

type ProposalRow = {
  id: string;
  title: string;
  status: string;
  total_amount: string;
  share_token: string;
  agency_name: string | null;
  sent_at: string | null;
  created_at: string;
};

type ProjectRow = {
  id: string;
  title: string;
  status: string;
  share_token: string;
  agency_name: string | null;
  milestone_count: number;
  milestones_completed: number;
  has_unpaid_invoice: boolean;
  created_at: string;
};

type DashboardItem =
  | { kind: "proposal"; row: ProposalRow; createdAt: number }
  | { kind: "project"; row: ProjectRow; createdAt: number };

export default async function ClientDashboardPage() {
  const user = await getOrCreateUser();

  // Defence-in-depth: the middleware should have already bounced agency
  // users on the way in, but the middleware redirect depends on Clerk's
  // session-token customization being wired up. This check reads the DB
  // directly and is correct regardless of JWT claim state.
  const roleRows = await sql`
    SELECT role FROM user_profiles WHERE user_id = ${user.id}
  `;
  if (roleRows[0]?.role !== "client") redirect("/dashboard");

  const [proposals, projects] = (await Promise.all([
    // sent_at comes from proposal_events rather than a column on
    // proposals — there's no sent_at column on proposals; the row's
    // sent timestamp is recorded as an event_type='sent' row in the
    // audit trail. MAX(created_at) handles the legitimate case where a
    // proposal was reset to draft and re-sent (we want the most recent
    // send time, not the first).
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
    // Client linkage is resolved via proposals → clients rather than
    // projects.client_id directly. Functionally equivalent today because
    // approval copies the proposal's client_id onto the project, but
    // routing through the proposal makes the proposal the single source
    // of truth for "which client is this for" and matches how the
    // Proposals query above resolves the same relationship.
    //
    // No status filter — "All work" is meant to be the complete view, so
    // active / completed / delivered (and any future status) all surface.
    sql`
      SELECT
        pr.id, pr.title, pr.status, pr.share_token, pr.created_at,
        u.name AS agency_name,
        COUNT(m.id)::int AS milestone_count,
        COUNT(m.id) FILTER (WHERE m.status = 'completed')::int
          AS milestones_completed,
        EXISTS (
          SELECT 1 FROM invoices i
          WHERE i.project_id = pr.id AND i.status = 'unpaid'
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
  ])) as [ProposalRow[], ProjectRow[]];

  // Merge into one timeline and split into the two views in JS. The
  // queries already return non-overlapping sets (a row is either a
  // proposal or a project), so no de-dup is needed.
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
    <main className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link
            href="/client/dashboard"
            aria-label="Velo — go to dashboard"
            className={cn(
              "flex items-center gap-2.5 rounded",
              focusRing,
            )}
          >
            <span
              aria-hidden
              className="h-2 w-2 rounded-full bg-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.18)]"
            />
            <span className="text-sm font-semibold tracking-tight text-foreground">
              Velo
            </span>
          </Link>
          <SignOutButton>
            <button
              type="button"
              className={cn(
                "rounded text-xs text-muted-foreground hover:text-foreground",
                focusRing,
              )}
            >
              Sign out
            </button>
          </SignOutButton>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-10 sm:py-16">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Welcome back{firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Here&apos;s everything shared with you.
        </p>

        {isEmpty ? (
          <CombinedEmptyState />
        ) : (
          <div className="mt-12 space-y-16">
            {needsAttention.length > 0 && (
              <Section title="Needs attention" items={needsAttention} />
            )}
            <Section title="All work" items={allWork} />
          </div>
        )}
      </div>
    </main>
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

// Amber "this is on you" indicator. The colour values are explicit
// Tailwind hex aliases — we don't have a semantic 'warning' token in
// the design system, and the rest of the app uses neutral + primary
// only. If a token gets added later, swap these classes for it.
function PaymentPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
      <Wallet aria-hidden className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

function Section({
  title,
  items,
}: {
  title: string;
  items: DashboardItem[];
}) {
  return (
    <section>
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </h2>
      <ul className="overflow-hidden rounded-lg border border-border bg-card">
        {items.map((item) => (
          <li
            key={`${item.kind}-${item.row.id}`}
            className="border-b border-border last:border-0"
          >
            <DashboardCard item={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function DashboardCard({ item }: { item: DashboardItem }) {
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
  // "Done"-ish states (approved / completed / delivered) get the primary
  // tone. Everything else — including any future status — falls through
  // to a neutral pill so this page never crashes on unfamiliar data.
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
