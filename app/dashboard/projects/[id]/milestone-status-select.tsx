"use client";

import { useState, useTransition } from "react";
import { cn, focusRing } from "@/lib/utils";
import { updateMilestoneStatus } from "../actions";
import { MILESTONE_STATUSES } from "@/lib/validation";

const STATUS_LABELS: Record<string, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  completed: "Completed",
};

type Props = {
  projectId: string;
  milestoneId: string;
  currentStatus: string;
};

export function MilestoneStatusSelect({
  projectId,
  milestoneId,
  currentStatus,
}: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    const previous = status;
    setStatus(next);
    setError(null);

    startTransition(async () => {
      try {
        await updateMilestoneStatus(projectId, milestoneId, next);
      } catch (err) {
        setStatus(previous);
        setError(err instanceof Error ? err.message : "Update failed");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <select
        value={status}
        onChange={handleChange}
        disabled={isPending}
        aria-busy={isPending}
        aria-label="Milestone status"
        className={cn(
          "rounded-md border border-neutral-200 bg-white px-2.5 py-1 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:bg-neutral-900",
          focusRing,
        )}
      >
        {MILESTONE_STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      {error && (
        <p
          role="alert"
          aria-live="polite"
          className="text-xs text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  );
}
