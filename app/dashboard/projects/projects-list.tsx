"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { dateShortFmt } from "@/lib/format";
import { cn, focusRing } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ListToolbar, NoMatches } from "@/components/list-toolbar";
import type { ProjectListItem } from "./actions";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "delivered", label: "Delivered" },
] as const;

const SORT_OPTIONS = [
  { value: "recent", label: "Most recent" },
  { value: "oldest", label: "Oldest first" },
] as const;

export function ProjectsList({ projects }: { projects: ProjectListItem[] }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [sort, setSort] = useState<string>("recent");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const matches = projects.filter((p) => {
      if (status !== "all" && p.status !== status) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.client_name.toLowerCase().includes(q)
      );
    });

    matches.sort((a, b) => {
      const ta = new Date(a.created_at).getTime();
      const tb = new Date(b.created_at).getTime();
      return sort === "oldest" ? ta - tb : tb - ta;
    });
    return matches;
  }, [projects, search, status, sort]);

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
        totalCount={projects.length}
        filteredCount={filtered.length}
        selects={[
          {
            ariaLabel: "Filter by status",
            value: status,
            onValueChange: setStatus,
            options: STATUS_OPTIONS,
          },
          {
            ariaLabel: "Sort projects",
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
                  href={`/dashboard/projects/${p.id}`}
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
