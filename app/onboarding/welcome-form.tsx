"use client";

import { useState, useTransition } from "react";
import {
  ArrowRight,
  FileText,
  FolderKanban,
  Receipt,
  type LucideIcon,
} from "lucide-react";
import { cn, focusRing } from "@/lib/utils";
import { AU_STATES } from "@/lib/validation";
import { Card, CardContent } from "@/components/ui/card";
import { completeOnboarding, skipOnboarding } from "./actions";

const FEATURES: Array<{
  icon: LucideIcon;
  title: string;
  description: string;
}> = [
  {
    icon: FileText,
    title: "Proposals",
    description:
      "Send professional proposals and get client approval automatically",
  },
  {
    icon: FolderKanban,
    title: "Projects",
    description:
      "Track milestones, log time, and keep clients updated with a live portal",
  },
  {
    icon: Receipt,
    title: "Invoices",
    description: "Generate invoices automatically and track payments",
  },
];

const inputClass = cn(
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-ring disabled:opacity-50",
  focusRing,
);

const labelClass =
  "block text-xs font-medium uppercase tracking-wider text-muted-foreground";

const helperClass = "mt-1.5 text-xs text-muted-foreground";

// Shared progress indicator. Two segments, the current step uses bg-primary,
// future steps stay bg-muted. Pill height + rounded keeps it compact above
// the heading without competing for attention.
function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-3" aria-hidden>
      <div className="flex gap-1.5">
        <span
          className={cn(
            "h-1.5 w-10 rounded-full transition-colors",
            step >= 1 ? "bg-primary" : "bg-muted",
          )}
        />
        <span
          className={cn(
            "h-1.5 w-10 rounded-full transition-colors",
            step >= 2 ? "bg-primary" : "bg-muted",
          )}
        />
      </div>
      <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Step {step} of 2
      </span>
    </div>
  );
}

export function WelcomeForm({ firstName }: { firstName: string | null }) {
  const [step, setStep] = useState<1 | 2>(1);

  return (
    <div className="w-full max-w-3xl">
      <span role="status" aria-live="polite" className="sr-only">
        Step {step} of 2
      </span>
      {step === 1 ? (
        <WelcomeStep firstName={firstName} onContinue={() => setStep(2)} />
      ) : (
        <ProfileStep />
      )}
    </div>
  );
}

// ── Step 1: Welcome ────────────────────────────────────────────────────────

function WelcomeStep({
  firstName,
  onContinue,
}: {
  firstName: string | null;
  onContinue: () => void;
}) {
  return (
    <div>
      <StepIndicator step={1} />

      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Welcome to Velo{firstName ? `, ${firstName}` : ""}
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
        Velo helps you manage your entire client workflow, from sending
        proposals to tracking projects and getting paid, all in one place.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {FEATURES.map((feature) => (
          <Card key={feature.title} className="h-full">
            <CardContent className="flex h-full flex-col p-5 pt-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                <feature.icon aria-hidden className="h-5 w-5 text-primary" />
              </div>
              <h2 className="mt-4 text-sm font-semibold text-foreground">
                {feature.title}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-10 flex justify-end">
        <button
          type="button"
          onClick={onContinue}
          className={cn(
            "inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
            focusRing,
          )}
        >
          Get started
          <ArrowRight aria-hidden className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ── Step 2: Business profile ───────────────────────────────────────────────

function ProfileStep() {
  const [businessName, setBusinessName] = useState("");
  const [abn, setAbn] = useState("");
  const [addressStreet, setAddressStreet] = useState("");
  const [addressCity, setAddressCity] = useState("");
  const [addressState, setAddressState] = useState("");
  const [addressPostcode, setAddressPostcode] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<"submit" | "skip" | null>(
    null,
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPendingAction("submit");
    startTransition(async () => {
      try {
        await completeOnboarding({
          businessName,
          abn,
          addressStreet,
          addressCity,
          addressState,
          addressPostcode,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save");
        setPendingAction(null);
      }
    });
  }

  function handleSkip() {
    setError(null);
    setPendingAction("skip");
    startTransition(async () => {
      try {
        await skipOnboarding();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to skip");
        setPendingAction(null);
      }
    });
  }

  return (
    <div className="mx-auto max-w-xl">
      <StepIndicator step={2} />

      <h1 className="mt-6 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        Set up your business profile
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This information appears on your proposals and invoices. You can update
        it anytime in Settings.
      </p>

      <Card className="mt-6">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="business-name" className={labelClass}>
                Business name
              </label>
              <input
                id="business-name"
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                maxLength={150}
                disabled={pending}
                placeholder="Acme Studio"
                autoComplete="organization"
                autoFocus
                aria-describedby="business-name-help"
                className={cn("mt-1", inputClass)}
              />
              <p id="business-name-help" className={helperClass}>
                Your trading name or full name if you freelance solo.
              </p>
            </div>

            <div>
              <label htmlFor="abn" className={labelClass}>
                ABN
              </label>
              <input
                id="abn"
                type="text"
                value={abn}
                onChange={(e) => setAbn(e.target.value)}
                placeholder="11 222 333 444"
                disabled={pending}
                aria-describedby="abn-help"
                className={cn("mt-1", inputClass)}
              />
              <p id="abn-help" className={helperClass}>
                Your Australian Business Number. Required for GST invoices.
              </p>
            </div>

            <div>
              <label htmlFor="address-street" className={labelClass}>
                Street address
              </label>
              <input
                id="address-street"
                type="text"
                value={addressStreet}
                onChange={(e) => setAddressStreet(e.target.value)}
                maxLength={200}
                disabled={pending}
                autoComplete="street-address"
                aria-describedby="address-help"
                className={cn("mt-1", inputClass)}
              />
              <p id="address-help" className={helperClass}>
                Your business address appears on invoices and proposals.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="address-city" className={labelClass}>
                  City
                </label>
                <input
                  id="address-city"
                  type="text"
                  value={addressCity}
                  onChange={(e) => setAddressCity(e.target.value)}
                  maxLength={100}
                  disabled={pending}
                  autoComplete="address-level2"
                  className={cn("mt-1", inputClass)}
                />
              </div>
              <div>
                <label htmlFor="address-state" className={labelClass}>
                  State
                </label>
                <select
                  id="address-state"
                  value={addressState}
                  onChange={(e) => setAddressState(e.target.value)}
                  disabled={pending}
                  className={cn("mt-1", inputClass)}
                >
                  <option value="">—</option>
                  {AU_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="address-postcode" className={labelClass}>
                  Postcode
                </label>
                <input
                  id="address-postcode"
                  type="text"
                  value={addressPostcode}
                  onChange={(e) => setAddressPostcode(e.target.value)}
                  inputMode="numeric"
                  maxLength={4}
                  disabled={pending}
                  autoComplete="postal-code"
                  className={cn("mt-1", inputClass)}
                />
              </div>
            </div>

            {error && (
              <p
                role="alert"
                aria-live="polite"
                className="text-xs text-destructive"
              >
                {error}
              </p>
            )}

            <div className="flex flex-col-reverse items-stretch gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={handleSkip}
                disabled={pending}
                aria-busy={pendingAction === "skip"}
                className={cn(
                  "rounded-md px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50",
                  focusRing,
                )}
              >
                {pendingAction === "skip" ? "Skipping…" : "Skip for now"}
              </button>
              <button
                type="submit"
                disabled={pending}
                aria-busy={pendingAction === "submit"}
                className={cn(
                  "rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50",
                  focusRing,
                )}
              >
                {pendingAction === "submit" ? "Saving…" : "Save and continue"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
