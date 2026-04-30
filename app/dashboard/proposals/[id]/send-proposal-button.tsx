"use client";

import { useState, useTransition } from "react";
import { sendProposal } from "../actions";

type State =
  | { phase: "idle" }
  | { phase: "sending" }
  | { phase: "sent"; token: string }
  | { phase: "error"; message: string };

export function SendProposalButton({ proposalId }: { proposalId: string }) {
  const [state, setState] = useState<State>({ phase: "idle" });
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSend() {
    setState({ phase: "sending" });
    startTransition(async () => {
      try {
        const token = await sendProposal(proposalId);
        setState({ phase: "sent", token });
      } catch (err) {
        setState({
          phase: "error",
          message: err instanceof Error ? err.message : "Something went wrong.",
        });
      }
    });
  }

  async function handleCopy(token: string) {
    const url = `${window.location.origin}/share/proposal/${token}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (state.phase === "idle") {
    return (
      <button
        type="button"
        onClick={handleSend}
        disabled={isPending}
        className="rounded-md bg-neutral-900 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
      >
        Send to client
      </button>
    );
  }

  if (state.phase === "sending") {
    return (
      <button
        type="button"
        disabled
        className="rounded-md bg-neutral-900 px-3.5 py-2 text-sm font-medium text-white opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
      >
        Sending…
      </button>
    );
  }

  if (state.phase === "error") {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </span>
        <button
          type="button"
          onClick={() => setState({ phase: "idle" })}
          className="text-sm text-neutral-500 underline underline-offset-2 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          Try again
        </button>
      </div>
    );
  }

  // Sent — show the shareable link
  const url = `${typeof window !== "undefined" ? window.location.origin : ""}/share/proposal/${state.token}`;
  return (
    <div className="flex items-center gap-2">
      <input
        readOnly
        value={url}
        className="w-80 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400"
      />
      <button
        type="button"
        onClick={() => handleCopy(state.token)}
        className="shrink-0 rounded-md border border-neutral-200 px-3.5 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-900"
      >
        {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}
