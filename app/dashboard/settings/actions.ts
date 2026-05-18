"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { clerkClient } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";
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

// Permanent. Removes every row owned by the user from the DB, then deletes
// the Clerk user. Caller must collect a typed-email confirmation before
// invoking — UI enforces, server double-checks.
export async function deleteAccount(emailConfirmation: string): Promise<void> {
  const user = await getOrCreateUser();

  const typed = String(emailConfirmation ?? "").trim().toLowerCase();
  if (!typed || typed !== user.email.toLowerCase()) {
    throw new Error(
      "Email does not match. Type your account email exactly to confirm.",
    );
  }

  // Single atomic batch — partial deletion would leave orphaned rows that
  // could be re-claimed when the same email signs up again.
  await sql.transaction([
    sql`DELETE FROM time_entries WHERE user_id = ${user.id}`,
    sql`
      DELETE FROM change_requests
      WHERE proposal_id IN (SELECT id FROM proposals WHERE user_id = ${user.id})
    `,
    sql`
      DELETE FROM proposal_events
      WHERE proposal_id IN (SELECT id FROM proposals WHERE user_id = ${user.id})
    `,
    sql`
      DELETE FROM line_items
      WHERE proposal_id IN (SELECT id FROM proposals WHERE user_id = ${user.id})
    `,
    sql`
      DELETE FROM milestones
      WHERE proposal_id IN (SELECT id FROM proposals WHERE user_id = ${user.id})
    `,
    sql`DELETE FROM invoices WHERE user_id = ${user.id}`,
    sql`DELETE FROM projects WHERE user_id = ${user.id}`,
    sql`DELETE FROM proposals WHERE user_id = ${user.id}`,
    sql`DELETE FROM clients WHERE user_id = ${user.id}`,
    sql`DELETE FROM user_profiles WHERE user_id = ${user.id}`,
    sql`DELETE FROM users WHERE id = ${user.id}`,
  ]);

  // DB is authoritative — if Clerk delete fails, the orphaned Clerk account
  // can't sign back in to a missing user row. Log and continue.
  try {
    const clerk = await clerkClient();
    await clerk.users.deleteUser(user.clerk_id);
  } catch (err) {
    logSecurityEvent({
      event: "clerk_delete_failed",
      route: "dashboard/settings/delete",
      outcome: "failure",
      reason: err instanceof Error ? err.message : "unknown",
    });
  }

  logSecurityEvent({
    event: "account_deleted",
    route: "dashboard/settings/delete",
    outcome: "success",
  });
}
