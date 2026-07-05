"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/auth-client";
import {
  authCardCls,
  authInputCls,
  authLabelCls,
  authPrimaryButtonCls,
} from "./shared";
import { AuthHeader } from "./chrome";

// Unlike Better Auth (which handed this page a `?token=` to submit alongside
// the new password), Supabase's recovery flow already exchanged the emailed
// code for a real session in app/auth/callback/route.ts before the browser
// ever gets here — `supabase.auth.updateUser()` just needs that session to
// exist. So this component's job is: confirm a session is present, and if
// not, show the same "link expired" state the old token-based version did.
export function ResetPasswordForm() {
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setHasSession(Boolean(data.session));
      setChecking(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (checking) {
    return <div className={authCardCls} aria-hidden />;
  }

  if (!hasSession) {
    return (
      <div className={authCardCls}>
        <AuthHeader
          eyebrow="Reset password"
          title="Link expired"
          description="That reset link is invalid or has expired. Request a new one to continue."
        />
        <Link href="/forgot-password" className={authPrimaryButtonCls}>
          Request a new link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className={authCardCls}>
        <AuthHeader
          eyebrow="All set"
          title="Password updated"
          description="Your password has been reset. Sign in with your new password."
        />
        <Link href="/sign-in" className={authPrimaryButtonCls}>
          Go to sign in
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (password.length < 10) {
      setError("Password must be at least 10 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setBusy(true);
    const { error: resetError } = await supabase.auth.updateUser({
      password,
    });
    setBusy(false);
    if (resetError) {
      setError("Couldn't reset your password. The link may have expired — request a new one.");
      return;
    }
    setDone(true);
  }

  return (
    <div className={authCardCls}>
      <AuthHeader
        eyebrow="New password"
        title="Set a new password"
        description="Choose a new password for your account."
      />

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="password" className={authLabelCls}>
            New password
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
        <div className="space-y-1.5">
          <label htmlFor="confirm-password" className={authLabelCls}>
            Confirm password
          </label>
          <input
            id="confirm-password"
            name="confirm-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={10}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
          disabled={busy}
          className={authPrimaryButtonCls}
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          Reset password
        </button>
      </form>
    </div>
  );
}
