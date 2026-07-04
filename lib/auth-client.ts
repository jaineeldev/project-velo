import { createClient } from "@/lib/supabase/client";

// Single browser-side Supabase client instance, imported by every auth form
// component. Unlike Better Auth's `authClient` (which assembled a bespoke
// API surface from plugins - signIn.email, signIn.magicLink, twoFactor.*,
// requestPasswordReset, etc.), Supabase's client already exposes every auth
// method directly on `.auth`: `signInWithPassword`, `signUp`,
// `signInWithOAuth`, `signInWithOtp` (magic link), `resetPasswordForEmail`,
// `updateUser` (password reset completion + name/email changes), `resend`
// (re-send verification), and the `.mfa.*` namespace for TOTP enrollment
// and challenge/verify. Components call `supabase.auth.*` directly rather
// than through a wrapper.
export const supabase = createClient();
