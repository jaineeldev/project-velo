"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, MessageSquare } from "lucide-react";
import { cn, focusRing } from "@/lib/utils";
import { approveProposal, submitChangeRequest } from "./actions";

type Phase =
  | "idle"
  | "approving"
  | "approved"
  | "approve-error"
  | "changes"
  | "submitting-changes"
  | "changes-sent"
  | "changes-error";

export function ProposalActions({
  token,
  initialStatus,
}: {
  token: string;
  initialStatus: string;
}) {
  const [phase, setPhase] = useState<Phase>(() => {
    if (initialStatus === "approved") return "approved";
    if (initialStatus === "changes_requested") return "changes-sent";
    return "idle";
  });
  const [changeMessage, setChangeMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleApprove() {
    setPhase("approving");
    startTransition(async () => {
      try {
        await approveProposal(token);
        setPhase("approved");
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : "Something went wrong.",
        );
        setPhase("approve-error");
      }
    });
  }

  function handleRequestChanges() {
    setPhase("changes");
  }

  function handleSubmitChanges() {
    setPhase("submitting-changes");
    startTransition(async () => {
      try {
        await submitChangeRequest(token, changeMessage);
        setPhase("changes-sent");
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : "Something went wrong.",
        );
        setPhase("changes-error");
      }
    });
  }

  // ── Approved confirmation ─────────────────────────────────────────────────
  if (phase === "approved") {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
          <CheckCircle2 aria-hidden className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-foreground">Proposal approved</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Thank you for approving this proposal. The team will be in touch
            shortly to get started.
          </p>
        </div>
      </div>
    );
  }

  // ── Changes sent confirmation ─────────────────────────────────────────────
  if (phase === "changes-sent") {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
          <MessageSquare
            aria-hidden
            className="h-5 w-5 text-muted-foreground"
          />
        </div>
        <div>
          <p className="font-semibold text-foreground">Changes requested</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Your feedback has been received. The team will review your request
            and be in touch with a revised proposal.
          </p>
        </div>
      </div>
    );
  }

  // ── Approve error ─────────────────────────────────────────────────────────
  if (phase === "approve-error") {
    return (
      <div
        role="alert"
        aria-live="polite"
        className="rounded-lg border border-border bg-card p-6 shadow-sm"
      >
        <p className="font-semibold text-destructive">Something went wrong</p>
        <p className="mt-1 text-sm text-muted-foreground">{errorMessage}</p>
        <button
          type="button"
          onClick={() => setPhase("idle")}
          className={cn(
            "mt-3 rounded text-sm text-foreground underline underline-offset-2 hover:text-primary",
            focusRing,
          )}
        >
          Go back
        </button>
      </div>
    );
  }

  // ── Change-request form ───────────────────────────────────────────────────
  if (
    phase === "changes" ||
    phase === "submitting-changes" ||
    phase === "changes-error"
  ) {
    const submitting = phase === "submitting-changes";
    return (
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="changeMessage"
            className="block text-sm font-medium text-foreground"
          >
            What would you like changed?
          </label>
          <textarea
            id="changeMessage"
            rows={5}
            value={changeMessage}
            onChange={(e) => setChangeMessage(e.target.value)}
            placeholder="Please describe the changes you'd like…"
            disabled={submitting}
            className={cn(
              "w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50",
              focusRing,
            )}
          />
        </div>

        {phase === "changes-error" && (
          <p role="alert" aria-live="polite" className="text-sm text-destructive">
            {errorMessage}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setPhase("idle")}
            disabled={submitting}
            className={cn(
              "rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50",
              focusRing,
            )}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmitChanges}
            disabled={submitting || !changeMessage.trim()}
            aria-busy={submitting}
            className={cn(
              "rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50",
              focusRing,
            )}
          >
            {submitting ? "Submitting…" : "Submit feedback"}
          </button>
        </div>
      </div>
    );
  }

  // ── Idle — two primary action buttons ────────────────────────────────────
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <button
        type="button"
        onClick={handleApprove}
        disabled={isPending}
        aria-busy={phase === "approving"}
        className={cn(
          "flex-1 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50",
          focusRing,
        )}
      >
        {phase === "approving" ? "Approving…" : "Approve proposal"}
      </button>
      <button
        type="button"
        onClick={handleRequestChanges}
        disabled={isPending}
        className={cn(
          "flex-1 rounded-lg border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent disabled:opacity-50",
          focusRing,
        )}
      >
        Request changes
      </button>
    </div>
  );
}
