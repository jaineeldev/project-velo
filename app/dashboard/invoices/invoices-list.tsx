"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { currencyFmt, dateShortFmt } from "@/lib/format";
import { cn, focusRing } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ListToolbar, NoMatches } from "@/components/list-toolbar";
import type { InvoiceListItem } from "./actions";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "unpaid", label: "Unpaid" },
  { value: "paid", label: "Paid" },
] as const;

const TYPE_OPTIONS = [
  { value: "all", label: "All types" },
  { value: "deposit", label: "Deposit" },
  { value: "final", label: "Final" },
] as const;

const SORT_OPTIONS = [
  { value: "recent", label: "Most recent" },
  { value: "oldest", label: "Oldest first" },
  { value: "amount_desc", label: "Highest amount" },
  { value: "amount_asc", label: "Lowest amount" },
] as const;

export function InvoicesList({ invoices }: { invoices: InvoiceListItem[] }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [type, setType] = useState<string>("all");
  const [sort, setSort] = useState<string>("recent");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const matches = invoices.filter((i) => {
      if (status !== "all" && i.status !== status) return false;
      if (type !== "all" && i.type !== type) return false;
      if (!q) return true;
      return (
        i.project_title.toLowerCase().includes(q) ||
        i.client_name.toLowerCase().includes(q)
      );
    });

    matches.sort((a, b) => {
      switch (sort) {
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "amount_desc":
          return Number(b.total_amount) - Number(a.total_amount);
        case "amount_asc":
          return Number(a.total_amount) - Number(b.total_amount);
        case "recent":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
    return matches;
  }, [invoices, search, status, type, sort]);

  function clear() {
    setSearch("");
    setStatus("all");
    setType("all");
  }

  return (
    <>
      <ListToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by project or client name"
        totalCount={invoices.length}
        filteredCount={filtered.length}
        selects={[
          {
            ariaLabel: "Filter by status",
            value: status,
            onValueChange: setStatus,
            options: STATUS_OPTIONS,
          },
          {
            ariaLabel: "Filter by type",
            value: type,
            onValueChange: setType,
            options: TYPE_OPTIONS,
          },
          {
            ariaLabel: "Sort invoices",
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
            {filtered.map((i) => (
              <li key={i.id}>
                <Link
                  href={`/dashboard/invoices/${i.id}`}
                  className={cn(
                    "flex items-center gap-4 px-5 py-4 transition-colors hover:bg-accent",
                    focusRing,
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {i.project_title}
                    </p>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">
                      {i.client_name}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-4">
                    <StatusBadge status={i.type} />
                    <StatusBadge status={i.status} />
                    <p className="w-24 text-right text-sm font-medium text-foreground">
                      {currencyFmt.format(Number(i.total_amount))}
                    </p>
                    <p className="w-28 text-right text-xs text-muted-foreground">
                      {dateShortFmt.format(new Date(i.created_at))}
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
