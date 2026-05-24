import { NextResponse, type NextRequest } from "next/server";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { logSecurityEvent } from "@/lib/security-log";

// Post-signup hop from /sign-up/client. Clerk forces the browser here on
// successful account creation. We:
//   1. Confirm the visitor is signed in (getOrCreateUser → /sign-in if not).
//   2. Re-validate the proposal token. This is the load-bearing security
//      check — without it, any signed-in user could promote themselves to
//      the 'client' role by hand-crafting this URL.
//   3. Upsert user_profiles.role='client'. UPSERT covers the race where
//      the user.created webhook hasn't fired yet, so the profile row may
//      not exist when we get here.
//   4. Mirror role into Clerk publicMetadata so middleware/route guards
//      can read it cheaply. The DB row is the source of truth; this is a
//      cache that the user.updated webhook keeps in sync if it drifts.
//   5. Redirect to the share page the visitor came from.

const TOKEN_RE = /^[0-9a-f]{64}$/;

export async function GET(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const limit = checkRateLimit(`signup:client:finalize:${ip}`, 20, 60_000);
  if (!limit.ok) {
    return new NextResponse("Too many requests", {
      status: 429,
      headers: { "Retry-After": String(limit.retryAfterSeconds) },
    });
  }

  // Existing-account guard. If a signed-in agency user lands here via a
  // saved or shared URL, refuse to touch their role. We read from Clerk
  // (publicMetadata.role) rather than the DB because user_profiles.role
  // defaults to 'agency' for *every* new account before finalize runs,
  // so a DB check would false-positive a brand-new client whose
  // user.created webhook beat us to inserting the profile row.
  //
  // Note: this catches an agency user only if their publicMetadata.role
  // is explicitly 'agency'. The current agency sign-up flow at /sign-up
  // doesn't write publicMetadata, so today this check is a no-op for
  // every existing agency account. Follow-up: stamp role='agency' on
  // agency sign-up so this guard becomes load-bearing.
  const clerkUser = await currentUser();
  if (
    (clerkUser?.publicMetadata as { role?: string } | undefined)?.role ===
    "agency"
  ) {
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

  // Will redirect to /sign-in if the visitor isn't authenticated. Also
  // ensures the users row exists, short-circuiting the race with the
  // user.created webhook.
  const user = await getOrCreateUser();

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

  // Merge into existing publicMetadata so we don't clobber unrelated keys
  // someone might add to Clerk later. `clerkUser` from the guard above
  // already has the up-to-date publicMetadata so we reuse it.
  const clerk = await clerkClient();
  await clerk.users.updateUser(user.clerk_id, {
    publicMetadata: { ...(clerkUser?.publicMetadata ?? {}), role: "client" },
  });

  // Hop through the client-side reload page rather than redirecting
  // straight to /share/proposal. The reload page calls session.reload()
  // in the browser, which is what actually rewrites the __session
  // cookie with a JWT carrying the new role='client' claim. Without
  // this hop, the browser keeps the pre-finalize cookie for ~60s
  // (Clerk's default token-refresh cadence) and the middleware's role
  // check on /dashboard is a no-op for that window — long enough for a
  // new client to fall through to the agency onboarding flow.
  const next = encodeURIComponent(`/share/proposal/${token}`);
  return NextResponse.redirect(
    new URL(`/sign-up/client/reload?next=${next}`, req.url),
  );
}
