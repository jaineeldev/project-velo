import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject } from "../actions";
import { MilestoneStatusSelect } from "./milestone-status-select";
import { TimeEntryForm } from "./time-entry-form";
import { DeleteTimeEntryButton } from "./delete-time-entry-button";
import { GenerateFinalInvoiceButton } from "./generate-final-invoice-button";
import { PortalLinkDisplay } from "./portal-link-display";
import { ChangeRequestActions } from "./change-request-actions";
import { formatStatus } from "@/lib/format";

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

const entryFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
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

export default async function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const project = await getProject(params.id);
  if (!project) notFound();

  const totalHours = project.timeEntries.reduce(
    (sum, e) => sum + Number(e.hours),
    0,
  );

  return (
    <div className="px-10 py-12">
      <Link
        href="/dashboard/projects"
        className="inline-flex items-center gap-1 text-sm text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
      >
        ← Projects
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            {project.title}
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {project.client.name}
            {project.client.company_name
              ? ` · ${project.client.company_name}`
              : ""}
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${projectStatusStyles[project.status] ?? projectStatusStyles.active}`}
        >
          {formatStatus(project.status)}
        </span>
      </div>

      {/* Client portal share link */}
      <section className="mt-8 rounded-lg border border-neutral-200 p-5 dark:border-neutral-800">
        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
          Client portal
        </p>
        <p className="mt-1 mb-3 text-sm text-neutral-500 dark:text-neutral-400">
          Send this link to your client so they can track milestones, hours
          logged, and invoices for this project.
        </p>
        <PortalLinkDisplay shareToken={project.share_token} />
      </section>

      {/* Pending change requests */}
      {project.pendingChangeRequests.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Pending change requests
          </h2>
          <ul className="space-y-4">
            {project.pendingChangeRequests.map((cr) => (
              <li
                key={cr.id}
                className="rounded-lg border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-amber-800 dark:text-amber-300">
                    Submitted by client
                  </p>
                  <span className="text-xs text-amber-700/70 dark:text-amber-300/70">
                    {entryFmt.format(new Date(cr.created_at))}
                  </span>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-amber-900 dark:text-amber-100">
                  {cr.message}
                </p>
                <ChangeRequestActions
                  projectId={project.id}
                  changeRequestId={cr.id}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Client details */}
      <section className="mt-8 grid grid-cols-1 gap-3 rounded-lg border border-neutral-200 p-5 sm:grid-cols-3 dark:border-neutral-800">
        <div>
          <p className="text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Client
          </p>
          <p className="mt-1 text-sm text-neutral-900 dark:text-neutral-100">
            {project.client.name}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Email
          </p>
          <p className="mt-1 text-sm text-neutral-900 dark:text-neutral-100">
            {project.client.email ?? "—"}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Phone
          </p>
          <p className="mt-1 text-sm text-neutral-900 dark:text-neutral-100">
            {project.client.phone ?? "—"}
          </p>
        </div>
      </section>

      {/* Milestones */}
      <section className="mt-10">
        <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Milestones
        </h2>
        {project.milestones.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No milestones for this project.
          </p>
        ) : (
          <ul className="divide-y divide-neutral-200 border-t border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
            {project.milestones.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between gap-4 py-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {m.title}
                  </p>
                  <div className="mt-1 flex items-center gap-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${milestoneStatusStyles[m.status] ?? milestoneStatusStyles.not_started}`}
                    >
                      {formatStatus(m.status)}
                    </span>
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">
                      {currencyFmt.format(Number(m.amount))}
                    </span>
                  </div>
                </div>
                <MilestoneStatusSelect
                  projectId={project.id}
                  milestoneId={m.id}
                  currentStatus={m.status}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Final invoice */}
      {(project.finalInvoice.canGenerate ||
        project.finalInvoice.existingId) && (
        <section className="mt-10 rounded-lg border border-neutral-200 p-5 dark:border-neutral-800">
          {project.finalInvoice.existingId ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  Final invoice generated
                </p>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  All milestones are complete and a final invoice has been issued.
                </p>
              </div>
              <Link
                href={`/dashboard/invoices/${project.finalInvoice.existingId}`}
                className="rounded-md border border-neutral-200 px-3.5 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-900"
              >
                View final invoice
              </Link>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  All milestones complete
                </p>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  Generate a final invoice for the remaining balance.
                </p>
              </div>
              <GenerateFinalInvoiceButton
                projectId={project.id}
                remainingAmount={project.finalInvoice.remainingAmount}
              />
            </div>
          )}
        </section>
      )}

      {/* Time log */}
      <section className="mt-10">
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Time log
          </h2>
          {project.timeEntries.length > 0 && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Total: {totalHours.toFixed(2)} hrs
            </p>
          )}
        </div>

        <TimeEntryForm projectId={project.id} />

        {project.timeEntries.length === 0 ? (
          <p className="mt-6 text-sm text-neutral-500 dark:text-neutral-400">
            No time entries yet.
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-neutral-200 border-t border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
            {project.timeEntries.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between gap-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-neutral-900 dark:text-neutral-100">
                    {e.description}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    {entryFmt.format(new Date(e.created_at))}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {Number(e.hours).toFixed(2)} hrs
                  </span>
                  <DeleteTimeEntryButton
                    projectId={project.id}
                    entryId={e.id}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-10 text-xs text-neutral-400 dark:text-neutral-600">
        Created {dateFmt.format(new Date(project.created_at))}
      </p>
    </div>
  );
}
