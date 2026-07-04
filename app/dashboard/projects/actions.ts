"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";
import {
  deliverableSchema,
  milestoneStatusSchema,
  timeEntrySchema,
  uuidSchema,
} from "@/lib/validation";
import {
  getAppBaseUrl,
  sendClientChangeRequestDecisionEmail,
  sendInvoiceIssuedEmail,
  sendMilestoneCompletedEmail,
} from "@/lib/email";
import { logEmailFailureEvent, notifyDevOfFailure } from "@/lib/notifications";

export type ProjectListItem = {
  id: string;
  title: string;
  status: string;
  created_at: string | Date;
  client_name: string;
};

export async function getProjects(): Promise<ProjectListItem[]> {
  const user = await getOrCreateUser();

  const rows = await sql`
    SELECT p.id, p.title, p.status, p.created_at, c.name AS client_name
    FROM projects p
    JOIN clients c ON c.id = p.client_id
    WHERE p.user_id = ${user.id}
    ORDER BY p.created_at DESC
  `;
  return rows as unknown as ProjectListItem[];
}

export type ProjectDeliverable = {
  id: string;
  label: string;
  url: string;
};

export type ProjectMilestone = {
  id: string;
  title: string;
  status: string;
  amount: string;
  estimated_duration: string | null;
  deliverables: ProjectDeliverable[];
};

export type ProjectTimeEntry = {
  id: string;
  description: string;
  hours: string;
  created_at: string | Date;
};

export type ProjectDetail = {
  id: string;
  title: string;
  status: string;
  created_at: string | Date;
  proposal_id: string;
  share_token: string;
  client: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    company_name: string | null;
  };
  milestones: ProjectMilestone[];
  timeEntries: ProjectTimeEntry[];
  pendingChangeRequests: PendingChangeRequest[];
  finalInvoice: {
    canGenerate: boolean;
    existingId: string | null;
    remainingAmount: number;
  };
};

export type PendingChangeRequest = {
  id: string;
  message: string;
  created_at: string | Date;
};

export async function getProject(projectId: string): Promise<ProjectDetail | null> {
  if (!uuidSchema.safeParse(projectId).success) return null;

  const user = await getOrCreateUser();

  const rows = await sql`
    SELECT
      p.id, p.title, p.status, p.created_at, p.proposal_id, p.share_token,
      c.id AS client_id, c.name AS client_name, c.email AS client_email,
      c.phone AS client_phone, c.company_name AS client_company_name,
      pr.total_amount AS proposal_total_amount
    FROM projects p
    JOIN clients c ON c.id = p.client_id
    JOIN proposals pr ON pr.id = p.proposal_id
    WHERE p.id = ${projectId} AND p.user_id = ${user.id}
  `;
  if (rows.length === 0) return null;

  const row = rows[0];

  const [milestones, deliverables, timeEntries, invoices, pendingChangeRequests] = await Promise.all([
    sql`
      SELECT id, title, status, amount, estimated_duration
      FROM milestones
      WHERE proposal_id = ${row.proposal_id}
      ORDER BY created_at
    `,
    // Deliverables join up through milestone → proposal → project for the
    // ownership scope. We fetch them in one query and bucket by milestone_id
    // in app code rather than running N queries.
    sql`
      SELECT d.id, d.milestone_id, d.label, d.url
      FROM deliverables d
      JOIN milestones m ON m.id = d.milestone_id
      WHERE m.proposal_id = ${row.proposal_id}
      ORDER BY d.created_at
    `,
    sql`
      SELECT id, description, hours, created_at
      FROM time_entries
      WHERE project_id = ${projectId}
      ORDER BY created_at DESC
    `,
    sql`
      SELECT id, type, total_amount
      FROM invoices
      WHERE project_id = ${projectId}
    `,
    // Join change_requests → proposals → projects so the data path from a
    // project to its pending CRs is explicit in SQL (CRs are stored against
    // the proposal, but we look them up by the project being viewed).
    sql`
      SELECT cr.id, cr.message, cr.created_at
      FROM change_requests cr
      JOIN proposals pr ON pr.id = cr.proposal_id
      JOIN projects pj ON pj.proposal_id = pr.id
      WHERE pj.id = ${projectId}
        AND pj.user_id = ${user.id}
        AND cr.status = 'pending'
      ORDER BY cr.created_at DESC
    `,
  ]);

  const deliverableRows = deliverables as unknown as (ProjectDeliverable & {
    milestone_id: string;
  })[];
  const deliverablesByMilestone = new Map<string, ProjectDeliverable[]>();
  for (const d of deliverableRows) {
    const list = deliverablesByMilestone.get(d.milestone_id) ?? [];
    list.push({ id: d.id, label: d.label, url: d.url });
    deliverablesByMilestone.set(d.milestone_id, list);
  }

  const milestoneRows = (milestones as unknown as Omit<ProjectMilestone, "deliverables">[]).map(
    (m) => ({
      ...m,
      deliverables: deliverablesByMilestone.get(m.id) ?? [],
    }),
  );
  const allCompleted =
    milestoneRows.length > 0 &&
    milestoneRows.every((m) => m.status === "completed");

  const depositInvoice = (invoices as unknown as { id: string; type: string; total_amount: string }[])
    .find((i) => i.type === "deposit");
  const finalInvoice = (invoices as unknown as { id: string; type: string; total_amount: string }[])
    .find((i) => i.type === "final");

  const proposalTotal = Number(row.proposal_total_amount);
  const depositPaid = depositInvoice ? Number(depositInvoice.total_amount) : 0;
  const remainingAmount = Math.max(0, proposalTotal - depositPaid);

  return {
    id: row.id as string,
    title: row.title as string,
    status: row.status as string,
    created_at: row.created_at as string,
    proposal_id: row.proposal_id as string,
    share_token: row.share_token as string,
    client: {
      id: row.client_id as string,
      name: row.client_name as string,
      email: (row.client_email as string | null) ?? null,
      phone: (row.client_phone as string | null) ?? null,
      company_name: (row.client_company_name as string | null) ?? null,
    },
    milestones: milestoneRows,
    timeEntries: timeEntries as unknown as ProjectTimeEntry[],
    pendingChangeRequests: pendingChangeRequests as unknown as PendingChangeRequest[],
    finalInvoice: {
      canGenerate: allCompleted && !finalInvoice && remainingAmount > 0,
      existingId: finalInvoice?.id ?? null,
      remainingAmount,
    },
  };
}

export async function generateFinalInvoice(projectId: string): Promise<string> {
  if (!uuidSchema.safeParse(projectId).success) throw new Error("Project not found.");

  const user = await getOrCreateUser();

  const projectRows = await sql`
    SELECT p.id, p.client_id, p.proposal_id, pr.total_amount AS proposal_total_amount
    FROM projects p
    JOIN proposals pr ON pr.id = p.proposal_id
    WHERE p.id = ${projectId} AND p.user_id = ${user.id}
  `;
  if (projectRows.length === 0) throw new Error("Project not found.");
  const project = projectRows[0];

  // All milestones must be completed (and there must be at least one).
  const milestones = await sql`
    SELECT status FROM milestones WHERE proposal_id = ${project.proposal_id}
  `;
  if (milestones.length === 0)
    throw new Error("This project has no milestones to complete.");
  if (!milestones.every((m) => m.status === "completed"))
    throw new Error("All milestones must be completed before generating a final invoice.");

  const existingFinal = await sql`
    SELECT id FROM invoices WHERE project_id = ${projectId} AND type = 'final' LIMIT 1
  `;
  if (existingFinal.length > 0)
    throw new Error("A final invoice has already been generated for this project.");

  const depositRows = await sql`
    SELECT total_amount FROM invoices
    WHERE project_id = ${projectId} AND type = 'deposit'
    LIMIT 1
  `;
  const depositPaid = depositRows.length > 0 ? Number(depositRows[0].total_amount) : 0;
  const proposalTotal = Number(project.proposal_total_amount);
  const remaining = proposalTotal - depositPaid;
  if (remaining <= 0)
    throw new Error("Nothing remaining to invoice. The deposit covered the full project total.");

  // Proposal totals are stored inclusive of GST, so the GST portion is 1/11.
  const finalGst = remaining / 11;

  const [inserted] = await sql`
    INSERT INTO invoices (project_id, user_id, client_id, total_amount, gst_amount, status, type)
    VALUES (${projectId}, ${user.id}, ${project.client_id}, ${remaining}, ${finalGst}, 'unpaid', 'final')
    RETURNING id
  `;

  await notifyInvoiceIssued({
    projectId,
    agencyUserId: user.id,
    totalAmount: remaining,
    invoiceType: "final",
  });

  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath("/dashboard/invoices");

  return inserted.id as string;
}

export async function updateMilestoneStatus(
  projectId: string,
  milestoneId: string,
  status: string,
): Promise<void> {
  if (!uuidSchema.safeParse(projectId).success) throw new Error("Project not found.");
  if (!uuidSchema.safeParse(milestoneId).success)
    throw new Error("Milestone not found.");

  const parsed = milestoneStatusSchema.safeParse(status);
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  const user = await getOrCreateUser();

  // Read the pre-update status so we can detect a TRANSITION to 'completed'
  // (rather than re-saving an already-completed milestone, which shouldn't
  // re-send the email).
  const before = await sql`
    SELECT m.status, m.title
    FROM milestones m
    JOIN projects p ON p.proposal_id = m.proposal_id
    WHERE m.id = ${milestoneId}
      AND p.id = ${projectId}
      AND p.user_id = ${user.id}
  `;
  const previousStatus = before[0]?.status as string | undefined;
  const milestoneTitle = (before[0]?.title as string | undefined) ?? "";

  // Authorization: ensure the milestone belongs to a project owned by this
  // user (milestones link to proposal_id, projects link to user_id).
  const result = await sql`
    UPDATE milestones m
    SET status = ${parsed.data}
    FROM projects p
    WHERE m.id = ${milestoneId}
      AND m.proposal_id = p.proposal_id
      AND p.id = ${projectId}
      AND p.user_id = ${user.id}
    RETURNING m.id, m.proposal_id
  `;
  if (result.length === 0) throw new Error("Milestone not found.");

  if (parsed.data === "completed" && previousStatus !== "completed") {
    await notifyMilestoneCompleted({
      projectId,
      agencyUserId: user.id,
      milestoneTitle,
    });
  }

  // Keep project status in sync with milestone state, but never override
  // 'delivered' (set after a final invoice is paid).
  const proposalId = result[0].proposal_id as string;
  const milestoneRows = await sql`
    SELECT status FROM milestones WHERE proposal_id = ${proposalId}
  `;
  const allCompleted =
    milestoneRows.length > 0 &&
    milestoneRows.every((m) => m.status === "completed");

  if (allCompleted) {
    await sql`
      UPDATE projects SET status = 'completed'
      WHERE id = ${projectId} AND user_id = ${user.id} AND status = 'active'
    `;
  } else {
    await sql`
      UPDATE projects SET status = 'active'
      WHERE id = ${projectId} AND user_id = ${user.id} AND status = 'completed'
    `;
  }

  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath("/dashboard/projects");
}

export async function addTimeEntry(
  projectId: string,
  input: { description: string; hours: number | string },
): Promise<void> {
  if (!uuidSchema.safeParse(projectId).success) throw new Error("Project not found.");

  const parsed = timeEntrySchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  const user = await getOrCreateUser();

  const project = await sql`
    SELECT id FROM projects WHERE id = ${projectId} AND user_id = ${user.id}
  `;
  if (project.length === 0) throw new Error("Project not found.");

  await sql`
    INSERT INTO time_entries (project_id, user_id, description, hours)
    VALUES (${projectId}, ${user.id}, ${parsed.data.description}, ${parsed.data.hours})
  `;

  revalidatePath(`/dashboard/projects/${projectId}`);
}

export async function respondToChangeRequest(
  projectId: string,
  changeRequestId: string,
  decision: "approved" | "rejected",
  note: string,
): Promise<void> {
  if (!uuidSchema.safeParse(projectId).success) throw new Error("Project not found.");
  if (!uuidSchema.safeParse(changeRequestId).success)
    throw new Error("Change request not found.");
  if (decision !== "approved" && decision !== "rejected")
    throw new Error("Invalid decision.");

  const trimmedNote = note.trim();
  if (trimmedNote.length > 2000)
    throw new Error("Note must be 2000 characters or fewer.");

  const user = await getOrCreateUser();

  // Authorization + atomic state transition: only act on a still-pending row
  // belonging to a project owned by this user.
  const result = await sql`
    UPDATE change_requests cr
    SET status = ${decision},
        response_note = ${trimmedNote === "" ? null : trimmedNote},
        responded_at = now()
    FROM projects p
    WHERE cr.id = ${changeRequestId}
      AND cr.proposal_id = p.proposal_id
      AND p.id = ${projectId}
      AND p.user_id = ${user.id}
      AND cr.status = 'pending'
    RETURNING cr.id, cr.proposal_id
  `;
  if (result.length === 0)
    throw new Error("Change request not found or already responded to.");

  const proposalId = result[0].proposal_id as string;

  // Activity log entry that mirrors the existing change-request submission
  // event, for parity in the proposal's Activity timeline.
  const description =
    decision === "approved"
      ? trimmedNote
        ? `Change request approved: ${trimmedNote}`
        : "Change request approved"
      : trimmedNote
        ? `Change request rejected: ${trimmedNote}`
        : "Change request rejected";

  await sql`
    INSERT INTO proposal_events (proposal_id, event_type, description)
    VALUES (${proposalId}, ${`change_request_${decision}`}, ${description})
  `;

  // Notify the client of the decision. Best-effort: failure is logged but
  // doesn't break the response action.
  try {
    const details = await sql`
      SELECT p.title AS proposal_title, p.share_token,
             c.email AS client_email, c.name AS client_name,
             u.email AS agency_email, u.name AS agency_name
      FROM proposals p
      JOIN clients c ON c.id = p.client_id
      JOIN users u ON u.id = p.user_id
      WHERE p.id = ${proposalId}
    `;
    const row = details[0];
    const clientEmail = (row?.client_email as string | undefined) ?? "";
    if (clientEmail) {
      const res = await sendClientChangeRequestDecisionEmail({
        to: clientEmail,
        clientName: (row?.client_name as string | null) ?? "",
        agencyName: (row?.agency_name as string | null) ?? "",
        proposalTitle: (row?.proposal_title as string) ?? "",
        decision,
        note: trimmedNote,
        proposalUrl: `${getAppBaseUrl()}/share/proposal/${row?.share_token}`,
      });
      if (!res.ok) {
        await notifyDevOfFailure({
          proposalId,
          agencyEmail: (row?.agency_email as string | undefined) ?? "",
          agencyName: (row?.agency_name as string | null) ?? "",
          failedEvent: "client_change_request_decision",
          intendedRecipient: clientEmail,
          reason: res.reason,
          contextLabel: `Change-request decision (${decision})`,
        });
      }
    }
  } catch {
    await logEmailFailureEvent(proposalId, "client_change_request_decision");
  }

  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath(`/dashboard/proposals/${proposalId}`);
}

export async function deleteTimeEntry(
  projectId: string,
  entryId: string,
): Promise<void> {
  if (!uuidSchema.safeParse(projectId).success) throw new Error("Project not found.");
  if (!uuidSchema.safeParse(entryId).success) throw new Error("Entry not found.");

  const user = await getOrCreateUser();

  await sql`
    DELETE FROM time_entries
    WHERE id = ${entryId} AND project_id = ${projectId} AND user_id = ${user.id}
  `;

  revalidatePath(`/dashboard/projects/${projectId}`);
}

export async function addDeliverable(
  milestoneId: string,
  label: string,
  url: string,
): Promise<void> {
  if (!uuidSchema.safeParse(milestoneId).success)
    throw new Error("Milestone not found.");

  const parsed = deliverableSchema.safeParse({ label, url });
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  const user = await getOrCreateUser();

  // Ownership check: the milestone belongs to a proposal that has a project
  // owned by this user. Without the projects join, anyone with a milestone
  // UUID could attach links to it.
  const owned = await sql`
    SELECT p.id AS project_id
    FROM milestones m
    JOIN projects p ON p.proposal_id = m.proposal_id
    WHERE m.id = ${milestoneId} AND p.user_id = ${user.id}
    LIMIT 1
  `;
  if (owned.length === 0) throw new Error("Milestone not found.");

  await sql`
    INSERT INTO deliverables (milestone_id, label, url)
    VALUES (${milestoneId}, ${parsed.data.label}, ${parsed.data.url})
  `;

  revalidatePath(`/dashboard/projects/${owned[0].project_id}`);
}

export async function removeDeliverable(deliverableId: string): Promise<void> {
  if (!uuidSchema.safeParse(deliverableId).success)
    throw new Error("Deliverable not found.");

  const user = await getOrCreateUser();

  // Delete-and-return enforces ownership in one round trip: the row only
  // matches when the join chain reaches a project owned by this user.
  const deleted = await sql`
    DELETE FROM deliverables d
    USING milestones m, projects p
    WHERE d.id = ${deliverableId}
      AND m.id = d.milestone_id
      AND p.proposal_id = m.proposal_id
      AND p.user_id = ${user.id}
    RETURNING p.id AS project_id
  `;
  if (deleted.length === 0) throw new Error("Deliverable not found.");

  revalidatePath(`/dashboard/projects/${deleted[0].project_id}`);
}

// ── Client-facing notification helpers ───────────────────────────────────────
// All three swallow their own errors and never block the caller. A failed
// email shouldn't take down a DB-write action — the action is the source of
// truth; the email is best-effort.

async function notifyMilestoneCompleted(args: {
  projectId: string;
  agencyUserId: string;
  milestoneTitle: string;
}): Promise<void> {
  try {
    const rows = await sql`
      SELECT
        pr.title AS project_title,
        pr.share_token,
        pr.proposal_id,
        c.email AS client_email,
        c.name AS client_name,
        u.email AS agency_email,
        u.name AS agency_name
      FROM projects pr
      JOIN clients c ON c.id = pr.client_id
      JOIN users u ON u.id = pr.user_id
      WHERE pr.id = ${args.projectId} AND pr.user_id = ${args.agencyUserId}
    `;
    const row = rows[0];
    if (!row?.client_email) return;
    const clientEmail = row.client_email as string;
    const res = await sendMilestoneCompletedEmail({
      to: clientEmail,
      clientName: (row.client_name as string) ?? "",
      agencyName: (row.agency_name as string) ?? "",
      milestoneTitle: args.milestoneTitle,
      projectTitle: (row.project_title as string) ?? "",
      projectUrl: `${getAppBaseUrl()}/share/project/${row.share_token}`,
    });
    if (!res.ok) {
      await notifyDevOfFailure({
        proposalId: (row.proposal_id as string) ?? null,
        agencyEmail: (row.agency_email as string) ?? "",
        agencyName: (row.agency_name as string) ?? "",
        failedEvent: "milestone_completed",
        intendedRecipient: clientEmail,
        reason: res.reason,
        contextLabel: `Milestone "${args.milestoneTitle}"`,
      });
    }
  } catch {
    // Outer DB failure: nothing safe to do without context.
  }
}

async function notifyInvoiceIssued(args: {
  projectId: string;
  agencyUserId: string;
  totalAmount: number;
  invoiceType: "deposit" | "final";
}): Promise<void> {
  try {
    const rows = await sql`
      SELECT
        pr.title AS project_title,
        pr.share_token,
        pr.proposal_id,
        c.email AS client_email,
        c.name AS client_name,
        u.email AS agency_email,
        u.name AS agency_name
      FROM projects pr
      JOIN clients c ON c.id = pr.client_id
      JOIN users u ON u.id = pr.user_id
      WHERE pr.id = ${args.projectId} AND pr.user_id = ${args.agencyUserId}
    `;
    const row = rows[0];
    if (!row?.client_email) return;
    const clientEmail = row.client_email as string;
    const res = await sendInvoiceIssuedEmail({
      to: clientEmail,
      clientName: (row.client_name as string) ?? "",
      agencyName: (row.agency_name as string) ?? "",
      invoiceType: args.invoiceType,
      totalAmount: args.totalAmount,
      projectTitle: (row.project_title as string) ?? "",
      projectUrl: `${getAppBaseUrl()}/share/project/${row.share_token}`,
    });
    if (!res.ok) {
      await notifyDevOfFailure({
        proposalId: (row.proposal_id as string) ?? null,
        agencyEmail: (row.agency_email as string) ?? "",
        agencyName: (row.agency_name as string) ?? "",
        failedEvent: `invoice_issued_${args.invoiceType}`,
        intendedRecipient: clientEmail,
        reason: res.reason,
        contextLabel: `${args.invoiceType === "deposit" ? "Deposit" : "Final"} invoice for "${row.project_title}"`,
      });
    }
  } catch {
    // Outer DB failure: nothing safe to do without context.
  }
}
