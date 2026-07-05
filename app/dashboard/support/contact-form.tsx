"use client";

import { useState, useTransition } from "react";
import {
  Bug,
  CheckCircle2,
  HelpCircle,
  MessageSquare,
  Send,
  type LucideIcon,
} from "lucide-react";
import { cn, focusRing } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { submitSupport } from "./actions";

type SupportType = "bug" | "feedback" | "help";

const types: { value: SupportType; label: string; icon: LucideIcon }[] = [
  { value: "bug", label: "Bug", icon: Bug },
  { value: "feedback", label: "Feedback", icon: MessageSquare },
  { value: "help", label: "Help", icon: HelpCircle },
];

const placeholderByType: Record<SupportType, string> = {
  bug: "What happened? What did you expect to happen? Any steps to reproduce?",
  feedback:
    "Tell us what's on your mind: what works, what doesn't, what you wish Velo did.",
  help: "What do you need help with?",
};

const inputClass = cn(
  "w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-ring focus:outline-none disabled:opacity-50",
  focusRing,
);

const labelClass =
  "block text-xs font-medium uppercase tracking-wider text-muted-foreground";

export function ContactForm({ userEmail }: { userEmail: string }) {
  const [type, setType] = useState<SupportType>("bug");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (message.trim().length < 5) {
      setError("Please add a few words so we can help.");
      return;
    }

    startTransition(async () => {
      try {
        await submitSupport({
          type,
          subject: subject.trim() || null,
          message: message.trim(),
        });
        setSent(true);
        setSubject("");
        setMessage("");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not send your message.",
        );
      }
    });
  }

  if (sent) {
    return (
      <div
        role="status"
        className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 dark:border-emerald-900 dark:bg-emerald-950/20"
      >
        <div className="flex items-start gap-3">
          <CheckCircle2
            aria-hidden
            className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-300"
          />
          <div>
            <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
              Message sent. Thanks!
            </p>
            <p className="mt-1 text-sm text-emerald-800 dark:text-emerald-200">
              We&apos;ll reply to{" "}
              <span className="font-medium">{userEmail}</span> as soon as we
              can.
            </p>
            <button
              type="button"
              onClick={() => setSent(false)}
              className={cn(
                "mt-3 rounded text-sm font-medium text-emerald-900 hover:underline dark:text-emerald-100",
                focusRing,
              )}
            >
              Send another →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
      <fieldset>
        <legend className={labelClass}>What&apos;s this about?</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {types.map(({ value, label, icon: Icon }) => {
            const active = type === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setType(value)}
                aria-pressed={active}
                className={cn(
                  "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
                  focusRing,
                )}
              >
                <Icon aria-hidden className="h-3.5 w-3.5" />
                {label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label htmlFor="support-subject" className={labelClass}>
          Subject{" "}
          <span className="normal-case tracking-normal text-muted-foreground">
            (optional)
          </span>
        </label>
        <input
          id="support-subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Short description"
          maxLength={200}
          disabled={isPending}
          className={cn(inputClass, "mt-2")}
        />
      </div>

      <div>
        <label htmlFor="support-message" className={labelClass}>
          Message
        </label>
        <textarea
          id="support-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholderByType[type]}
          rows={8}
          maxLength={5000}
          required
          disabled={isPending}
          className={cn(inputClass, "mt-2 resize-y")}
        />
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col-reverse items-stretch justify-between gap-3 pt-2 sm:flex-row sm:items-center">
        <p className="text-xs text-muted-foreground">
          We&apos;ll reply to{" "}
          <span className="font-medium text-foreground">
            {userEmail}
          </span>
          .
        </p>
        <button
          type="submit"
          disabled={isPending}
          className={buttonVariants({ variant: "primary" })}
        >
          <Send aria-hidden className="h-4 w-4" />
          {isPending ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}
