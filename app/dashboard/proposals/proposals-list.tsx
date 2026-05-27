"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { currencyFmt, dateShortFmt } from "@/lib/format";
import { cn, focusRing } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ListToolbar, NoMatches } from "@/components/list-toolbar";

export type ProposalListRow = {
  id: string;
  title: string;
  status: string;
  total_amount: string;
  created_at: string | Date;
  client_name: string;
};

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "changes_requested", label: "Changes requested" },
  { value: "approved", label: "Approved" },
] as const;

const SORT_OPTIONS = [
  { value: "recent", label: "Most recent" },
  { value: "oldest", label: "Oldest first" },
  { value: "value_desc", label: "Highest value" },
  { value: "value_asc", label: "Lowest value" },
] as const;

export function ProposalsList({ proposals }: { proposals: ProposalListRow[] }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [sort, setSort] = useState<string>("recent");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const matches = proposals.filter((p) => {
      if (status !== "all" && p.status !== status) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.client_name.toLowerCase().includes(q)
      );
    });

    matches.sort((a, b) => {
      switch (sort) {
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "value_desc":
          return Number(b.total_amount) - Number(a.total_amount);
        case "value_asc":
          return Number(a.total_amount) - Number(b.total_amount);
        case "recent":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
    return matches;
  }, [proposals, search, status, sort]);

  function clear() {
    setSearch("");
    setStatus("all");
  }

  return (
    <>
      <ListToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by title or client name"
        totalCount={proposals.length}
        filteredCount={filtered.length}
        selects={[
          {
            ariaLabel: "Filter by status",
            value: status,
            onValueChange: setStatus,
            options: STATUS_OPTIONS,
          },
          {
            ariaLabel: "Sort proposals",
            value: sort,
            onValueChange: setSort,
            options: SORT_OPTIONS,
          },
        ]}
      />

      {filtered.length === 0 ? (
        <NoMatches onClear={clear} />
      ) : (
        <Card className="mt-4 overflow-hidden">
          <ul className="divide-y divide-border">
            {filtered.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/dashboard/proposals/${p.id}`}
                  className={cn(
                    "flex items-center gap-4 px-5 py-4 transition-colors hover:bg-accent",
                    focusRing,
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {p.title}
                    </p>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">
                      {p.client_name}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-4">
                    <StatusBadge status={p.status} />
                    <p className="w-24 text-right text-sm font-medium text-foreground">
                      {currencyFmt.format(Number(p.total_amount))}
                    </p>
                    <p className="w-28 text-right text-xs text-muted-foreground">
                      {dateShortFmt.format(new Date(p.created_at))}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}
