"use client";

import { useState, useTransition } from "react";
import { cn, focusRing } from "@/lib/utils";
import { respondToChangeRequest } from "../actions";

type Props = {
  projectId: string;
  changeRequestId: string;
};

export function ChangeRequestActions({ projectId, changeRequestId }: Props) {
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendingDecision, setPendingDecision] = useState<
    "approved" | "rejected" | null
  >(null);
  const [isPending, startTransition] = useTransition();

  function submit(decision: "approved" | "rejected") {
    setError(null);
    setPendingDecision(decision);
    startTransition(async () => {
      try {
        await respondToChangeRequest(projectId, changeRequestId, decision, note);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to respond");
        setPendingDecision(null);
      }
    });
  }

  return (
    <div className="mt-4">
      <label
        htmlFor={`note-${changeRequestId}`}
        className="block text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
      >
        Note to client (optional)
      </label>
      <textarea
        id={`note-${changeRequestId}`}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        maxLength={2000}
        disabled={isPending}
        placeholder="Add a short note explaining your decision…"
        className={cn(
          "mt-1 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 transition-colors focus:border-neutral-400 focus:outline-none disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder-neutral-600 dark:focus:border-neutral-600",
          focusRing,
        )}
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => submit("approved")}
          disabled={isPending}
          aria-busy={isPending && pendingDecision === "approved"}
          className={cn(
            "rounded-md bg-neutral-900 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200",
            focusRing,
          )}
        >
          {isPending && pendingDecision === "approved" ? "Approving…" : "Approve"}
        </button>
        <button
          type="button"
          onClick={() => submit("rejected")}
          disabled={isPending}
          aria-busy={isPending && pendingDecision === "rejected"}
          className={cn(
            "rounded-md border border-neutral-200 px-3.5 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-900",
            focusRing,
          )}
        >
          {isPending && pendingDecision === "rejected" ? "Rejecting…" : "Reject"}
        </button>
        {error && (
          <span
            role="alert"
            aria-live="polite"
            className="text-xs text-red-600 dark:text-red-400"
          >
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
