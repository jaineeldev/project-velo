"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";
import {
  milestoneStatusSchema,
  timeEntrySchema,
  uuidSchema,
} from "@/lib/validation";

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
  return rows as ProjectListItem[];
}

export type ProjectMilestone = {
  id: string;
  title: string;
  status: string;
  amount: string;
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
  client: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    company_name: string | null;
  };
  milestones: ProjectMilestone[];
  timeEntries: ProjectTimeEntry[];
  finalInvoice: {
    canGenerate: boolean;
    existingId: string | null;
    remainingAmount: number;
  };
};

export async function getProject(projectId: string): Promise<ProjectDetail | null> {
  if (!uuidSchema.safeParse(projectId).success) return null;

  const user = await getOrCreateUser();

  const rows = await sql`
    SELECT
      p.id, p.title, p.status, p.created_at, p.proposal_id,
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

  const [milestones, timeEntries, invoices] = await Promise.all([
    sql`
      SELECT id, title, status, amount
      FROM milestones
      WHERE proposal_id = ${row.proposal_id}
      ORDER BY created_at
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
  ]);

  const milestoneRows = milestones as ProjectMilestone[];
  const allCompleted =
    milestoneRows.length > 0 &&
    milestoneRows.every((m) => m.status === "completed");

  const depositInvoice = (invoices as { id: string; type: string; total_amount: string }[])
    .find((i) => i.type === "deposit");
  const finalInvoice = (invoices as { id: string; type: string; total_amount: string }[])
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
    client: {
      id: row.client_id as string,
      name: row.client_name as string,
      email: (row.client_email as string | null) ?? null,
      phone: (row.client_phone as string | null) ?? null,
      company_name: (row.client_company_name as string | null) ?? null,
    },
    milestones: milestoneRows,
    timeEntries: timeEntries as ProjectTimeEntry[],
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
    throw new Error("Nothing remaining to invoice — the deposit covered the full project total.");

  // Proposal totals are stored inclusive of GST, so the GST portion is 1/11.
  const finalGst = remaining / 11;

  const [inserted] = await sql`
    INSERT INTO invoices (project_id, user_id, client_id, total_amount, gst_amount, status, type)
    VALUES (${projectId}, ${user.id}, ${project.client_id}, ${remaining}, ${finalGst}, 'unpaid', 'final')
    RETURNING id
  `;

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
