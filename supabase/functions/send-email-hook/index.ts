// Supabase "Send Email" Auth Hook. Deno Edge Function — deployed with
// `supabase functions deploy send-email-hook --no-verify-jwt` and wired in
// via Authentication → Hooks → Send Email hook in the Supabase dashboard
// (see CLAUDE.md §13.2 Session C for the exact dashboard steps).
//
// This function does NOT send the email itself. It verifies Supabase's
// webhook signature, builds the confirmation URL Supabase expects
// (https://supabase.com/docs/guides/auth/auth-hooks/send-email-hook), and
// forwards { to, type, url } to the Next.js app's
// app/api/auth/send-email/route.ts, which reuses the existing
// Resend-based sendAuth*Email functions in lib/email.tsx — that's where the
// actual copy/branding lives, so it isn't duplicated here in Deno.
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

// Secret from Auth Hooks → Send Email hook → "Generate Secret" in the
// Supabase dashboard. Comes prefixed "v1,whsec_..."; the Webhook verifier
// wants the raw base64 secret with that prefix stripped.
const hookSecret = (Deno.env.get("SEND_EMAIL_HOOK_SECRET") as string).replace(
  "v1,whsec_",
  "",
);

// Shared secret this function must also send to the Next.js bridge route,
// so a leaked Supabase hook URL alone can't be replayed against the app.
const bridgeSecret = Deno.env.get("AUTH_EMAIL_BRIDGE_SECRET") as string;
const bridgeUrl = Deno.env.get("AUTH_EMAIL_BRIDGE_URL") as string; // e.g. https://project-velo.vercel.app/api/auth/send-email

type HookPayload = {
  user: { email: string };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
  };
};

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("not allowed", { status: 400 });
  }

  const payload = await req.text();
  const headers = Object.fromEntries(req.headers);
  const wh = new Webhook(hookSecret);

  let data: HookPayload;
  try {
    data = wh.verify(payload, headers) as HookPayload;
  } catch (err) {
    console.log("send-email-hook: signature verification failed", err);
    return new Response(
      JSON.stringify({ error: { http_code: 401, message: "invalid signature" } }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }

  const { user, email_data } = data;
  const { token_hash, redirect_to, email_action_type } = email_data;

  // Standard Supabase GoTrue verify link: hitting this validates the
  // token_hash, then redirects to `redirect_to` with a `?code=` param that
  // app/auth/callback/route.ts exchanges for a real session via
  // exchangeCodeForSession(). `redirect_to` itself is set per-flow by the
  // auth components (e.g. `${origin}/auth/callback?next=/reset-password`).
  //
  // Deliberately built from SUPABASE_URL (auto-injected into every Edge
  // Function), not email_data.site_url: site_url already comes back as
  // `${SUPABASE_URL}/auth/v1`, so appending "/auth/v1/verify" to it produced
  // a doubled "/auth/v1/auth/v1/verify" path that Kong doesn't recognize as
  // the no-auth verify route, causing "No API key found in request".
  const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
  const confirmationUrl = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${encodeURIComponent(redirect_to)}`;

  try {
    const res = await fetch(bridgeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-email-secret": bridgeSecret,
      },
      body: JSON.stringify({
        to: user.email,
        type: email_action_type,
        url: confirmationUrl,
      }),
    });
    if (!res.ok) {
      throw new Error(`bridge responded ${res.status}`);
    }
  } catch (err) {
    console.log("send-email-hook: bridge call failed", err);
    return new Response(
      JSON.stringify({ error: { http_code: 500, message: "email send failed" } }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  return new Response(JSON.stringify({}), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
