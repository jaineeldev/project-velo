"use client";

import { useTransition } from "react";
import { cn, focusRing } from "@/lib/utils";
import { deleteTimeEntry } from "../actions";

type Props = {
  projectId: string;
  entryId: string;
};

export function DeleteTimeEntryButton({ projectId, entryId }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      try {
        await deleteTimeEntry(projectId, entryId);
      } catch {
        // Best-effort: row stays visible on failure; user can retry.
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-busy={isPending}
      aria-label="Delete time entry"
      className={cn(
        "rounded text-xs text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50",
        focusRing,
      )}
    >
      Remove
    </button>
  );
}
