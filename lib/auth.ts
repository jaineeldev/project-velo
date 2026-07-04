import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sql } from "@/lib/db";

export type AppUser = {
  id: string;
  email: string;
  name: string;
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
    SELECT id, email, name FROM users WHERE id = ${user.id} LIMIT 1
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
    RETURNING id, email, name
  `;
  return inserted[0] as unknown as AppUser;
});

export const requireUser = async (): Promise<AppUser> => {
  const user = await getSessionUser();
  if (user) return user;

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

// TEMPORARY SHIM — kept only so the ~30 existing call sites (Session D scope,
// see CLAUDE.md §13.2) keep compiling and working during the cutover.
// `clerk_id` is a stub; any consumer that still reaches into it to call the
// Clerk SDK directly (account-deletion, name-change) is already non-functional
// today regardless of this shim, since Clerk isn't the live auth provider —
// Session E rewires those call sites onto `supabase.auth.admin.*`. Session D
// removes this shim in favor of calling `requireUser()` directly everywhere.
export type LegacyAppUser = AppUser & { clerk_id: string };

export const getOrCreateUser = async (): Promise<LegacyAppUser> => {
  const user = await requireUser();
  return { ...user, clerk_id: "" };
};
