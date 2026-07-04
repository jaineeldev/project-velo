"use server";

import { revalidatePath } from "next/cache";
import { clerkClient } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";
import { logSecurityEvent } from "@/lib/security-log";

// Type guards used by the deletion eligibility check. The exact status set
// here defines what "active work" means for a client: items that still
// expect an action from them. Approved/rejected/completed/paid are all
// terminal and don't block deletion.
const ACTIVE_PROPOSAL_STATUSES = ["sent", "changes_requested"] as const;
const ACTIVE_PROJECT_STATUSES = ["active"] as const;

export type DeletionBlocker = {
  kind: "proposal" | "project" | "invoice";
  count: number;
};

export type DeletionEligibility = {
  canDelete: boolean;
  blockers: DeletionBlocker[];
};

export async function checkDeletionEligibility(): Promise<DeletionEligibility> {
  const user = await getOrCreateUser();

  // Match by email like the dashboard query — clients live inside each
  // agency's clients table and the link to the auth user is by email.
  const [activeProposals, activeProjects, unpaidInvoices] = (await Promise.all([
    sql`
      SELECT COUNT(*)::int AS count
      FROM proposals p
      JOIN clients c ON c.id = p.client_id
      WHERE LOWER(c.email) = LOWER(${user.email})
        AND p.status = ANY(${ACTIVE_PROPOSAL_STATUSES as readonly string[]})
    `,
    sql`
      SELECT COUNT(*)::int AS count
      FROM projects pr
      JOIN clients c ON c.id = pr.client_id
      WHERE LOWER(c.email) = LOWER(${user.email})
        AND pr.status = ANY(${ACTIVE_PROJECT_STATUSES as readonly string[]})
    `,
    sql`
      SELECT COUNT(*)::int AS count
      FROM invoices i
      JOIN clients c ON c.id = i.client_id
      WHERE LOWER(c.email) = LOWER(${user.email})
        AND i.status = 'unpaid'
        AND i.total_amount > 0
    `,
  ])) as unknown as [{ count: number }[], { count: number }[], { count: number }[]];

  const blockers: DeletionBlocker[] = [];
  if (activeProposals[0].count > 0) {
    blockers.push({ kind: "proposal", count: activeProposals[0].count });
  }
  if (activeProjects[0].count > 0) {
    blockers.push({ kind: "project", count: activeProjects[0].count });
  }
  if (unpaidInvoices[0].count > 0) {
    blockers.push({ kind: "invoice", count: unpaidInvoices[0].count });
  }

  return { canDelete: blockers.length === 0, blockers };
}

export async function updateName(input: {
  firstName: string;
  lastName: string;
}): Promise<void> {
  const user = await getOrCreateUser();

  const firstName = input.firstName.trim().slice(0, 60);
  const lastName = input.lastName.trim().slice(0, 60);
  if (!firstName) throw new Error("First name is required.");
  if (firstName.length < 1) throw new Error("First name is too short.");

  // Clerk is the source of truth for profile name. The webhook fires
  // user.updated after this call returns, which syncs users.name and the
  // matching agency clients rows. We don't write to users/clients here to
  // avoid a brief inconsistent state where the DB is ahead of Clerk.
  const clerk = await clerkClient();
  await clerk.users.updateUser(user.clerk_id, {
    firstName,
    lastName: lastName || undefined,
  });

  revalidatePath("/client/settings");
  revalidatePath("/client/dashboard");
}

export async function deleteClientAccount(
  emailConfirmation: string,
): Promise<void> {
  const user = await getOrCreateUser();

  const typed = String(emailConfirmation ?? "").trim().toLowerCase();
  if (!typed || typed !== user.email.toLowerCase()) {
    throw new Error(
      "Email does not match. Type your account email exactly to confirm.",
    );
  }

  // Re-check eligibility server-side — UI also enforces, but a stale tab
  // could submit after a new proposal arrived.
  const eligibility = await checkDeletionEligibility();
  if (!eligibility.canDelete) {
    throw new Error(
      "Account cannot be deleted while you have active work or unpaid invoices.",
    );
  }

  // Clients don't own any rows besides their own users + user_profiles.
  // Agency-owned data (proposals, projects, invoices, clients records)
  // stays put — that's the agency's data, not the client's. The clients
  // rows that reference this user's email by string match remain too;
  // they're just contact records the agency keeps.
  await sql.begin(async (sql) => {
    await sql`DELETE FROM user_profiles WHERE user_id = ${user.id}`;
    await sql`DELETE FROM users WHERE id = ${user.id}`;
  });

  try {
    const clerk = await clerkClient();
    await clerk.users.deleteUser(user.clerk_id);
  } catch (err) {
    logSecurityEvent({
      event: "clerk_delete_failed",
      route: "client/settings/delete",
      outcome: "failure",
      reason: err instanceof Error ? err.message : "unknown",
    });
  }

  logSecurityEvent({
    event: "account_deleted",
    route: "client/settings/delete",
    outcome: "success",
  });
}
