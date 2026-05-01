"use client";

import { useTransition } from "react";
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
      aria-label="Delete time entry"
      className="text-xs text-neutral-400 transition-colors hover:text-red-600 disabled:opacity-50 dark:text-neutral-600 dark:hover:text-red-400"
    >
      Remove
    </button>
  );
}
