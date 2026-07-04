"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/auth-client";
import { cn, focusRing } from "@/lib/utils";
import {
  authCardCls,
  authInputCls,
  authLabelCls,
  authPrimaryButtonCls,
  authSecondaryButtonCls,
  looksLikeEmail,
} from "./shared";

// Supabase's browser client (via @supabase/ssr's createBrowserClient) persists
// the session in both localStorage and cookies by default, so there's no
// separate "remember me" toggle the way Better Auth exposed one - every
// sign-in is persistent until the user signs out.
const AFTER_SIGN_IN = "/signing-in";

type Mode = "password" | "magic-link";

type Props = {
  // Set from the `?error=` query param when the browser lands back here
  // after a failed magic-link verification.
  initialError?: string;
};

export function SignInForm({ initialError }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    initialError ? "That link is invalid or has expired." : null,
  );
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [busy, setBusy] = useState<"password" | "magic-link" | "google" | "github" | null>(
    null,
  );

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const trimmedEmail = email.trim();
    if (!looksLikeEmail(trimmedEmail)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Enter your password.");
      return;
    }
    setBusy("password");
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });
    if (signInError) {
      setBusy(null);
      setError(
        signInError.code === "email_not_confirmed"
          ? "Verify your email before signing in - check your inbox for the link."
          : "That email and password combination doesn't match.",
      );
      return;
    }

    // A verified TOTP factor bumps the required assurance level to aal2 -
    // this session is real but incomplete until the challenge is passed.
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal && aal.nextLevel === "aal2" && aal.currentLevel !== "aal2") {
      router.push("/sign-in/two-factor");
      return;
    }

    void data;
    router.push(AFTER_SIGN_IN);
  }

  async function handleMagicLinkSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const trimmedEmail = email.trim();
    if (!looksLikeEmail(trimmedEmail)) {
      setError("Enter a valid email address.");
      return;
    }
    setBusy("magic-link");
    const { error: magicLinkError } = await supabase.auth.signInWithOtp({
      email: trimmedEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${AFTER_SIGN_IN}`,
      },
    });
    setBusy(null);
    if (magicLinkError) {
      setError("Couldn't send that link. Try again in a moment.");
      return;
    }
    setMagicLinkSent(true);
  }

  async function handleSocial(provider: "google" | "github") {
    setError(null);
    setBusy(provider);
    const { error: socialError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${AFTER_SIGN_IN}`,
      },
    });
    if (socialError) {
      setBusy(null);
      setError(`Couldn't start ${provider === "google" ? "Google" : "GitHub"} sign-in.`);
    }
  }

  if (mode === "magic-link" && magicLinkSent) {
    return (
      <div className={authCardCls}>
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            Check your inbox
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            We sent a sign-in link to{" "}
            <span className="text-foreground">{email.trim()}</span>. Click it
            to continue - it only works once.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setMagicLinkSent(false);
            setMode("password");
          }}
          className={cn(authSecondaryButtonCls, focusRing)}
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div className={authCardCls}>
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          Sign in
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back. Sign in to manage your clients and projects.
        </p>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => handleSocial("google")}
          className={cn(authSecondaryButtonCls, focusRing)}
        >
          {busy === "google" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          Continue with Google
        </button>
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => handleSocial("github")}
          className={cn(authSecondaryButtonCls, focusRing)}
        >
          {busy === "github" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          Continue with GitHub
        </button>
      </div>

      <div className="flex items-center gap-3" aria-hidden>
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs uppercase tracking-wide text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {mode === "password" ? (
        <form onSubmit={handlePasswordSubmit} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className={authLabelCls}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={authInputCls}
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className={authLabelCls}>
                Password
              </label>
              <Link
                href="/forgot-password"
                className={cn("rounded text-xs text-primary hover:underline", focusRing)}
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={authInputCls}
            />
          </div>

          {error && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy !== null}
            className={cn(authPrimaryButtonCls, focusRing)}
          >
            {busy === "password" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            Sign in
          </button>

          <button
            type="button"
            onClick={() => {
              setError(null);
              setMode("magic-link");
            }}
            className={cn(
              "w-full rounded text-center text-sm text-primary hover:underline",
              focusRing,
            )}
          >
            Email me a sign-in link instead
          </button>
        </form>
      ) : (
        <form onSubmit={handleMagicLinkSubmit} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="magic-email" className={authLabelCls}>
              Email
            </label>
            <input
              id="magic-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={authInputCls}
            />
          </div>

          {error && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy !== null}
            className={cn(authPrimaryButtonCls, focusRing)}
          >
            {busy === "magic-link" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            Send sign-in link
          </button>

          <button
            type="button"
            onClick={() => {
              setError(null);
              setMode("password");
            }}
            className={cn(
              "w-full rounded text-center text-sm text-primary hover:underline",
              focusRing,
            )}
          >
            Use a password instead
          </button>
        </form>
      )}

      <p className="text-center text-xs text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className={cn("rounded text-primary hover:underline", focusRing)}>
          Sign up
        </Link>
      </p>
    </div>
  );
}
