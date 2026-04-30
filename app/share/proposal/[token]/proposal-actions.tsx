"use client";

import { useState, useTransition } from "react";
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
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 dark:border-green-900 dark:bg-green-950">
        <p className="font-semibold text-green-800 dark:text-green-200">
          Proposal approved
        </p>
        <p className="mt-1 text-sm text-green-700 dark:text-green-300">
          Thank you for approving this proposal. The team will be in touch
          shortly to get started.
        </p>
      </div>
    );
  }

  // ── Changes sent confirmation ─────────────────────────────────────────────
  if (phase === "changes-sent") {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 dark:border-amber-900 dark:bg-amber-950">
        <p className="font-semibold text-amber-800 dark:text-amber-200">
          Changes requested
        </p>
        <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
          Your feedback has been received. The team will review your request and
          be in touch with a revised proposal.
        </p>
      </div>
    );
  }

  // ── Approve error ─────────────────────────────────────────────────────────
  if (phase === "approve-error") {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950">
        <p className="font-semibold text-red-800 dark:text-red-200">
          Something went wrong
        </p>
        <p className="mt-1 text-sm text-red-700 dark:text-red-300">
          {errorMessage}
        </p>
        <button
          type="button"
          onClick={() => setPhase("idle")}
          className="mt-3 text-sm text-red-700 underline underline-offset-2 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"
        >
          Go back
        </button>
      </div>
    );
  }

  // ── Change-request form ───────────────────────────────────────────────────
  if (phase === "changes" || phase === "submitting-changes" || phase === "changes-error") {
    return (
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="changeMessage"
            className="block text-sm font-medium text-neutral-900 dark:text-neutral-100"
          >
            What would you like changed?
          </label>
          <textarea
            id="changeMessage"
            rows={5}
            value={changeMessage}
            onChange={(e) => setChangeMessage(e.target.value)}
            placeholder="Please describe the changes you'd like…"
            disabled={phase === "submitting-changes"}
            className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-300 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-600 dark:focus:border-neutral-600 dark:focus:ring-neutral-700"
          />
        </div>

        {phase === "changes-error" && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {errorMessage}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setPhase("idle")}
            disabled={phase === "submitting-changes"}
            className="rounded-lg border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmitChanges}
            disabled={phase === "submitting-changes" || !changeMessage.trim()}
            className="rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
          >
            {phase === "submitting-changes"
              ? "Submitting…"
              : "Submit feedback"}
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
        className="flex-1 rounded-lg bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-700 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
      >
        {phase === "approving" ? "Approving…" : "Approve proposal"}
      </button>
      <button
        type="button"
        onClick={handleRequestChanges}
        disabled={isPending}
        className="flex-1 rounded-lg border border-neutral-200 px-6 py-3 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
      >
        Request changes
      </button>
    </div>
  );
}
