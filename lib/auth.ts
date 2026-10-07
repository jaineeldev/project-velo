import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sql } from "@/lib/db";

export type AppUser = {
  id: string;
  email: string;
  name: string;
  // An operator has suspended this account (user_profiles.suspended_at).
  // requireUser() turns these users away; getSessionUser() still returns
  // them so public pages can tell who's looking.
  suspended: boolean;
};

// Dedupe within a single render tree — a dashboard request typically hits
// this from the layout, the page, and any server action helpers.
//
// `supabase.auth.getUser()` (not `getSession()`) is used deliberately: it
// re-validates the JWT against the Supabase Auth server on every call
// instead of trusting whatever's sitting in the cookie, which matters
// server-side since the cookie itself isn't a trusted source of truth.
//
// public.users.id is always identical to auth.users.id — there's no
// separate mapping table. Every other table's user_id FK points at
// public.users.id, so the first time we see a given Supabase identity we
// create the matching row; every request after that is a plain SELECT.
export const getSessionUser = cache(async (): Promise<AppUser | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // MFA enforcement. A password/social sign-in on an account with a
  // verified TOTP factor produces a session at `aal1` with `nextLevel`
  // reporting `aal2` until the two-factor challenge is completed. Treat
  // that as "not fully signed in" — otherwise a visitor who has the right
  // password but hasn't passed the second factor would sail straight
  // through to protected pages. `requireUser()` below re-checks the raw
  // session to route this case to the two-factor challenge instead of the
  // generic sign-in page.
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal && aal.nextLevel === "aal2" && aal.currentLevel !== "aal2") {
    return null;
  }

  const existing = await sql`
    SELECT u.id, u.email, u.name, (up.suspended_at IS NOT NULL) AS suspended
    FROM users u
    LEFT JOIN user_profiles up ON up.user_id = u.id
    WHERE u.id = ${user.id}
    LIMIT 1
  `;
  if (existing.length > 0) {
    return existing[0] as unknown as AppUser;
  }

  const email = user.email ?? "";
  const name =
    (user.user_metadata?.name as string | undefined) ??
    (user.user_metadata?.full_name as string | undefined) ??
    "";
  const emailVerified = user.email_confirmed_at != null;

  // ON CONFLICT guards a race between two concurrent first-requests (e.g. two
  // tabs) — whichever loses just reads back the row the winner inserted.
  const inserted = await sql`
    INSERT INTO users (id, email, name, email_verified)
    VALUES (${user.id}, ${email}, ${name}, ${emailVerified})
    ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email
    RETURNING id, email, name, false AS suspended
  `;
  return inserted[0] as unknown as AppUser;
});

// Every server action and protected route handler goes through here, so
// this is where suspension is enforced. The layouts' own redirect only
// covers page loads; without this check a suspended account could still
// call actions directly (send proposals, post comments, and so on).
export const requireUser = async (): Promise<AppUser> => {
  const user = await getSessionUser();
  if (user) {
    if (user.suspended) redirect("/suspended");
    return user;
  }

  // getSessionUser() returns null both for "no session" and for "signed in
  // but the MFA challenge isn't complete yet" — distinguish them here so the
  // second case lands on the challenge form instead of back at square one.
  const supabase = await createClient();
  const {
    data: { user: rawUser },
  } = await supabase.auth.getUser();
  if (rawUser) redirect("/sign-in/two-factor");
  redirect("/sign-in");
};

// Alias kept so the ~30 existing call sites don't churn. The name dates from
// the Clerk era, when this also provisioned the users row; requireUser()
// does that now.
export const getOrCreateUser = requireUser;
