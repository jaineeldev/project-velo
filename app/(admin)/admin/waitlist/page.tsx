import { Download } from "lucide-react";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { cn, focusRing } from "@/lib/utils";

export const dynamic = "force-dynamic";

type SignupRow = {
  email: string;
  created_at: string;
  unsubscribed_at: string | null;
};

function shortDateTime(value: string): string {
  return new Date(value).toISOString().replace("T", " ").slice(0, 16);
}

export default async function AdminWaitlistPage() {
  await requireAdmin("/admin/waitlist");

  const [rowsRaw, [countsRow]] = await Promise.all([
    sql`
      SELECT email, created_at, unsubscribed_at
      FROM waitlist_signups
      ORDER BY created_at DESC
      LIMIT 500
    `,
    sql`
      SELECT
        COUNT(*) FILTER (WHERE unsubscribed_at IS NULL)::int AS active,
        COUNT(*) FILTER (WHERE unsubscribed_at IS NOT NULL)::int AS unsubscribed,
        COUNT(*)::int AS total
      FROM waitlist_signups
    `,
  ]);
  const rows = rowsRaw as SignupRow[];
  const counts = countsRow as {
    active: number;
    unsubscribed: number;
    total: number;
  };

  return (
    <div className="px-10 py-10">
      <header className="flex items-end justify-between gap-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Waitlist
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Public marketing signups. Export builds the broadcast list.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/api/admin/waitlist/export?include=active"
            className={cn(
              "inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent/60",
              focusRing,
            )}
          >
            <Download aria-hidden className="h-4 w-4" />
            Export active
          </a>
          <a
            href="/api/admin/waitlist/export?include=all"
            className={cn(
              "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
              focusRing,
            )}
          >
            Export all
          </a>
        </div>
      </header>

      <section className="mt-6 grid grid-cols-3 gap-3">
        <Tile label="Active" value={counts.active} primary />
        <Tile label="Unsubscribed" value={counts.unsubscribed} />
        <Tile label="Total" value={counts.total} />
      </section>

      <div className="mt-6 overflow-hidden rounded-lg border border-border bg-card">
        {rows.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-muted-foreground">
            No waitlist signups yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Signed up</th>
                <th className="px-5 py-3 text-right font-medium">
                  Unsubscribed
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => {
                const active = r.unsubscribed_at === null;
                return (
                  <tr key={r.email} className="hover:bg-accent/40">
                    <td className="px-5 py-3 font-medium text-foreground">
                      {r.email}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          "rounded-md border px-2 py-0.5 text-xs font-medium",
                          active
                            ? "border-primary/30 bg-primary/15 text-foreground"
                            : "border-border bg-accent/60 text-muted-foreground",
                        )}
                      >
                        {active ? "Active" : "Unsubscribed"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-xs tabular-nums text-muted-foreground">
                      {shortDateTime(r.created_at)}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-xs tabular-nums text-muted-foreground">
                      {r.unsubscribed_at
                        ? shortDateTime(r.unsubscribed_at)
                        : "·"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {rows.length === 500 ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Showing the most recent 500. Use export for the full list.
        </p>
      ) : null}
    </div>
  );
}

function Tile({
  label,
  value,
  primary,
}: {
  label: string;
  value: number;
  primary?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card px-4 py-3",
        primary ? "border-primary/30" : "",
      )}
    >
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-mono text-2xl font-semibold tabular-nums text-foreground">
        {value.toLocaleString()}
      </div>
    </div>
  );
}
