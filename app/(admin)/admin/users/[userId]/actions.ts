"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { logSecurityEvent } from "@/lib/security-log";
import { uuidSchema } from "@/lib/validation";

// Operator actions for the user detail page. Both write to security_events
// so the suspension trail shows up in /admin/security and survives the row
// being unsuspended later.

type ActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function suspendUser(userId: string): Promise<ActionResult> {
  await requireAdmin("/admin/users/[userId]/suspend");

  if (!uuidSchema.safeParse(userId).success) {
    return { ok: false, error: "User not found" };
  }

  const rows = await sql`
    UPDATE user_profiles
    SET suspended_at = now(), updated_at = now()
    WHERE user_id = ${userId}
      AND suspended_at IS NULL
    RETURNING user_id
  `;

  if (rows.length === 0) {
    return { ok: false, error: "User not found or already suspended" };
  }

  logSecurityEvent({
    event: "admin_account_suspended",
    route: "/admin/users/[userId]",
    outcome: "success",
    meta: { target_user_id: userId },
  });

  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function unsuspendUser(userId: string): Promise<ActionResult> {
  await requireAdmin("/admin/users/[userId]/unsuspend");

  if (!uuidSchema.safeParse(userId).success) {
    return { ok: false, error: "User not found" };
  }

  const rows = await sql`
    UPDATE user_profiles
    SET suspended_at = NULL, updated_at = now()
    WHERE user_id = ${userId}
      AND suspended_at IS NOT NULL
    RETURNING user_id
  `;

  if (rows.length === 0) {
    return { ok: false, error: "User not found or already active" };
  }

  logSecurityEvent({
    event: "admin_account_unsuspended",
    route: "/admin/users/[userId]",
    outcome: "success",
    meta: { target_user_id: userId },
  });

  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/users");
  return { ok: true };
}
