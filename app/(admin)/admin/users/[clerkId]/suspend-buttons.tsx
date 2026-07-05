"use client";

import { useState, useTransition } from "react";
import { ShieldOff, ShieldCheck } from "lucide-react";
import { cn, focusRing } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
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
            "inline-flex h-9 items-center justify-center gap-2 rounded-md border border-success/40 bg-success/10 px-3.5 text-sm font-medium text-foreground transition-all duration-200 hover:bg-success/15 motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.98] disabled:opacity-60",
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
            className={buttonVariants({ variant: "ghost" })}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={runSuspend}
            disabled={pending}
            className={cn(
              "inline-flex h-9 items-center justify-center gap-2 rounded-md border border-destructive/40 bg-destructive/15 px-3.5 text-sm font-medium text-foreground transition-all duration-200 hover:bg-destructive/25 motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.98] disabled:opacity-60",
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
        className={buttonVariants({ variant: "secondary" })}
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
