import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { logSecurityEvent } from "@/lib/security-log";

// ADMIN_USER_IDS is the source of truth for operator access. Middleware
// gates /admin routes with the same allowlist; this helper is the
// secondary guard used inside server components, server actions, and
// admin API routes so a middleware bypass (config drift, matcher change,
// edge cache anomaly) can't expose admin data.

function parseAdminIds(): Set<string> {
  const raw = process.env.ADMIN_USER_IDS ?? "";
  return new Set(
    raw
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean),
  );
}

export function isAdminUserId(userId: string | null | undefined): boolean {
  if (!userId) return false;
  return parseAdminIds().has(userId);
}

// Use at the top of every admin server component, server action, and
// route handler. Redirects signed-out users to sign-in and non-admin
// signed-in users to /dashboard, logging the denied attempt.
export async function requireAdmin(route: string): Promise<string> {
  const user = await getSessionUser();
  const userId = user?.id ?? null;
  if (!userId) redirect("/sign-in");
  if (!isAdminUserId(userId)) {
    logSecurityEvent({
      event: "admin_access_denied",
      route,
      outcome: "denied",
      reason: "userid_not_in_allowlist",
    });
    redirect("/dashboard");
  }
  return userId;
}
