"use client";

import { useState, useTransition } from "react";
import { ShieldOff, ShieldCheck } from "lucide-react";
import { cn, focusRing } from "@/lib/utils";
import { suspendUser, unsuspendUser } from "./actions";

type Props = {
  clerkId: string;
  isSuspended: boolean;
};

// Operator suspend/unsuspend controls. Wraps the server actions in a
// transition for instant UI feedback, then leans on revalidatePath in the
// action to refresh the rendered suspension state. A two-step confirm
// guards against an accidental click on a row the operator is just
// browsing.

export function SuspendButtons({ clerkId, isSuspended }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function runSuspend() {
    setError(null);
    startTransition(async () => {
      const result = await suspendUser(clerkId);
      if (!result.ok) setError(result.error);
      setConfirming(false);
    });
  }

  function runUnsuspend() {
    setError(null);
    startTransition(async () => {
      const result = await unsuspendUser(clerkId);
      if (!result.ok) setError(result.error);
    });
  }

  if (isSuspended) {
    return (
      <div className="flex flex-col items-end gap-2">
        <button
          type="button"
          onClick={runUnsuspend}
          disabled={pending}
          className={cn(
            "inline-flex items-center gap-2 rounded-md border border-success/40 bg-success/10 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-success/15 disabled:opacity-60",
            focusRing,
          )}
        >
          <ShieldCheck aria-hidden className="h-4 w-4" />
          {pending ? "Unsuspending." : "Unsuspend"}
        </button>
        {error ? (
          <p className="text-xs text-destructive">{error}</p>
        ) : null}
      </div>
    );
  }

  if (confirming) {
    return (
      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={pending}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
              focusRing,
            )}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={runSuspend}
            disabled={pending}
            className={cn(
              "inline-flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/15 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-destructive/25 disabled:opacity-60",
              focusRing,
            )}
          >
            <ShieldOff aria-hidden className="h-4 w-4" />
            {pending ? "Suspending." : "Confirm suspend"}
          </button>
        </div>
        {error ? (
          <p className="text-xs text-destructive">{error}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className={cn(
          "inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent/60",
          focusRing,
        )}
      >
        <ShieldOff aria-hidden className="h-4 w-4" />
        Suspend account
      </button>
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
