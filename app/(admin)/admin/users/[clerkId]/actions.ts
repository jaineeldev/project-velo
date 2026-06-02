"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { logSecurityEvent } from "@/lib/security-log";

// Operator actions for the user detail page. Both write to security_events
// so the suspension trail shows up in /admin/security and survives the row
// being unsuspended later.

type ActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function suspendUser(clerkId: string): Promise<ActionResult> {
  await requireAdmin("/admin/users/[clerkId]/suspend");

  const trimmed = (clerkId ?? "").trim();
  if (!trimmed) return { ok: false, error: "Missing clerk id" };

  const rows = await sql`
    UPDATE user_profiles
    SET suspended_at = now(), updated_at = now()
    WHERE user_id = (SELECT id FROM users WHERE clerk_id = ${trimmed})
      AND suspended_at IS NULL
    RETURNING user_id
  `;

  if (rows.length === 0) {
    return { ok: false, error: "User not found or already suspended" };
  }

  logSecurityEvent({
    event: "admin_account_suspended",
    route: "/admin/users/[clerkId]",
    outcome: "success",
    meta: { target_clerk_id: trimmed },
  });

  revalidatePath(`/admin/users/${encodeURIComponent(trimmed)}`);
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function unsuspendUser(clerkId: string): Promise<ActionResult> {
  await requireAdmin("/admin/users/[clerkId]/unsuspend");

  const trimmed = (clerkId ?? "").trim();
  if (!trimmed) return { ok: false, error: "Missing clerk id" };

  const rows = await sql`
    UPDATE user_profiles
    SET suspended_at = NULL, updated_at = now()
    WHERE user_id = (SELECT id FROM users WHERE clerk_id = ${trimmed})
      AND suspended_at IS NOT NULL
    RETURNING user_id
  `;

  if (rows.length === 0) {
    return { ok: false, error: "User not found or already active" };
  }

  logSecurityEvent({
    event: "admin_account_unsuspended",
    route: "/admin/users/[clerkId]",
    outcome: "success",
    meta: { target_clerk_id: trimmed },
  });

  revalidatePath(`/admin/users/${encodeURIComponent(trimmed)}`);
  revalidatePath("/admin/users");
  return { ok: true };
}
