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

type Props = {
  // Where Supabase should land the browser after a *social* sign-up
  // (email/password sign-up always stops at /verify-email while "Confirm
  // email" is on - there's no session yet to redirect anywhere). Used by
  // the client sign-up flow to land on the finalize endpoint that assigns
  // the 'client' role. Defaults to /signing-up.
  afterSocialSignUp?: string;
};

export function SignUpForm({ afterSocialSignUp = "/signing-up" }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"password" | "google" | "github" | null>(
    null,
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName) {
      setError("Enter your name.");
      return;
    }
    if (!looksLikeEmail(trimmedEmail)) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 10) {
      setError("Password must be at least 10 characters.");
      return;
    }

    setBusy("password");
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: { name: trimmedName },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/signing-in`,
      },
    });
    setBusy(null);

    if (signUpError) {
      // Logged so the actual Supabase error code/message is visible in
      // DevTools - the on-screen copy below is deliberately generic for
      // most cases, but we don't want to debug blind.
      console.error("supabase signUp error:", signUpError.code, signUpError.message, signUpError);
      setError(
        signUpError.code === "user_already_exists"
          ? "An account with that email already exists."
          : signUpError.code === "weak_password"
            ? `Password too weak: ${signUpError.message}`
            : signUpError.code === "signup_disabled" || signUpError.code === "email_provider_disabled"
              ? "Sign-ups are currently disabled for this project - check Authentication → Providers in Supabase."
              : signUpError.code === "over_email_send_rate_limit"
                ? "Too many attempts - wait a minute and try again."
                : `Couldn't create your account (${signUpError.code ?? signUpError.status ?? "unknown error"}). Check the browser console for details.`,
      );
      return;
    }

    // With "Confirm email" on (Session A dashboard setting), signUp()
    // returns a user but no session until the emailed link is clicked.
    if (!data.session) {
      router.push(`/verify-email?email=${encodeURIComponent(trimmedEmail)}`);
      return;
    }

    router.push("/signing-up");
  }

  async function handleSocial(provider: "google" | "github") {
    setError(null);
    setBusy(provider);
    const { error: socialError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(afterSocialSignUp)}`,
      },
    });
    if (socialError) {
      setBusy(null);
      setError(`Couldn't start ${provider === "google" ? "Google" : "GitHub"} sign-up.`);
    }
  }

  return (
    <div className={authCardCls}>
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Set up milestones, invoices, and change requests in one place.
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

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="name" className={authLabelCls}>
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={authInputCls}
          />
        </div>
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
          <label htmlFor="password" className={authLabelCls}>
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={10}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={authInputCls}
          />
          <p className="text-xs text-muted-foreground">At least 10 characters.</p>
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
          Create account
        </button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link href="/sign-in" className={cn("rounded text-primary hover:underline", focusRing)}>
          Sign in
        </Link>
      </p>
    </div>
  );
}
