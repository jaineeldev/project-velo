"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

// Supabase's `mfa.enroll()` returns the QR code as a ready-to-render SVG
// data URI (`data.totp.qr_code`) — no client-side QR generation library
// needed the way Better Auth's raw `totpURI` required one.
//
// Supabase has no built-in backup-code mechanism for TOTP factors (unlike
// Better Auth), and no password re-confirmation step around enroll/unenroll
// — both are dropped here rather than faked. See two-factor-form.tsx for the
// matching note on the sign-in side.
type Step =
  | { kind: "idle" }
  | { kind: "verify"; factorId: string; qrDataUrl: string };

const inputCls =
  "h-10 w-full max-w-xs rounded-md border border-input bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60";

const primaryBtnCls = buttonVariants({ variant: "primary" });
const secondaryBtnCls = buttonVariants({ variant: "secondary" });
const destructiveBtnCls = buttonVariants({ variant: "destructive" });

type Props = {
  initialEnabled: boolean;
  // Present only when initialEnabled is true — needed to unenroll.
  initialFactorId: string | null;
};

export function TwoFactorSettings({ initialEnabled, initialFactorId }: Props) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [factorId, setFactorId] = useState(initialFactorId);
  const [step, setStep] = useState<Step>({ kind: "idle" });
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function startEnroll() {
    setError(null);
    setBusy(true);
    const { data, error: enrollError } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "Authenticator app",
    });
    setBusy(false);
    if (enrollError || !data) {
      setError("Couldn't start setup. Try again in a moment.");
      return;
    }
    setStep({
      kind: "verify",
      factorId: data.id,
      qrDataUrl: data.totp.qr_code,
    });
  }

  async function confirmEnroll(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (step.kind !== "verify") return;
    setError(null);
    const trimmedCode = code.trim();
    if (!trimmedCode) {
      setError("Enter the code from your authenticator app.");
      return;
    }
    setBusy(true);
    const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
      factorId: step.factorId,
      code: trimmedCode,
    });
    setBusy(false);
    if (verifyError) {
      setError("That code isn't valid. Check the time on your device and try again.");
      return;
    }
    setCode("");
    setEnabled(true);
    setFactorId(step.factorId);
    setStep({ kind: "idle" });
  }

  async function handleDisable() {
    if (!factorId) return;
    setError(null);
    setBusy(true);
    const { error: unenrollError } = await supabase.auth.mfa.unenroll({
      factorId,
    });
    setBusy(false);
    if (unenrollError) {
      setError("Couldn't disable two-factor authentication. Try again in a moment.");
      return;
    }
    setEnabled(false);
    setFactorId(null);
  }

  function cancelEnroll() {
    // Best-effort cleanup: an unconfirmed factor left behind is harmless
    // (it never becomes `verified`, so it's never checked at sign-in), but
    // removing it keeps the account's factor list tidy.
    if (step.kind === "verify") {
      void supabase.auth.mfa.unenroll({ factorId: step.factorId });
    }
    setStep({ kind: "idle" });
    setError(null);
    setCode("");
  }

  if (step.kind === "verify") {
    return (
      <div className="mt-4 space-y-4 rounded-xl border border-border bg-card p-5">
        <div>
          <p className="text-sm font-medium text-foreground">Scan this QR code</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Use an authenticator app (1Password, Authy, Google Authenticator) to scan
            the code, then enter the 6-digit code it shows.
          </p>
        </div>

        <Image
          src={step.qrDataUrl}
          alt="Two-factor authentication QR code"
          width={200}
          height={200}
          unoptimized
          className="rounded-md border border-border bg-white"
        />

        <form onSubmit={confirmEnroll} className="space-y-3">
          <div className="space-y-1.5">
            <label htmlFor="totp-code" className="block text-sm font-medium text-foreground">
              Verification code
            </label>
            <input
              id="totp-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={inputCls}
            />
          </div>

          {error && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy}
              className={primaryBtnCls}
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              Confirm & enable
            </button>
            <button
              type="button"
              onClick={cancelEnroll}
              disabled={busy}
              className={secondaryBtnCls}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-5">
      <div className="flex items-start gap-3">
        <ShieldCheck
          aria-hidden
          className={cn("mt-0.5 h-5 w-5 shrink-0", enabled ? "text-primary" : "text-muted-foreground")}
        />
        <div className="text-sm">
          <p className="font-medium text-foreground">
            {enabled ? "Two-factor authentication is on" : "Two-factor authentication is off"}
          </p>
          <p className="mt-1 text-muted-foreground">
            {enabled
              ? "Sign-ins require a code from your authenticator app."
              : "Add an authenticator app for an extra layer of protection."}
          </p>
          {error && (
            <p role="alert" className="mt-1 font-medium text-destructive">
              {error}
            </p>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={() => (enabled ? handleDisable() : startEnroll())}
        disabled={busy}
        className={cn(enabled ? destructiveBtnCls : primaryBtnCls, "shrink-0")}
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        {enabled ? "Disable" : "Enable"}
      </button>
    </div>
  );
}
