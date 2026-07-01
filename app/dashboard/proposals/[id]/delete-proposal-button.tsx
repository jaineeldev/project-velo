"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn, focusRing } from "@/lib/utils";
import { deleteProposal } from "../actions";

export function DeleteProposalButton({ proposalId }: { proposalId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      try {
        await deleteProposal(proposalId);
        router.push("/dashboard/proposals");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
        setConfirming(false);
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        aria-label="Delete proposal"
        className={cn(
          "rounded-md border border-destructive/30 px-3.5 py-1.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10",
          focusRing,
        )}
      >
        Delete proposal
      </button>

      {error && (
        <p
          role="alert"
          aria-live="polite"
          className="mt-2 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      {confirming && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !isPending && setConfirming(false)}
        >
          <div
            className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold text-foreground">
              Delete this proposal?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This permanently removes the proposal along with its line items,
              activity history, and any change requests. This cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={isPending}
                className={cn(
                  "rounded-md border border-input bg-background px-3.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50",
                  focusRing,
                )}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                aria-busy={isPending}
                className={cn(
                  "rounded-md bg-destructive px-3.5 py-1.5 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:opacity-50",
                  focusRing,
                )}
              >
                {isPending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
