import { createBrowserClient } from "@supabase/ssr";

// Browser-side Supabase client for use in Client Components (sign-in/sign-up
// forms, 2FA enrollment, etc.). Mirrors the pattern already used by
// lib/auth-client.ts for Better Auth — one singleton factory, imported
// wherever a form needs to call supabase.auth.*.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
