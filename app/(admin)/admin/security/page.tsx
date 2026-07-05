import Link from "next/link";
import { Shield } from "lucide-react";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { cn, focusRing } from "@/lib/utils";

export const dynamic = "force-dynamic";

const RANGES = {
  "24h": "24 hours",
  "7d": "7 days",
  "30d": "30 days",
  all: null,
} as const;

type RangeKey = keyof typeof RANGES;

const OUTCOMES = ["any", "success", "failure", "denied"] as const;
type Outcome = (typeof OUTCOMES)[number];

type EventRow = {
  id: string;
  created_at: string;
  event_type: string;
  route: string;
  ip: string | null;
  outcome: "success" | "failure" | "denied";
  reason: string | null;
  metadata: Record<string, unknown>;
};

function parseRange(raw: string | undefined): RangeKey {
  if (raw === "24h" || raw === "7d" || raw === "30d" || raw === "all") {
    return raw;
  }
  return "7d";
}

function parseOutcome(raw: string | undefined): Outcome {
  return OUTCOMES.includes(raw as Outcome) ? (raw as Outcome) : "any";
}

function shortDateTime(value: string): string {
  return new Date(value).toISOString().replace("T", " ").slice(0, 19);
}

function outcomeStyle(outcome: EventRow["outcome"]): string {
  switch (outcome) {
    case "success":
      return "border-success/30 bg-success/10 text-foreground";
    case "denied":
      return "border-warning/40 bg-warning/10 text-foreground";
    case "failure":
      return "border-destructive/40 bg-destructive/15 text-foreground";
  }
}

// Outcome dot colour. Spec maps allowed=green, denied=red, warning=yellow.
// In our schema "denied" is the access-denied case (warning-amber) and
// "failure" is the harder fault case (destructive-red), so the dot picks
// the colour that matches the user's mental model.
function outcomeDot(outcome: EventRow["outcome"]): string {
  switch (outcome) {
    case "success":
      return "bg-success";
    case "denied":
      return "bg-warning";
    case "failure":
      return "bg-destructive";
  }
}

export default async function AdminSecurityPage({
  searchParams,
}: {
  searchParams: { range?: string; type?: string; outcome?: string };
}) {
  await requireAdmin("/admin/security");

  const range = parseRange(searchParams.range);
  const outcome = parseOutcome(searchParams.outcome);
  const typeFilter = (searchParams.type ?? "").trim().slice(0, 80) || null;
  const rangeInterval = RANGES[range];

  const outcomeFilter = outcome === "any" ? null : outcome;

  const rowsRaw = await sql`
    SELECT id, created_at, event_type, route, ip, outcome, reason, metadata
    FROM security_events
    WHERE (${rangeInterval}::text IS NULL OR created_at > now() - (${rangeInterval}::text)::interval)
      AND (${typeFilter}::text IS NULL OR event_type = ${typeFilter})
      AND (${outcomeFilter}::text IS NULL OR outcome = ${outcomeFilter})
    ORDER BY created_at DESC
    LIMIT 200
  `;
  const rows = rowsRaw as unknown as EventRow[];

  const eventTypesRaw = await sql`
    SELECT event_type, COUNT(*)::int AS count
    FROM security_events
    WHERE (${rangeInterval}::text IS NULL OR created_at > now() - (${rangeInterval}::text)::interval)
    GROUP BY event_type
    ORDER BY count DESC, event_type ASC
  `;
  const eventTypes = eventTypesRaw as unknown as { event_type: string; count: number }[];

  return (
    <div className="px-10 py-10">
      <header>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Security events
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Mirrored from <code className="rounded bg-accent/60 px-1.5 py-0.5 font-mono text-xs">security-log.ts</code>{" "}
          into the database. Filters below are server-rendered.
        </p>
      </header>

      <form method="get" className="mt-6 flex flex-wrap items-end gap-3">
        <Field label="Range" name="range" defaultValue={range}>
          <option value="24h">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="all">All time</option>
        </Field>

        <Field label="Outcome" name="outcome" defaultValue={outcome}>
          {OUTCOMES.map((o) => (
            <option key={o} value={o}>
              {o === "any" ? "Any" : o.charAt(0).toUpperCase() + o.slice(1)}
            </option>
          ))}
        </Field>

        <Field label="Event type" name="type" defaultValue={typeFilter ?? ""}>
          <option value="">Any</option>
          {eventTypes.map((t) => (
            <option key={t.event_type} value={t.event_type}>
              {t.event_type} ({t.count})
            </option>
          ))}
        </Field>

        <button
          type="submit"
          className={cn(
            "h-9 rounded-md border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent/60",
            focusRing,
          )}
        >
          Apply
        </button>

        {(range !== "7d" || outcome !== "any" || typeFilter) && (
          <Link
            href="/admin/security"
            className={cn(
              "inline-flex h-9 items-center rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground",
              focusRing,
            )}
          >
            Clear filters
          </Link>
        )}
      </form>

      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/60">
              <Shield aria-hidden className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              No events match the current filter.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="w-44 px-5 py-3 font-medium">When</th>
                <th className="px-5 py-3 font-medium">Event</th>
                <th className="px-5 py-3 font-medium">Route</th>
                <th className="px-5 py-3 font-medium">Outcome</th>
                <th className="px-5 py-3 font-medium">IP</th>
                <th className="px-5 py-3 font-medium">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((ev) => (
                <tr key={ev.id} className="align-top hover:bg-accent/40">
                  <td className="px-5 py-3 font-mono text-xs tabular-nums text-muted-foreground">
                    {shortDateTime(ev.created_at)}
                  </td>
                  <td className="px-5 py-3">
                    <span className="font-mono text-xs text-foreground">
                      {ev.event_type}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                    {ev.route}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-2 rounded-md border px-2 py-0.5 text-xs font-medium uppercase tracking-wider",
                        outcomeStyle(ev.outcome),
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "inline-block h-2 w-2 rounded-full",
                          outcomeDot(ev.outcome),
                        )}
                      />
                      {ev.outcome}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                    {ev.ip ?? "·"}
                  </td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">
                    {ev.reason ? (
                      <div className="text-foreground">{ev.reason}</div>
                    ) : null}
                    {Object.keys(ev.metadata).length > 0 ? (
                      <code className="break-all font-mono text-[11px]">
                        {JSON.stringify(ev.metadata)}
                      </code>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {rows.length === 200 ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Showing the most recent 200 in this filter. Narrow the range or
          type to see older events.
        </p>
      ) : null}
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  children,
}: {
  label: string;
  name: string;
  defaultValue: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <select
        name={name}
        defaultValue={defaultValue}
        className={cn(
          "h-9 rounded-md border border-border bg-card px-2 text-sm text-foreground",
          focusRing,
        )}
      >
        {children}
      </select>
    </label>
  );
}
