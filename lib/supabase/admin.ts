import { createClient } from "@supabase/supabase-js";

// Server-only Supabase client authenticated with the project's secret key,
// used for Auth admin calls the signed-in user can't make for themselves
// (deleting their own login). The secret key bypasses every access rule, so
// this module must never be imported from a Client Component. It isn't a
// NEXT_PUBLIC_ var, so Next never inlines it into the browser bundle.
function createAdminClient() {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Deletes the Supabase Auth login (auth.users plus its sessions and
// identities). Throws if the secret key isn't configured or the call fails,
// so account deletion can stop before touching any app data. A 404 means the
// login is already gone (e.g. a retry after a partial failure) and counts as
// success.
export async function deleteAuthUser(userId: string): Promise<void> {
  const admin = createAdminClient();
  if (!admin) throw new Error("SUPABASE_SECRET_KEY is not set");

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error && error.status !== 404) throw error;
}
