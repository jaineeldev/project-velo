"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { sql } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";
import { deleteAuthUser } from "@/lib/supabase/admin";
import { userProfileSchema } from "@/lib/validation";
import {
  getUserProfile,
  profileTag,
  type UserProfile,
} from "@/lib/user-profile";
import { logSecurityEvent } from "@/lib/security-log";

export async function getProfile(): Promise<UserProfile> {
  const user = await getOrCreateUser();
  return getUserProfile(user.id);
}

export type UpdateProfileInput = {
  businessName: string | null;
  abn: string | null;
  addressStreet: string | null;
  addressCity: string | null;
  addressState: string | null;
  addressPostcode: string | null;
  phone: string | null;
  website: string | null;
};

export async function updateProfile(input: UpdateProfileInput): Promise<void> {
  const result = userProfileSchema.safeParse(input);
  if (!result.success) throw new Error(result.error.issues[0].message);

  const user = await getOrCreateUser();
  const data = result.data;

  await sql`
    INSERT INTO user_profiles (
      user_id, business_name, abn,
      street, city, state, postcode,
      phone, website, updated_at
    )
    VALUES (
      ${user.id}, ${data.businessName}, ${data.abn},
      ${data.addressStreet}, ${data.addressCity}, ${data.addressState}, ${data.addressPostcode},
      ${data.phone}, ${data.website}, now()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      business_name = EXCLUDED.business_name,
      abn = EXCLUDED.abn,
      street = EXCLUDED.street,
      city = EXCLUDED.city,
      state = EXCLUDED.state,
      postcode = EXCLUDED.postcode,
      phone = EXCLUDED.phone,
      website = EXCLUDED.website,
      updated_at = now()
  `;

  // Profile is cached per-user across pages and PDF routes. Invalidate first
  // so the same-request revalidatePath calls below pick up the fresh row.
  revalidateTag(profileTag(user.id));
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/proposals", "layout");
  revalidatePath("/dashboard/invoices", "layout");
}

// ── deleteAccount ────────────────────────────────────────────────────────────

// Mirrors the client-side blocker model: an agency mid-engagement deleting
// would strand their clients (cascade wipes proposals/projects/invoices) and
// blow away the audit trail of money still owed. We block deletion until
// active work is wrapped up.
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

  const [activeProposals, activeProjects, unpaidInvoices] = (await Promise.all([
    sql`
      SELECT COUNT(*)::int AS count
      FROM proposals
      WHERE user_id = ${user.id}
        AND status = ANY(${ACTIVE_PROPOSAL_STATUSES as readonly string[]})
    `,
    sql`
      SELECT COUNT(*)::int AS count
      FROM projects
      WHERE user_id = ${user.id}
        AND status = ANY(${ACTIVE_PROJECT_STATUSES as readonly string[]})
    `,
    sql`
      SELECT COUNT(*)::int AS count
      FROM invoices
      WHERE user_id = ${user.id}
        AND status = 'unpaid'
        AND total_amount > 0
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

// Permanent. Deletes the Supabase login, then every row owned by the user.
// Caller must collect a typed-email confirmation before invoking — UI
// enforces, server double-checks.
export async function deleteAccount(emailConfirmation: string): Promise<void> {
  const user = await getOrCreateUser();

  const typed = String(emailConfirmation ?? "").trim().toLowerCase();
  if (!typed || typed !== user.email.toLowerCase()) {
    throw new Error(
      "Email does not match. Type your account email exactly to confirm.",
    );
  }

  // Re-check server-side. The danger zone disables the button when blockers
  // exist, but a stale tab could submit after a new proposal arrived.
  const eligibility = await checkDeletionEligibility();
  if (!eligibility.canDelete) {
    throw new Error(
      "Account cannot be deleted while you have active client work or unpaid invoices.",
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
      route: "dashboard/settings/delete",
      outcome: "failure",
      reason: err instanceof Error ? err.message : "unknown",
    });
    throw new Error(
      "Couldn't delete your account. Nothing was removed, so try again in a minute.",
    );
  }

  try {
    await deleteAgencyRows(user.id);
  } catch (err) {
    // The login is already gone, so these rows are unreachable. Log the id
    // so an operator can finish the cleanup by hand.
    logSecurityEvent({
      event: "account_delete_incomplete",
      route: "dashboard/settings/delete",
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
    route: "dashboard/settings/delete",
    outcome: "success",
  });
}

// Single atomic batch — partial deletion would leave orphaned rows that
// could be re-claimed when the same email signs up again. postgres.js's
// real transaction API is callback-based (sql.begin), not an array of
// pre-built queries — each statement below must run on the tx-scoped `sql`
// passed into the callback, not the module-level `sql` import.
async function deleteAgencyRows(userId: string): Promise<void> {
  await sql.begin(async (sql) => {
    await sql`DELETE FROM time_entries WHERE user_id = ${userId}`;
    await sql`
      DELETE FROM change_requests
      WHERE proposal_id IN (SELECT id FROM proposals WHERE user_id = ${userId})
    `;
    await sql`
      DELETE FROM proposal_events
      WHERE proposal_id IN (SELECT id FROM proposals WHERE user_id = ${userId})
    `;
    await sql`
      DELETE FROM line_items
      WHERE proposal_id IN (SELECT id FROM proposals WHERE user_id = ${userId})
    `;
    await sql`
      DELETE FROM milestones
      WHERE proposal_id IN (SELECT id FROM proposals WHERE user_id = ${userId})
    `;
    await sql`DELETE FROM invoices WHERE user_id = ${userId}`;
    await sql`DELETE FROM projects WHERE user_id = ${userId}`;
    await sql`DELETE FROM proposals WHERE user_id = ${userId}`;
    await sql`DELETE FROM clients WHERE user_id = ${userId}`;
    await sql`DELETE FROM user_profiles WHERE user_id = ${userId}`;
    await sql`DELETE FROM users WHERE id = ${userId}`;
  });
}
