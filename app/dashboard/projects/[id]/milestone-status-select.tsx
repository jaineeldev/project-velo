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
          "rounded-md border border-input bg-background px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50",
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
          className="text-xs text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  );
}
