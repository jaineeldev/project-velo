"use client";

import { useRef, useState, useTransition } from "react";
import { cn, focusRing } from "@/lib/utils";
import { checkClientDeletable, deleteClient } from "./actions";

type Phase = "idle" | "checking" | "blocked" | "confirming" | "deleting";

export function DeleteClientButton({
  clientId,
  clientName,
}: {
  clientId: string;
  clientName: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function closeDialog() {
    dialogRef.current?.close();
    setPhase("idle");
    setMessage(null);
  }

  function handleDeleteClick() {
    setPhase("checking");
    startTransition(async () => {
      try {
        const result = await checkClientDeletable(clientId);
        if (result.canDelete) {
          setPhase("confirming");
        } else {
          setMessage(result.reason);
          setPhase("blocked");
        }
      } catch {
        setMessage("Something went wrong. Please try again.");
        setPhase("blocked");
      }
      dialogRef.current?.showModal();
    });
  }

  function handleConfirm() {
    setPhase("deleting");
    setMessage(null);
    startTransition(async () => {
      try {
        await deleteClient(clientId);
        dialogRef.current?.close();
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Something went wrong.");
        setPhase("confirming");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={handleDeleteClick}
        disabled={isPending}
        aria-busy={isPending}
        aria-label={`Delete ${clientName}`}
        className={cn(
          "rounded text-sm text-neutral-400 transition-colors hover:text-red-600 disabled:opacity-50 dark:text-neutral-600 dark:hover:text-red-400",
          focusRing,
        )}
      >
        {phase === "checking" ? "Checking…" : "Delete"}
      </button>

      <dialog
        ref={dialogRef}
        onClose={closeDialog}
        className="w-full max-w-md rounded-lg border border-neutral-200 bg-white p-6 shadow-xl backdrop:bg-black/50 backdrop:backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900"
      >
        {phase === "blocked" ? (
          <>
            <h2 className="text-base font-medium text-neutral-900 dark:text-neutral-100">
              Cannot delete client
            </h2>
            <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
              {message}
            </p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={closeDialog}
                className={cn(
                  "rounded-md bg-neutral-900 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200",
                  focusRing,
                )}
              >
                Close
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-base font-medium text-neutral-900 dark:text-neutral-100">
              Delete client?
            </h2>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Are you sure you want to delete{" "}
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {clientName}
              </span>
              ? This cannot be undone.
            </p>

            {message && (
              <p
                role="alert"
                aria-live="polite"
                className="mt-3 text-sm text-red-600 dark:text-red-400"
              >
                {message}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeDialog}
                disabled={phase === "deleting"}
                className={cn(
                  "rounded-md px-3.5 py-2 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900 disabled:opacity-50 dark:text-neutral-400 dark:hover:text-neutral-100",
                  focusRing,
                )}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={phase === "deleting"}
                aria-busy={phase === "deleting"}
                className={cn(
                  "rounded-md bg-red-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50",
                  focusRing,
                )}
              >
                {phase === "deleting" ? "Deleting…" : "Delete client"}
              </button>
            </div>
          </>
        )}
      </dialog>
    </>
  );
}
