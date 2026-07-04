"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/auth-client";
import { cn, focusRing } from "@/lib/utils";
import {
  authCardCls,
  authInputCls,
  authLabelCls,
  authPrimaryButtonCls,
} from "./shared";

// Reached when lib/auth.ts's requireUser() detects a session sitting at
// aal1 with a verified TOTP factor still pending (see sign-in-form.tsx's
// post-sign-in AAL check, and lib/auth.ts's getSessionUser()). Unlike
// Better Auth, Supabase has no built-in backup-code mechanism for TOTP
// factors — that option is dropped here rather than faked. If losing
// authenticator access needs a documented recovery path later, that would
// be a custom feature (e.g. our own one-time-code table), not something
// Supabase Auth provides out of the box.
const AFTER_VERIFY = "/signing-in";

export function TwoFactorForm() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const trimmedCode = code.trim();
    if (!trimmedCode) {
      setError("Enter your code.");
      return;
    }
    setBusy(true);

    const { data: factors, error: factorsError } =
      await supabase.auth.mfa.listFactors();
    const factorId = factors?.totp[0]?.id;
    if (factorsError || !factorId) {
      setBusy(false);
      setError("Couldn't find your authenticator. Try signing in again.");
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code: trimmedCode,
    });
    setBusy(false);
    if (verifyError) {
      setError("That code isn't valid. Check the time on your device and try again.");
      return;
    }
    window.location.href = AFTER_VERIFY;
  }

  return (
    <div className={authCardCls}>
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          Two-factor verification
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter the 6-digit code from your authenticator app.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="code" className={authLabelCls}>
            Verification code
          </label>
          <input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
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
          className={cn(authPrimaryButtonCls, focusRing)}
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          Verify
        </button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        <Link href="/sign-in" className={cn("rounded text-primary hover:underline", focusRing)}>
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
