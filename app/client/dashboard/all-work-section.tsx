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
  { value: "all", label: "Proposals + projects" },
  { value: "proposal", label: "Proposals only" },
  { value: "project", label: "Projects only" },
] as const;

// Status values mix proposal + project lifecycle states. The select shows
// every option a client might encounter; whichever doesn't apply for a
// given kind simply filters nothing out.
const STATUS_OPTIONS = [
  { value: "all", label: "Any status" },
  { value: "sent", label: "Awaiting your decision" },
  { value: "changes_requested", label: "Changes requested" },
  { value: "approved", label: "Approved" },
  { value: "active", label: "Active project" },
  { value: "completed", label: "Completed" },
  { value: "delivered", label: "Delivered" },
] as const;

const SORT_OPTIONS = [
  { value: "recent", label: "Most recent" },
  { value: "oldest", label: "Oldest first" },
] as const;

export function AllWorkSection({ items }: { items: DashboardItem[] }) {
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [sort, setSort] = useState<string>("recent");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const matches = items.filter((item) => {
      if (kind !== "all" && item.kind !== kind) return false;
      if (status !== "all" && item.row.status !== status) return false;
      if (!q) return true;
      return item.row.title.toLowerCase().includes(q);
    });
    matches.sort((a, b) => (sort === "oldest" ? a.createdAt - b.createdAt : b.createdAt - a.createdAt));
    return matches;
  }, [items, search, kind, status, sort]);

  function clear() {
    setSearch("");
    setKind("all");
    setStatus("all");
  }

  return (
    <section>
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        All work
      </h2>

      <ListToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by project name"
        totalCount={items.length}
        filteredCount={filtered.length}
        className="mt-0"
        selects={[
          {
            ariaLabel: "Filter by kind",
            value: kind,
            onValueChange: setKind,
            options: KIND_OPTIONS,
          },
          {
            ariaLabel: "Filter by status",
            value: status,
            onValueChange: setStatus,
            options: STATUS_OPTIONS,
          },
          {
            ariaLabel: "Sort",
            value: sort,
            onValueChange: setSort,
            options: SORT_OPTIONS,
          },
        ]}
      />

      {filtered.length === 0 ? (
        <NoMatches onClear={clear} />
      ) : (
        <ul className="mt-4 overflow-hidden rounded-lg border border-border bg-card">
          {filtered.map((item) => (
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
