import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject } from "../actions";
import { MilestoneStatusSelect } from "./milestone-status-select";
import { MilestoneDeliverables } from "./milestone-deliverables";
import { TimeEntryForm } from "./time-entry-form";
import { DeleteTimeEntryButton } from "./delete-time-entry-button";
import { GenerateFinalInvoiceButton } from "./generate-final-invoice-button";
import { PortalLinkDisplay } from "./portal-link-display";
import { ChangeRequestActions } from "./change-request-actions";
import { currencyFmt, dateLongFmt, dateTimeFmt } from "@/lib/format";
import { cn, focusRing } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";

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
        className={cn(
          "inline-flex items-center gap-1 rounded text-sm text-muted-foreground transition-colors hover:text-foreground",
          focusRing,
        )}
      >
        ← Projects
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {project.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {project.client.name}
            {project.client.company_name
              ? ` · ${project.client.company_name}`
              : ""}
          </p>
        </div>
        <StatusBadge status={project.status} />
      </div>

      {/* Client portal share link */}
      <section className="mt-8 rounded-xl border border-border bg-card p-5">
        <p className="text-sm font-medium text-foreground">Client portal</p>
        <p className="mt-1 mb-3 text-sm text-muted-foreground">
          Send this link to your client so they can track milestones, hours
          logged, and invoices for this project.
        </p>
        <PortalLinkDisplay shareToken={project.share_token} />
      </section>

      {/* Pending change requests */}
      {project.pendingChangeRequests.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Pending change requests
          </h2>
          <ul className="space-y-4">
            {project.pendingChangeRequests.map((cr) => (
              <li
                key={cr.id}
                className="rounded-xl border border-warning/30 bg-warning/10 p-5"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-warning">
                    Submitted by client
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {dateTimeFmt.format(new Date(cr.created_at))}
                  </span>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
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
      <section className="mt-8 grid grid-cols-1 gap-3 rounded-xl border border-border bg-card p-5 sm:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Client
          </p>
          <p className="mt-1 text-sm text-foreground">
            {project.client.name}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Email
          </p>
          <p className="mt-1 text-sm text-foreground">
            {project.client.email ?? "—"}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Phone
          </p>
          <p className="mt-1 text-sm text-foreground">
            {project.client.phone ?? "—"}
          </p>
        </div>
      </section>

      {/* Milestones */}
      <section className="mt-10">
        <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Milestones
        </h2>
        {project.milestones.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No milestones for this project.
          </p>
        ) : (
          <ul className="divide-y divide-border border-t border-border">
            {project.milestones.map((m) => (
              <li key={m.id} className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {m.title}
                    </p>
                    <div className="mt-1 flex items-center gap-3">
                      <StatusBadge status={m.status} />
                      <span className="text-sm text-muted-foreground">
                        {currencyFmt.format(Number(m.amount))}
                      </span>
                      {m.estimated_duration && (
                        <span className="text-sm text-muted-foreground">
                          · {m.estimated_duration}
                        </span>
                      )}
                    </div>
                  </div>
                  <MilestoneStatusSelect
                    projectId={project.id}
                    milestoneId={m.id}
                    currentStatus={m.status}
                  />
                </div>
                <MilestoneDeliverables
                  milestoneId={m.id}
                  deliverables={m.deliverables}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Final invoice */}
      {(project.finalInvoice.canGenerate ||
        project.finalInvoice.existingId) && (
        <section className="mt-10 rounded-xl border border-border bg-card p-5">
          {project.finalInvoice.existingId ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Final invoice generated
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  All milestones are complete and a final invoice has been
                  issued.
                </p>
              </div>
              <Link
                href={`/dashboard/invoices/${project.finalInvoice.existingId}`}
                className={cn(
                  "rounded-md border border-border px-3.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent",
                  focusRing,
                )}
              >
                View final invoice
              </Link>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-foreground">
                  All milestones complete
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
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
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Time log
          </h2>
          {project.timeEntries.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Total: {totalHours.toFixed(2)} hrs
            </p>
          )}
        </div>

        <TimeEntryForm projectId={project.id} />

        {project.timeEntries.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">
            No time entries yet.
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-border border-t border-border">
            {project.timeEntries.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between gap-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-foreground">
                    {e.description}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {dateTimeFmt.format(new Date(e.created_at))}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <span className="text-sm font-medium text-foreground">
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

      <p className="mt-10 text-xs text-muted-foreground">
        Created {dateLongFmt.format(new Date(project.created_at))}
      </p>
    </div>
  );
}
