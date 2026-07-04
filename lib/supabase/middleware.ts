import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";

// Session-refresh helper for the root middleware.ts. Supabase's standard
// Next.js App Router pattern: read the session cookie, and if Supabase
// rotates it, write the new one onto both the outgoing request (so this
// same middleware pass sees it) and the response (so the browser gets it).
//
// Also returns the revalidated `user` (or null) so middleware.ts can gate
// routes on real auth state instead of an unvalidated cookie-presence check.
export async function updateSession(
  request: NextRequest,
): Promise<{ response: NextResponse; user: User | null }> {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Revalidates the session against Supabase Auth on every request — do not
  // remove this call or swap it for a cookie-only check. lib/auth.ts's
  // requireUser()/getSessionUser() do the same re-validation again
  // server-side, but the middleware gate needs its own check to redirect
  // before a protected page even starts rendering.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response: supabaseResponse, user };
}
