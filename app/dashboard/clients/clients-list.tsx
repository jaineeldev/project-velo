"use client";

import { useMemo, useState } from "react";
import { StickyNote } from "lucide-react";
import { dateShortFmt, timeAgo } from "@/lib/format";
import { cn, focusRing } from "@/lib/utils";
import { CLIENT_INDUSTRIES } from "@/lib/validation";
import { ListToolbar, NoMatches } from "@/components/list-toolbar";
import { DeleteClientButton } from "./delete-client-button";
import { EditClientButton } from "./edit-client-button";
import type { ClientRow } from "@/lib/clients-data";

const INDUSTRY_OPTIONS = [
  { value: "all", label: "All industries" },
  ...CLIENT_INDUSTRIES.map((i) => ({ value: i, label: i })),
];

const SORT_OPTIONS = [
  { value: "name_asc", label: "Name A-Z" },
  { value: "name_desc", label: "Name Z-A" },
  { value: "recent", label: "Most recent" },
  { value: "oldest", label: "Oldest first" },
  { value: "contacted_recent", label: "Recently contacted" },
  { value: "contacted_stale", label: "Longest since contact" },
] as const;

export function ClientsList({ clients }: { clients: ClientRow[] }) {
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState<string>("all");
  const [sort, setSort] = useState<string>("name_asc");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const matches = clients.filter((c) => {
      if (industry !== "all" && c.industry !== industry) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        (c.email?.toLowerCase().includes(q) ?? false) ||
        (c.company_name?.toLowerCase().includes(q) ?? false) ||
        c.tags.some((t) => t.includes(q))
      );
    });

    matches.sort((a, b) => {
      switch (sort) {
        case "name_desc":
          return b.name.localeCompare(a.name);
        case "recent":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "contacted_recent": {
          // Never-contacted goes last so the operator sees "fresh" contacts first.
          const at = a.last_contacted_at ? new Date(a.last_contacted_at).getTime() : -Infinity;
          const bt = b.last_contacted_at ? new Date(b.last_contacted_at).getTime() : -Infinity;
          return bt - at;
        }
        case "contacted_stale": {
          // Inverse: never-contacted floats to the top as the most overdue.
          const at = a.last_contacted_at ? new Date(a.last_contacted_at).getTime() : -Infinity;
          const bt = b.last_contacted_at ? new Date(b.last_contacted_at).getTime() : -Infinity;
          return at - bt;
        }
        case "name_asc":
        default:
          return a.name.localeCompare(b.name);
      }
    });
    return matches;
  }, [clients, search, industry, sort]);

  function clear() {
    setSearch("");
    setIndustry("all");
  }

  return (
    <>
      <ListToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, email, company, or tag"
        totalCount={clients.length}
        filteredCount={filtered.length}
        selects={[
          {
            ariaLabel: "Filter by industry",
            value: industry,
            onValueChange: setIndustry,
            options: INDUSTRY_OPTIONS,
          },
          {
            ariaLabel: "Sort clients",
            value: sort,
            onValueChange: setSort,
            options: SORT_OPTIONS,
          },
        ]}
      />

      {filtered.length === 0 ? (
        <NoMatches onClear={clear} />
      ) : (
        <ul className="mt-4 divide-y divide-border border-t border-border">
          {filtered.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between py-4"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {c.name}
                  {c.company_name && (
                    <span className="ml-2 font-normal text-muted-foreground">
                      · {c.company_name}
                    </span>
                  )}
                </p>
                {c.tags.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {c.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  {c.email && <span>{c.email}</span>}
                  {c.phone && <span>{c.phone}</span>}
                  {c.industry && <span>{c.industry}</span>}
                  {c.website && (
                    <a
                      href={c.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "rounded underline-offset-2 hover:text-foreground hover:underline",
                        focusRing,
                      )}
                    >
                      {c.website.replace(/^https?:\/\//, "")}
                    </a>
                  )}
                  {c.notes && (
                    <span
                      className="inline-flex items-center gap-1 text-xs"
                      title={c.notes}
                    >
                      <StickyNote aria-hidden className="h-3 w-3" />
                      Notes
                    </span>
                  )}
                </div>
              </div>
              <div className="ml-4 flex shrink-0 items-center gap-3">
                <div className="text-right text-sm text-muted-foreground">
                  <p>Added {dateShortFmt.format(new Date(c.created_at))}</p>
                  <p
                    className={cn(
                      "text-xs",
                      c.last_contacted_at ? "text-muted-foreground/80" : "text-muted-foreground/60",
                    )}
                  >
                    {c.last_contacted_at
                      ? `Contacted ${timeAgo(c.last_contacted_at)}`
                      : "Never contacted"}
                  </p>
                </div>
                <EditClientButton client={c} />
                <DeleteClientButton clientId={c.id} clientName={c.name} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
