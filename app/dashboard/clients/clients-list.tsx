"use client";

import { useMemo, useState } from "react";
import { dateShortFmt } from "@/lib/format";
import { cn, focusRing } from "@/lib/utils";
import { CLIENT_INDUSTRIES } from "@/lib/validation";
import { ListToolbar, NoMatches } from "@/components/list-toolbar";
import { DeleteClientButton } from "./delete-client-button";
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
        (c.company_name?.toLowerCase().includes(q) ?? false)
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
        searchPlaceholder="Search by name, email or company"
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
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {c.name}
                  {c.company_name && (
                    <span className="ml-2 font-normal text-muted-foreground">
                      · {c.company_name}
                    </span>
                  )}
                </p>
                <div className="mt-1 flex flex-wrap gap-x-4 text-sm text-muted-foreground">
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
                </div>
              </div>
              <div className="ml-4 flex shrink-0 items-center gap-4">
                <p className="text-sm text-muted-foreground">
                  Added {dateShortFmt.format(new Date(c.created_at))}
                </p>
                <DeleteClientButton clientId={c.id} clientName={c.name} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
