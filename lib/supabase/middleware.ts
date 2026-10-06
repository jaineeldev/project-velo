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
  //
  // Capped at AUTH_TIMEOUT_MS: if Supabase is unreachable (e.g. the project
  // was paused), getUser() retries until Vercel kills the middleware at 25s
  // and every route 504s, public pages included. On timeout we treat the
  // visitor as signed out, so protected routes redirect to /sign-in and
  // public pages still render.
  let timer: ReturnType<typeof setTimeout> | undefined;
  const user = await Promise.race([
    supabase.auth
      .getUser()
      .then(({ data }) => data.user)
      .catch(() => null),
    new Promise<null>((resolve) => {
      timer = setTimeout(() => {
        console.error(
          `[middleware] supabase.auth.getUser() exceeded ${AUTH_TIMEOUT_MS}ms; treating request as signed out`,
        );
        resolve(null);
      }, AUTH_TIMEOUT_MS);
    }),
  ]).finally(() => clearTimeout(timer));

  return { response: supabaseResponse, user };
}

const AUTH_TIMEOUT_MS = 3_000;
