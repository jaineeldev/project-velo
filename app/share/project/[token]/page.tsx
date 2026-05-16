import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import { formatStatus } from "@/lib/format";

// Public portal must always reflect the current milestone/invoice state —
// otherwise a status change in the dashboard is invisible to the client until
// the route cache happens to expire.
export const dynamic = "force-dynamic";
export const revalidate = 0;

const TOKEN_RE = /^[0-9a-f]{64}$/;

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const currencyFmt = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
});

const projectStatusStyles: Record<string, string> = {
  active: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  completed:
    "bg-yellow-50 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-400",
  delivered:
    "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400",
};

const milestoneStatusStyles: Record<string, string> = {
  not_started:
    "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
  in_progress:
    "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  completed:
    "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400",
};

const invoiceStatusStyles: Record<string, string> = {
  unpaid: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  paid: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400",
};

const invoiceTypeStyles: Record<string, string> = {
  deposit:
    "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  final:
    "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
};

type PortalProject = {
  id: string;
  proposal_id: string;
  title: string;
  status: string;
  client_name: string;
};

type MilestoneRow = { id: string; title: string; status: string };
type TimeRow = { hours: string };
type InvoiceRow = {
  id: string;
  type: string;
  status: string;
  total_amount: string;
  created_at: string | Date;
};

async function getPortalProject(token: string) {
  if (!TOKEN_RE.test(token)) return null;

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

  const [milestones, timeEntries, invoices] = await Promise.all([
    sql`
      SELECT id, title, status
      FROM milestones
      WHERE proposal_id = ${project.proposal_id}
      ORDER BY created_at
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

  const { project, milestones, timeEntries, invoices } = data;
  const totalHours = timeEntries.reduce((sum, e) => sum + Number(e.hours), 0);

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="mx-auto max-w-2xl px-6 py-16">
        {/* Header */}
        <div className="mb-10 border-b border-neutral-200 pb-8 dark:border-neutral-800">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-600">
            Project for {project.client_name}
          </p>
          <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              {project.title}
            </h1>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${projectStatusStyles[project.status] ?? projectStatusStyles.active}`}
            >
              {formatStatus(project.status)}
            </span>
          </div>
        </div>

        {/* Milestones */}
        <section>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-600">
            Milestones
          </h2>
          {milestones.length === 0 ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              No milestones for this project.
            </p>
          ) : (
            <ul className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
              {milestones.map((m, i) => (
                <li
                  key={m.id}
                  className={`flex items-center justify-between gap-4 px-4 py-3 ${i > 0 ? "border-t border-neutral-100 dark:border-neutral-900" : ""}`}
                >
                  <span className="truncate text-sm text-neutral-900 dark:text-neutral-100">
                    {m.title}
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${milestoneStatusStyles[m.status] ?? milestoneStatusStyles.not_started}`}
                  >
                    {formatStatus(m.status)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Time logged */}
        <section className="mt-12">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-600">
            Time logged
          </h2>
          <div className="rounded-lg border border-neutral-200 px-4 py-3 dark:border-neutral-800">
            <p className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              {totalHours.toFixed(2)} hrs
            </p>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {timeEntries.length === 0
                ? "No time logged yet."
                : `Across ${timeEntries.length} ${timeEntries.length === 1 ? "entry" : "entries"}.`}
            </p>
          </div>
        </section>

        {/* Invoices */}
        <section className="mt-12">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-600">
            Invoices
          </h2>
          {invoices.length === 0 ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              No invoices yet.
            </p>
          ) : (
            <ul className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
              {invoices.map((inv, i) => (
                <li
                  key={inv.id}
                  className={`flex items-center justify-between gap-4 px-4 py-3 ${i > 0 ? "border-t border-neutral-100 dark:border-neutral-900" : ""}`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${invoiceTypeStyles[inv.type] ?? invoiceTypeStyles.deposit}`}
                      >
                        {formatStatus(inv.type)}
                      </span>
                      <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {currencyFmt.format(Number(inv.total_amount))}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                      Issued {dateFmt.format(new Date(inv.created_at))}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${invoiceStatusStyles[inv.status] ?? invoiceStatusStyles.unpaid}`}
                  >
                    {formatStatus(inv.status)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="mt-16 text-center text-xs text-neutral-300 dark:text-neutral-700">
          Powered by whereismyapp
        </p>
      </div>
    </main>
  );
}
