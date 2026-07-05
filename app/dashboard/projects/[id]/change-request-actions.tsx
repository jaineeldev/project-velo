"use client";

import { useState, useTransition } from "react";
import { cn, focusRing } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
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
        className="block text-xs font-medium uppercase tracking-wider text-muted-foreground"
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
          "mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-ring focus:outline-none disabled:opacity-50",
          focusRing,
        )}
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => submit("approved")}
          disabled={isPending}
          aria-busy={isPending && pendingDecision === "approved"}
          className={buttonVariants({ variant: "primary" })}
        >
          {isPending && pendingDecision === "approved" ? "Approving…" : "Approve"}
        </button>
        <button
          type="button"
          onClick={() => submit("rejected")}
          disabled={isPending}
          aria-busy={isPending && pendingDecision === "rejected"}
          className={buttonVariants({ variant: "secondary" })}
        >
          {isPending && pendingDecision === "rejected" ? "Rejecting…" : "Reject"}
        </button>
        {error && (
          <span
            role="alert"
            aria-live="polite"
            className="text-xs text-destructive"
          >
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
