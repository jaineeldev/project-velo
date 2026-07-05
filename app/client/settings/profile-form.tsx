"use client";

import { useState, useTransition } from "react";
import { useUser } from "@clerk/nextjs";
import type { EmailAddressResource } from "@clerk/types";
import { Check, Mail, Pencil, X } from "lucide-react";
import { cn, focusRing } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { updateName } from "./actions";

export function ProfileForm() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <div className="mt-6 h-40 animate-pulse rounded-md bg-muted" />;
  }
  if (!user) return null;

  return (
    <div className="mt-6 space-y-4">
      <NameRow
        initialFirst={user.firstName ?? ""}
        initialLast={user.lastName ?? ""}
        onSaved={() => user.reload()}
      />
      <EmailRow user={user} />
    </div>
  );
}

function NameRow({
  initialFirst,
  initialLast,
  onSaved,
}: {
  initialFirst: string;
  initialLast: string;
  onSaved: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [first, setFirst] = useState(initialFirst);
  const [last, setLast] = useState(initialLast);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const displayName =
    [initialFirst, initialLast].filter(Boolean).join(" ") || "Not set";

  function onCancel() {
    setFirst(initialFirst);
    setLast(initialLast);
    setError(null);
    setEditing(false);
  }

  function onSave() {
    setError(null);
    startTransition(async () => {
      try {
        await updateName({ firstName: first, lastName: last });
        onSaved();
        setEditing(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not update name.");
      }
    });
  }

  return (
    <FieldRow label="Name">
      {!editing ? (
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-foreground">
            {displayName}
          </span>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
              focusRing,
            )}
          >
            <Pencil aria-hidden className="h-3 w-3" />
            Edit
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs text-muted-foreground">First name</span>
              <input
                type="text"
                value={first}
                onChange={(e) => setFirst(e.target.value)}
                autoComplete="given-name"
                disabled={isPending}
                className={cn(
                  "mt-1 block w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground outline-none focus:border-primary",
                  focusRing,
                )}
              />
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground">Last name</span>
              <input
                type="text"
                value={last}
                onChange={(e) => setLast(e.target.value)}
                autoComplete="family-name"
                disabled={isPending}
                className={cn(
                  "mt-1 block w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground outline-none focus:border-primary",
                  focusRing,
                )}
              />
            </label>
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onSave}
              disabled={isPending || !first.trim()}
              className={buttonVariants({ variant: "primary" })}
            >
              {isPending ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isPending}
              className={buttonVariants({ variant: "secondary" })}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </FieldRow>
  );
}

type EmailPhase =
  | { kind: "idle" }
  | { kind: "entering" }
  | { kind: "verifying"; emailObj: EmailAddressResource; pending: string }
  | { kind: "finalizing" };

function EmailRow({ user }: { user: NonNullable<ReturnType<typeof useUser>["user"]> }) {
  const [phase, setPhase] = useState<EmailPhase>({ kind: "idle" });
  const [newEmail, setNewEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isWorking, setIsWorking] = useState(false);

  const currentEmail = user.primaryEmailAddress?.emailAddress ?? "";

  async function startChange() {
    setError(null);
    const trimmed = newEmail.trim().toLowerCase();
    if (!trimmed.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    if (trimmed === currentEmail.toLowerCase()) {
      setError("That's already your email.");
      return;
    }
    setIsWorking(true);
    try {
      const emailObj = await user.createEmailAddress({ email: trimmed });
      await emailObj.prepareVerification({ strategy: "email_code" });
      setPhase({ kind: "verifying", emailObj, pending: trimmed });
      setCode("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not start verification. Try again.",
      );
    } finally {
      setIsWorking(false);
    }
  }

  async function confirmCode() {
    if (phase.kind !== "verifying") return;
    setError(null);
    setIsWorking(true);
    try {
      const result = await phase.emailObj.attemptVerification({ code: code.trim() });
      if (result.verification.status !== "verified") {
        setError("Code didn't verify. Try the latest one Clerk sent.");
        return;
      }
      // Promote the new email to primary, then drop the old one. Webhook
      // will sync this to agency clients records via the user.updated
      // event triggered by the primary-email change.
      setPhase({ kind: "finalizing" });
      const oldPrimary = user.primaryEmailAddress;
      await user.update({ primaryEmailAddressId: phase.emailObj.id });
      if (oldPrimary && oldPrimary.id !== phase.emailObj.id) {
        try {
          await oldPrimary.destroy();
        } catch {
          // Non-fatal: old email can be removed manually from Clerk if this
          // step fails. The primary is already the new address.
        }
      }
      await user.reload();
      setPhase({ kind: "idle" });
      setNewEmail("");
      setCode("");
    } catch (err) {
      setPhase({ kind: "verifying", emailObj: phase.emailObj, pending: phase.pending });
      setError(
        err instanceof Error
          ? err.message
          : "Could not verify code. Try again.",
      );
    } finally {
      setIsWorking(false);
    }
  }

  async function cancelChange() {
    setError(null);
    if (phase.kind === "verifying") {
      try {
        await phase.emailObj.destroy();
      } catch {
        // ignore
      }
    }
    setPhase({ kind: "idle" });
    setNewEmail("");
    setCode("");
  }

  if (phase.kind === "idle") {
    return (
      <FieldRow label="Email">
        <div className="flex items-center justify-between gap-3">
          <span className="truncate text-sm font-medium text-foreground">
            {currentEmail}
          </span>
          <button
            type="button"
            onClick={() => setPhase({ kind: "entering" })}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
              focusRing,
            )}
          >
            <Pencil aria-hidden className="h-3 w-3" />
            Change
          </button>
        </div>
      </FieldRow>
    );
  }

  if (phase.kind === "entering") {
    return (
      <FieldRow label="Email">
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Enter your new email. We&apos;ll send a verification code to
            confirm you own it.
          </p>
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            autoFocus
            disabled={isWorking}
            className={cn(
              "block w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground outline-none focus:border-primary",
              focusRing,
            )}
          />
          {error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={startChange}
              disabled={isWorking || !newEmail.trim()}
              className={buttonVariants({ variant: "primary" })}
            >
              <Mail aria-hidden className="h-3.5 w-3.5" />
              {isWorking ? "Sending code..." : "Send code"}
            </button>
            <button
              type="button"
              onClick={cancelChange}
              disabled={isWorking}
              className={buttonVariants({ variant: "secondary" })}
            >
              Cancel
            </button>
          </div>
        </div>
      </FieldRow>
    );
  }

  if (phase.kind === "verifying") {
    return (
      <FieldRow label="Email">
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            We sent a 6-digit code to{" "}
            <span className="font-medium text-foreground">{phase.pending}</span>
            . Enter it below to switch.
          </p>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="123456"
            autoFocus
            disabled={isWorking}
            maxLength={6}
            className={cn(
              "block w-32 rounded-md border border-border bg-background px-3 py-1.5 text-center font-mono text-lg tracking-[0.3em] text-foreground outline-none focus:border-primary",
              focusRing,
            )}
          />
          {error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={confirmCode}
              disabled={isWorking || code.length < 6}
              className={buttonVariants({ variant: "primary" })}
            >
              <Check aria-hidden className="h-3.5 w-3.5" />
              {isWorking ? "Verifying..." : "Confirm"}
            </button>
            <button
              type="button"
              onClick={cancelChange}
              disabled={isWorking}
              className={buttonVariants({ variant: "secondary" })}
            >
              <X aria-hidden className="h-3.5 w-3.5" />
              Cancel
            </button>
          </div>
        </div>
      </FieldRow>
    );
  }

  return (
    <FieldRow label="Email">
      <p className="text-sm text-muted-foreground">Finalizing change...</p>
    </FieldRow>
  );
}

function FieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="mt-2">{children}</div>
    </div>
  );
}
