"use client";

import { useState, useTransition } from "react";
import { cn, focusRing } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { addTimeEntry } from "../actions";

export function TimeEntryForm({ projectId }: { projectId: string }) {
  const [description, setDescription] = useState("");
  const [hours, setHours] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        await addTimeEntry(projectId, { description, hours });
        setDescription("");
        setHours("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add entry");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-start gap-3">
      <div className="flex-1 min-w-[16rem]">
        <label htmlFor="time-description" className="sr-only">
          Description
        </label>
        <input
          id="time-description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What did you work on?"
          required
          maxLength={500}
          disabled={isPending}
          className={cn(
            "w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-ring focus:outline-none disabled:opacity-50",
            focusRing,
          )}
        />
      </div>
      <div className="w-28">
        <label htmlFor="time-hours" className="sr-only">
          Hours
        </label>
        <input
          id="time-hours"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0.01"
          max="999.99"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          placeholder="Hours"
          required
          disabled={isPending}
          className={cn(
            "w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-ring focus:outline-none disabled:opacity-50",
            focusRing,
          )}
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        aria-busy={isPending}
        className={buttonVariants({ variant: "primary" })}
      >
        {isPending ? "Adding…" : "Add entry"}
      </button>
      {error && (
        <p
          role="alert"
          aria-live="polite"
          className="w-full text-xs text-destructive"
        >
          {error}
        </p>
      )}
    </form>
  );
}
