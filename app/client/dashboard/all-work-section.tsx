"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Wallet } from "lucide-react";
import { currencyFmt, dateShortFmt, formatStatus } from "@/lib/format";
import { cn, focusRing } from "@/lib/utils";
import { ListToolbar, NoMatches } from "@/components/list-toolbar";

export type ProposalRow = {
  id: string;
  title: string;
  status: string;
  total_amount: string;
  share_token: string;
  agency_name: string | null;
  sent_at: string | null;
  created_at: string;
};

export type ProjectRow = {
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

export type DashboardItem =
  | { kind: "proposal"; row: ProposalRow; createdAt: number }
  | { kind: "project"; row: ProjectRow; createdAt: number };

const KIND_OPTIONS = [
  { value: "all", label: "All" },
  { value: "proposal", label: "Proposals only" },
  { value: "project", label: "Projects only" },
] as const;

// Payment status is a project concept (proposals have no invoice yet). When
// either 'outstanding' or 'paid' is selected, proposals fall away because the
// question doesn't apply to them. 'all' is the only setting that keeps
// proposals in the list.
const PAYMENT_OPTIONS = [
  { value: "all", label: "All payments" },
  { value: "outstanding", label: "Payment outstanding" },
  { value: "paid", label: "Paid" },
] as const;

const SORT_OPTIONS = [
  { value: "recent", label: "Most recent" },
  { value: "oldest", label: "Oldest first" },
] as const;

type NeedsAttentionPredicate = (item: DashboardItem) => boolean;

const needsAttentionPredicate: NeedsAttentionPredicate = (item) =>
  item.kind === "proposal"
    ? item.row.status === "sent" ||
      item.row.status === "changes_requested"
    : item.row.has_unpaid_invoice;

// Top-level client wrapper for the two filterable sections. Owns the toolbar
// state so search/filter/sort apply across both lists in lockstep. The
// 'Needs attention' section is hidden when its filtered slice is empty so
// the client never sees a header with no rows; 'All work' falls back to the
// shared NoMatches state instead.
export function DashboardSections({ items }: { items: DashboardItem[] }) {
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState<string>("all");
  const [payment, setPayment] = useState<string>("all");
  const [sort, setSort] = useState<string>("recent");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const matches = items.filter((item) => {
      if (kind !== "all" && item.kind !== kind) return false;
      if (payment !== "all") {
        if (item.kind !== "project") return false;
        const outstanding = item.row.has_unpaid_invoice;
        if (payment === "outstanding" && !outstanding) return false;
        if (payment === "paid" && outstanding) return false;
      }
      if (!q) return true;
      return item.row.title.toLowerCase().includes(q);
    });
    matches.sort((a, b) =>
      sort === "oldest" ? a.createdAt - b.createdAt : b.createdAt - a.createdAt,
    );
    return matches;
  }, [items, search, kind, payment, sort]);

  const needsAttention = useMemo(
    () => filtered.filter(needsAttentionPredicate),
    [filtered],
  );

  function clear() {
    setSearch("");
    setKind("all");
    setPayment("all");
  }

  return (
    <div className="mt-10 space-y-10">
      <ListToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by project or proposal title"
        totalCount={items.length}
        filteredCount={filtered.length}
        className="mt-0"
        selects={[
          {
            ariaLabel: "Filter by item type",
            value: kind,
            onValueChange: setKind,
            options: KIND_OPTIONS,
          },
          {
            ariaLabel: "Filter by payment status",
            value: payment,
            onValueChange: setPayment,
            options: PAYMENT_OPTIONS,
          },
          {
            ariaLabel: "Sort",
            value: sort,
            onValueChange: setSort,
            options: SORT_OPTIONS,
          },
        ]}
      />

      {needsAttention.length > 0 && (
        <NeedsAttentionSection items={needsAttention} />
      )}

      <AllWorkSection items={filtered} onClear={clear} />
    </div>
  );
}

function NeedsAttentionSection({ items }: { items: DashboardItem[] }) {
  return (
    <section>
      <h2 className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        Needs attention
      </h2>
      <ul className="overflow-hidden rounded-xl border border-border bg-card">
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

function AllWorkSection({
  items,
  onClear,
}: {
  items: DashboardItem[];
  onClear: () => void;
}) {
  return (
    <section>
      <h2 className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        All work
      </h2>
      {items.length === 0 ? (
        <NoMatches onClear={onClear} />
      ) : (
        <ul className="overflow-hidden rounded-xl border border-border bg-card">
          {items.map((item) => (
            <li
              key={`${item.kind}-${item.row.id}`}
              className="border-b border-border last:border-0"
            >
              <DashboardCard item={item} />
            </li>
          ))}
        </ul>
      )}
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

function PaymentPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
      <Wallet aria-hidden className="h-3.5 w-3.5" />
      {label}
    </span>
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
