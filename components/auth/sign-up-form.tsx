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
import { AuthDivider, AuthHeader } from "./chrome";

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
  // Consent gate — required to enable any sign-up action (email/password
  // and social OAuth alike). Kept as component state (not sessionStorage)
  // so the checkbox stays visible next to every submit button and every
  // sign-up action re-affirms the agreement.
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"password" | "google" | "github" | null>(
    null,
  );

  const disabled = busy !== null || !agreed;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!agreed) {
      setError("Agree to the Terms of Service and Privacy Policy to continue.");
      return;
    }
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
    if (!agreed) {
      setError("Agree to the Terms of Service and Privacy Policy to continue.");
      return;
    }
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
      <AuthHeader
        eyebrow="Get started"
        title="Create your account"
        description="Milestones, invoices, and change requests in one place."
      />

      <div className="space-y-3">
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleSocial("google")}
          className={authSecondaryButtonCls}
        >
          {busy === "google" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          Continue with Google
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleSocial("github")}
          className={authSecondaryButtonCls}
        >
          {busy === "github" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          Continue with GitHub
        </button>
        {!agreed ? (
          <p
            aria-hidden
            className="text-center font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
          >
            Agree to terms below to enable &darr;
          </p>
        ) : null}
      </div>

      <AuthDivider />

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

        <label className="flex items-start gap-3 rounded-md border border-border bg-background/50 p-3 text-sm text-foreground">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            aria-describedby="consent-text"
            className={cn(
              "mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-border text-primary",
              focusRing,
            )}
          />
          <span id="consent-text" className="leading-relaxed">
            I have read and agree to Velo&apos;s{" "}
            <Link
              href="/terms"
              target="_blank"
              className={cn(
                "rounded-sm font-medium text-primary hover:underline",
                focusRing,
              )}
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              target="_blank"
              className={cn(
                "rounded-sm font-medium text-primary hover:underline",
                focusRing,
              )}
            >
              Privacy Policy
            </Link>
            .
          </span>
        </label>

        {error && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={disabled}
          className={authPrimaryButtonCls}
        >
          {busy === "password" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          Create account
        </button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className={cn(
            "rounded-sm font-medium text-primary hover:underline",
            focusRing,
          )}
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
