"use client";

import { useState, useTransition } from "react";
import { ExternalLink, Plus, X } from "lucide-react";
import { cn, focusRing } from "@/lib/utils";
import { addDeliverable, removeDeliverable } from "../actions";
import type { ProjectDeliverable } from "../actions";

export function MilestoneDeliverables({
  milestoneId,
  deliverables,
}: {
  milestoneId: string;
  deliverables: ProjectDeliverable[];
}) {
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function reset() {
    setLabel("");
    setUrl("");
    setError(null);
    setAdding(false);
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await addDeliverable(milestoneId, label, url);
        reset();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add link.");
      }
    });
  }

  function remove(deliverableId: string) {
    startTransition(async () => {
      try {
        await removeDeliverable(deliverableId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to remove link.");
      }
    });
  }

  return (
    <div className="mt-3 space-y-2">
      {deliverables.length > 0 && (
        <ul className="space-y-1.5">
          {deliverables.map((d) => (
            <li
              key={d.id}
              className="flex items-center gap-2 text-sm"
            >
              <a
                href={d.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex items-center gap-1.5 rounded text-primary underline-offset-2 hover:underline",
                  focusRing,
                )}
              >
                <ExternalLink aria-hidden className="h-3.5 w-3.5" />
                <span className="truncate">{d.label}</span>
              </a>
              <button
                type="button"
                onClick={() => remove(d.id)}
                disabled={isPending}
                aria-busy={isPending}
                aria-label={`Remove ${d.label}`}
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50",
                  focusRing,
                )}
              >
                <X aria-hidden className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {adding ? (
        <form onSubmit={submit} className="space-y-2">
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Label (e.g. GitHub repo)"
            maxLength={100}
            required
            disabled={isPending}
            className={cn(
              "w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none disabled:opacity-50",
              focusRing,
            )}
          />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://…"
            maxLength={500}
            required
            disabled={isPending}
            className={cn(
              "w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none disabled:opacity-50",
              focusRing,
            )}
          />
          {error && (
            <p role="alert" aria-live="polite" className="text-xs text-destructive">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              aria-busy={isPending}
              className={cn(
                "rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50",
                focusRing,
              )}
            >
              {isPending ? "Saving…" : "Save link"}
            </button>
            <button
              type="button"
              onClick={reset}
              disabled={isPending}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50",
                focusRing,
              )}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className={cn(
            "inline-flex items-center gap-1 rounded text-xs font-medium text-muted-foreground transition-colors hover:text-foreground",
            focusRing,
          )}
        >
          <Plus aria-hidden className="h-3.5 w-3.5" />
          Add link
        </button>
      )}
    </div>
  );
}
