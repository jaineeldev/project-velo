"use client";

import { Search, X } from "lucide-react";
import { cn, focusRing } from "@/lib/utils";

export type ListToolbarSelect = {
  ariaLabel: string;
  value: string;
  onValueChange: (next: string) => void;
  options: ReadonlyArray<{ value: string; label: string }>;
};

export type ListToolbarProps = {
  searchValue: string;
  onSearchChange: (next: string) => void;
  searchPlaceholder: string;
  selects?: ReadonlyArray<ListToolbarSelect>;
  totalCount: number;
  filteredCount: number;
  className?: string;
};

const inputCls =
  "h-9 w-full rounded-md border border-border bg-card pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring";

const selectCls =
  "h-9 rounded-md border border-border bg-card px-3 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring";

// Inline strip toolbar: search on the left, filter / sort dropdowns on the
// right, count below. Stays compact on desktop, wraps cleanly on mobile.
export function ListToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  selects = [],
  totalCount,
  filteredCount,
  className,
}: ListToolbarProps) {
  const isFiltered = filteredCount !== totalCount;

  return (
    <div className={cn("mt-8 space-y-2", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[14rem] flex-1">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className={inputCls}
          />
          {searchValue !== "" && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
              className={cn(
                "absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                focusRing,
              )}
            >
              <X aria-hidden className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {selects.map((s, i) => (
          <select
            key={i}
            aria-label={s.ariaLabel}
            value={s.value}
            onChange={(e) => s.onValueChange(e.target.value)}
            className={selectCls}
          >
            {s.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ))}
      </div>

      <p className="text-xs text-muted-foreground" role="status" aria-live="polite">
        {isFiltered
          ? `Showing ${filteredCount} of ${totalCount}`
          : `${totalCount} ${totalCount === 1 ? "result" : "results"}`}
      </p>
    </div>
  );
}

// Convenience: a "no matches" empty state for use under the toolbar when the
// underlying list isn't empty but the current filter excludes everything.
export function NoMatches({ onClear }: { onClear: () => void }) {
  return (
    <div className="mt-6 rounded-lg border border-dashed border-border bg-card px-6 py-12 text-center">
      <p className="text-sm font-medium text-foreground">No matches</p>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Nothing matches the current search or filters.
      </p>
      <button
        type="button"
        onClick={onClear}
        className={cn(
          "mt-4 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent",
          focusRing,
        )}
      >
        Clear filters
      </button>
    </div>
  );
}
