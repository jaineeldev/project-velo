"use client";

import { useState, useTransition } from "react";
import { cn, focusRing } from "@/lib/utils";
import { dateTimeFmt } from "@/lib/format";

export type ProposalCommentRow = {
  id: string;
  author_role: "client" | "agency";
  body: string;
  created_at: string | Date;
};

type Props = {
  comments: ProposalCommentRow[];
  postAction: (body: string) => Promise<void>;
  canPost: boolean;
  // When canPost is false, this string explains why (e.g. "Comments open once
  // this proposal is sent.")
  disabledReason?: string;
};

const MAX_BODY = 2000;

export function ProposalComments({
  comments,
  postAction,
  canPost,
  disabledReason,
}: Props) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = body.trim();
    if (!trimmed) return;
    if (trimmed.length > MAX_BODY) {
      setError(`Keep it under ${MAX_BODY} characters.`);
      return;
    }
    startTransition(async () => {
      try {
        await postAction(trimmed);
        setBody("");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not post comment.",
        );
      }
    });
  }

  return (
    <div>
      {comments.length > 0 ? (
        <ul className="space-y-3">
          {comments.map((c) => {
            const isClient = c.author_role === "client";
            return (
              <li
                key={c.id}
                className="rounded-md border border-border bg-card p-4"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                      isClient
                        ? "border border-primary/30 bg-primary/10 text-primary"
                        : "border border-border bg-muted text-muted-foreground",
                    )}
                  >
                    {isClient ? "Client" : "Agency"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {dateTimeFmt.format(new Date(c.created_at))}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">
                  {c.body}
                </p>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No comments yet.</p>
      )}

      {canPost ? (
        <form onSubmit={onSubmit} className="mt-5 space-y-2">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Ask a question or add context..."
            rows={3}
            maxLength={MAX_BODY}
            disabled={isPending}
            aria-label="New comment"
            className={cn(
              "block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary",
              focusRing,
            )}
          />
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {body.length}/{MAX_BODY}
            </p>
            <button
              type="submit"
              disabled={isPending || !body.trim()}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50",
                focusRing,
              )}
            >
              {isPending ? "Posting..." : "Post comment"}
            </button>
          </div>
          {error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
        </form>
      ) : disabledReason ? (
        <p className="mt-4 text-xs text-muted-foreground">{disabledReason}</p>
      ) : null}
    </div>
  );
}
