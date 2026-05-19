import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { ExternalLink } from "lucide-react";
import { sql } from "@/lib/db";
import { getClientIp } from "@/lib/rate-limit";
import { logSecurityEvent } from "@/lib/security-log";
import { currencyFmt, dateShortFmt } from "@/lib/format";
import { StatusBadge } from "@/components/ui/status-badge";

// Public portal must always reflect the current milestone/invoice state —
// otherwise a status change in the dashboard is invisible to the client until
// the route cache happens to expire.
export const dynamic = "force-dynamic";
export const revalidate = 0;

const TOKEN_RE = /^[0-9a-f]{64}$/;

type PortalProject = {
  id: string;
  proposal_id: string;
  title: string;
  status: string;
  client_name: string;
};

type MilestoneRow = { id: string; title: string; status: string };
type DeliverableRow = { milestone_id: string; label: string; url: string };
type TimeRow = { hours: string };
type InvoiceRow = {
  id: string;
  type: string;
  status: string;
  total_amount: string;
  created_at: string | Date;
};

async function getPortalProject(token: string) {
  if (!TOKEN_RE.test(token)) {
    logSecurityEvent({
      event: "invalid_share_token",
      route: "share/project",
      ip: getClientIp(headers()),
      outcome: "denied",
      reason: "token_format",
    });
    return null;
  }

  // Query by share_token only — no user_id, client email/phone, or any
  // internal IDs leak. Mirror of the proposal share-page approach.
  const rows = await sql`
    SELECT p.id, p.proposal_id, p.title, p.status, c.name AS client_name
    FROM projects p
    JOIN clients c ON c.id = p.client_id
    WHERE p.share_token = ${token}
  `;
  if (rows.length === 0) return null;

  const project = rows[0] as PortalProject;

  const [milestones, deliverables, timeEntries, invoices] = await Promise.all([
    sql`
      SELECT id, title, status
      FROM milestones
      WHERE proposal_id = ${project.proposal_id}
      ORDER BY created_at
    `,
    // Deliverables join up through projects.share_token → proposals →
    // milestones, scoped to completed milestones only. The client never
    // supplies a deliverable or milestone ID directly — this query is the
    // single way the public portal sees them.
    sql`
      SELECT d.milestone_id, d.label, d.url
      FROM deliverables d
      JOIN milestones m ON m.id = d.milestone_id
      JOIN projects p ON p.proposal_id = m.proposal_id
      WHERE p.share_token = ${token}
        AND m.status = 'completed'
      ORDER BY d.created_at
    `,
    sql`
      SELECT hours FROM time_entries WHERE project_id = ${project.id}
    `,
    sql`
      SELECT id, type, status, total_amount, created_at
      FROM invoices
      WHERE project_id = ${project.id}
      ORDER BY created_at
    `,
  ]);

  return {
    project,
    milestones: milestones as MilestoneRow[],
    deliverables: deliverables as DeliverableRow[],
    timeEntries: timeEntries as TimeRow[],
    invoices: invoices as InvoiceRow[],
  };
}

export default async function ShareProjectPage({
  params,
}: {
  params: { token: string };
}) {
  const data = await getPortalProject(params.token);
  if (!data) notFound();

  const { project, milestones, deliverables, timeEntries, invoices } = data;
  const totalHours = timeEntries.reduce((sum, e) => sum + Number(e.hours), 0);

  // Group deliverables by milestone for rendering. The milestone_id is used
  // only as a map key in this server-rendered tree — it never appears in the
  // HTML, so the public portal stays free of internal IDs.
  const deliverablesByMilestone = new Map<string, { label: string; url: string }[]>();
  for (const d of deliverables) {
    const list = deliverablesByMilestone.get(d.milestone_id) ?? [];
    list.push({ label: d.label, url: d.url });
    deliverablesByMilestone.set(d.milestone_id, list);
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-6 py-16">
        {/* Header */}
        <div className="mb-10 border-b border-border pb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Project for {project.client_name}
          </p>
          <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              {project.title}
            </h1>
            <StatusBadge status={project.status} />
          </div>
        </div>

        {/* Milestones */}
        <section>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Milestones
          </h2>
          {milestones.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No milestones for this project.
            </p>
          ) : (
            <ul className="overflow-hidden rounded-lg border border-border">
              {milestones.map((m, i) => {
                const items = deliverablesByMilestone.get(m.id) ?? [];
                const showDeliverables = m.status === "completed" && items.length > 0;
                return (
                  <li
                    key={m.id}
                    className={i > 0 ? "border-t border-border" : ""}
                  >
                    <div className="flex items-center justify-between gap-4 px-4 py-3">
                      <span className="truncate text-sm text-foreground">
                        {m.title}
                      </span>
                      <StatusBadge status={m.status} />
                    </div>
                    {showDeliverables && (
                      <ul className="border-t border-border bg-muted/40 px-4 py-3 space-y-1.5">
                        {items.map((d, j) => (
                          <li key={j}>
                            <a
                              href={d.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm text-primary underline-offset-2 hover:underline"
                            >
                              <ExternalLink aria-hidden className="h-3.5 w-3.5" />
                              <span className="truncate">{d.label}</span>
                              <span className="text-xs text-muted-foreground">
                                · View deliverable
                              </span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Time logged */}
        <section className="mt-12">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Time logged
          </h2>
          <div className="rounded-lg border border-border bg-card px-4 py-3">
            <p className="text-2xl font-semibold tracking-tight text-foreground">
              {totalHours.toFixed(2)} hrs
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {timeEntries.length === 0
                ? "No time logged yet."
                : `Across ${timeEntries.length} ${timeEntries.length === 1 ? "entry" : "entries"}.`}
            </p>
          </div>
        </section>

        {/* Invoices */}
        <section className="mt-12">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Invoices
          </h2>
          {invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">No invoices yet.</p>
          ) : (
            <ul className="overflow-hidden rounded-lg border border-border">
              {invoices.map((inv, i) => (
                <li
                  key={inv.id}
                  className={`flex items-center justify-between gap-4 px-4 py-3 ${i > 0 ? "border-t border-border" : ""}`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={inv.type} />
                      <span className="text-sm font-medium text-foreground">
                        {currencyFmt.format(Number(inv.total_amount))}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Issued {dateShortFmt.format(new Date(inv.created_at))}
                    </p>
                  </div>
                  <StatusBadge status={inv.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="mt-16 flex flex-col items-center gap-1 text-xs text-muted-foreground">
          <p>Powered by Velo</p>
          <Link
            href="/privacy"
            className="rounded underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </main>
  );
}
