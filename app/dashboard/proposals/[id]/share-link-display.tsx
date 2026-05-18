"use client";

import { useState } from "react";
import { cn, focusRing } from "@/lib/utils";

export function ShareLinkDisplay({
  proposal,
}: {
  proposal: { share_token: string };
}) {
  const [copied, setCopied] = useState(false);

  const token = proposal.share_token;
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/share/proposal/${token}`
      : `/share/proposal/${token}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(
      `${window.location.origin}/share/proposal/${token}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-2">
      <input
        readOnly
        value={url}
        className="w-80 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400"
      />
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? "Link copied" : "Copy share link"}
        className={cn(
          "shrink-0 rounded-md border border-neutral-200 px-3.5 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-900",
          focusRing,
        )}
      >
        {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}
