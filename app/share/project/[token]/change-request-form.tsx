"use client";

import { useState, useTransition } from "react";
import { MessageSquarePlus, MessageSquare } from "lucide-react";
import { cn, focusRing } from "@/lib/utils";
import { submitProjectChangeRequest } from "./actions";

type Phase = "idle" | "open" | "submitting" | "submitted" | "error";

export function ChangeRequestForm({ token }: { token: string }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [description, setDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [, startTransition] = useTransition();

  function handleSubmit() {
    setPhase("submitting");
    startTransition(async () => {
      try {
        await submitProjectChangeRequest(token, description);
        setDescription("");
        setPhase("submitted");
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : "Something went wrong.",
        );
        setPhase("error");
      }
    });
  }

  if (phase === "submitted") {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
          <MessageSquare
            aria-hidden
            className="h-5 w-5 text-muted-foreground"
          />
        </div>
        <div>
          <p className="font-semibold text-foreground">
            Change request submitted
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Your change request has been submitted. The team will be in touch.
          </p>
        </div>
      </div>
    );
  }

  if (phase === "idle") {
    return (
      <button
        type="button"
        onClick={() => setPhase("open")}
        className={cn(
          "inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          focusRing,
        )}
      >
        <MessageSquarePlus aria-hidden className="h-4 w-4" />
        Request a change
      </button>
    );
  }

  const submitting = phase === "submitting";
  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="space-y-1.5">
        <label
          htmlFor="projectChangeDescription"
          className="block text-sm font-medium text-foreground"
        >
          Describe the change you need
        </label>
        <textarea
          id="projectChangeDescription"
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What would you like changed on this project?"
          disabled={submitting}
          maxLength={2000}
          className={cn(
            "w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50",
            focusRing,
          )}
        />
      </div>

      {phase === "error" && (
        <p role="alert" aria-live="polite" className="text-sm text-destructive">
          {errorMessage}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => {
            setPhase("idle");
            setErrorMessage("");
          }}
          disabled={submitting}
          className={cn(
            "rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50",
            focusRing,
          )}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || !description.trim()}
          aria-busy={submitting}
          className={cn(
            "rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50",
            focusRing,
          )}
        >
          {submitting ? "Submitting..." : "Submit request"}
        </button>
      </div>
    </div>
  );
}
