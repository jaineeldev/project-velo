import { NextResponse, type NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { logSecurityEvent } from "@/lib/security-log";

// Post-signup hop from /sign-up/client. Both sign-up paths land here via
// /auth/callback: the emailed confirmation link, and Google/GitHub. We:
//   1. Re-validate the proposal token. This is the load-bearing security
//      check — without it, any signed-in user could switch themselves to
//      the 'client' role by hand-crafting this URL.
//   2. Confirm the visitor is signed in (requireUser → /sign-in if not).
//   3. Refuse to touch an existing agency account. user_profiles.role
//      defaults to 'agency', but a brand-new sign-up has no profile row
//      yet, and the dashboard won't let an agency in until onboarding
//      stamps onboarded_at. So an onboarded agency row means a real agency
//      account that a saved or shared link must not convert.
//   4. Upsert user_profiles.role='client'.
//   5. Redirect to the proposal they came from.

const TOKEN_RE = /^[0-9a-f]{64}$/;

export async function GET(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const limit = await checkRateLimit(`signup:client:finalize:${ip}`, 20, 60_000);
  if (!limit.ok) {
    return new NextResponse("Too many requests", {
      status: 429,
      headers: { "Retry-After": String(limit.retryAfterSeconds) },
    });
  }

  const token = req.nextUrl.searchParams.get("proposal");
  if (!token || !TOKEN_RE.test(token)) {
    logSecurityEvent({
      event: "client_role_finalize_invalid",
      route: "api/sign-up/client/finalize",
      ip,
      outcome: "denied",
      reason: "token_format",
    });
    return NextResponse.redirect(new URL("/", req.url));
  }

  const user = await requireUser();

  const profileRows = await sql`
    SELECT role, onboarded_at FROM user_profiles WHERE user_id = ${user.id}
  `;
  const profile = profileRows[0] as
    | { role: string; onboarded_at: string | null }
    | undefined;
  if (profile?.role === "agency" && profile.onboarded_at) {
    logSecurityEvent({
      event: "client_role_finalize_invalid",
      route: "api/sign-up/client/finalize",
      ip,
      outcome: "denied",
      reason: "agency_account",
    });
    return new NextResponse(
      "This link is for new client accounts only.",
      { status: 403, headers: { "Content-Type": "text/plain" } },
    );
  }

  const proposalRows = await sql`
    SELECT 1 FROM proposals
    WHERE share_token = ${token} AND status <> 'draft'
    LIMIT 1
  `;
  if (proposalRows.length === 0) {
    logSecurityEvent({
      event: "client_role_finalize_invalid",
      route: "api/sign-up/client/finalize",
      ip,
      outcome: "denied",
      reason: "token_not_found",
    });
    return NextResponse.redirect(new URL("/", req.url));
  }

  await sql`
    INSERT INTO user_profiles (user_id, role)
    VALUES (${user.id}, 'client')
    ON CONFLICT (user_id) DO UPDATE
      SET role = 'client', updated_at = now()
  `;

  return NextResponse.redirect(new URL(`/share/proposal/${token}`, req.url));
}
