"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { deleteAuthUser } from "@/lib/supabase/admin";
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

export async function updateName(rawName: string): Promise<void> {
  const user = await getOrCreateUser();

  const name = String(rawName ?? "").trim().replace(/\s+/g, " ");
  if (!name) throw new Error("Name is required.");
  if (name.length > 100) throw new Error("Keep your name under 100 characters.");

  // The name lives in three places, all updated here:
  //   - Supabase Auth metadata, which the sidebars read client-side.
  //   - users.name, which server-rendered pages read.
  //   - every agency's clients row for this person (matched by email), so
  //     the agencies they work with see the new name too.
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ data: { name } });
  if (error) throw new Error("Couldn't update your name. Try again.");

  await sql.begin(async (sql) => {
    await sql`UPDATE users SET name = ${name} WHERE id = ${user.id}`;
    await sql`
      UPDATE clients SET name = ${name}
      WHERE LOWER(email) = LOWER(${user.email})
    `;
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

  // Login first: if this fails, nothing has been removed and the user can
  // retry. Deleting the rows first would leave a working login, and the next
  // request would have getSessionUser() quietly re-create an empty account.
  try {
    await deleteAuthUser(user.id);
  } catch (err) {
    logSecurityEvent({
      event: "auth_user_delete_failed",
      route: "client/settings/delete",
      outcome: "failure",
      reason: err instanceof Error ? err.message : "unknown",
    });
    throw new Error(
      "Couldn't delete your account. Nothing was removed, so try again in a minute.",
    );
  }

  // Clients don't own any rows besides their own users + user_profiles.
  // Agency-owned data (proposals, projects, invoices, clients records)
  // stays put — that's the agency's data, not the client's. The clients
  // rows that reference this user's email by string match remain too;
  // they're just contact records the agency keeps.
  try {
    await sql.begin(async (sql) => {
      await sql`DELETE FROM user_profiles WHERE user_id = ${user.id}`;
      await sql`DELETE FROM users WHERE id = ${user.id}`;
    });
  } catch (err) {
    // The login is already gone, so these rows are unreachable. Log the id
    // so an operator can finish the cleanup by hand.
    logSecurityEvent({
      event: "account_delete_incomplete",
      route: "client/settings/delete",
      outcome: "failure",
      reason: err instanceof Error ? err.message : "unknown",
      meta: { user_id: user.id },
    });
    throw new Error(
      "Your login was deleted but some of your data wasn't. It's been flagged for manual cleanup.",
    );
  }

  logSecurityEvent({
    event: "account_deleted",
    route: "client/settings/delete",
    outcome: "success",
  });
}
