"use client";

import { useState, useTransition } from "react";
import { useClerk } from "@clerk/nextjs";
import { cn, focusRing } from "@/lib/utils";
import { deleteAccount } from "./actions";

export function DangerZone({ accountEmail }: { accountEmail: string }) {
  const { signOut } = useClerk();
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onCancel() {
    setConfirming(false);
    setTyped("");
    setError(null);
  }

  function onConfirm() {
    setError(null);
    startTransition(async () => {
      try {
        await deleteAccount(typed);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not delete account.");
        return;
      }
      // Clear the session cookie locally and land on /sign-in. The Clerk
      // user is already gone server-side; signOut is just local cleanup.
      await signOut({ redirectUrl: "/sign-in" });
    });
  }

  return (
    <div className="mt-4 rounded-lg border border-red-300 bg-red-50/40 p-5 dark:border-red-900 dark:bg-red-950/20">
      <p className="text-sm font-medium text-red-900 dark:text-red-200">
        Delete account
      </p>
      <p className="mt-1 text-sm text-red-800/80 dark:text-red-300/80">
        Permanently remove your account and every client, proposal, project,
        and invoice attached to it. This cannot be undone.
      </p>

      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          aria-label="Delete account"
          className={cn(
            "mt-4 rounded-md border border-red-400 bg-white px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/60",
            focusRing,
          )}
        >
          Delete account
        </button>
      ) : (
        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="text-sm text-red-900 dark:text-red-200">
              Type{" "}
              <span className="font-mono">{accountEmail}</span> to confirm.
            </span>
            <input
              type="email"
              autoComplete="off"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              className={cn(
                "mt-1 block w-full rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm text-neutral-900 outline-none focus:border-red-500 dark:border-red-800 dark:bg-neutral-900 dark:text-neutral-100",
                focusRing,
              )}
              placeholder={accountEmail}
              disabled={isPending}
            />
          </label>

          {error && (
            <p
              role="alert"
              aria-live="polite"
              className="text-sm text-red-700 dark:text-red-300"
            >
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onConfirm}
              disabled={isPending || typed.trim().toLowerCase() !== accountEmail.toLowerCase()}
              aria-busy={isPending}
              className={cn(
                "rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50",
                focusRing,
              )}
            >
              {isPending ? "Deleting…" : "Permanently delete"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isPending}
              className={cn(
                "rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800",
                focusRing,
              )}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
