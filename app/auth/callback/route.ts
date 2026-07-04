import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Single landing point for every Supabase email link (sign-up confirmation,
// password reset, magic link) and every OAuth redirect. @supabase/ssr's
// cookie-based session storage uses the PKCE flow, which hands back a
// `?code=` query param rather than a URL hash fragment — the fragment-based
// implicit flow some older Supabase docs show doesn't work server-side,
// since fragments never reach the server. Exchanging the code here is what
// actually writes the session cookie; every emailRedirectTo/redirectTo in
// the auth components points here first, with `next` carrying the eventual
// destination.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  const url = new URL("/sign-in", origin);
  url.searchParams.set("error", "auth_callback_failed");
  return NextResponse.redirect(url);
}
