"use client";

import { useState } from "react";
import { cn, focusRing } from "@/lib/utils";

export function PortalLinkDisplay({ shareToken }: { shareToken: string }) {
  const [copied, setCopied] = useState(false);

  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/share/project/${shareToken}`
      : `/share/project/${shareToken}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(
      `${window.location.origin}/share/project/${shareToken}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-2">
      <input
        readOnly
        value={url}
        className="w-80 rounded-md border border-input bg-card px-3 py-2 text-sm text-muted-foreground"
      />
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? "Link copied" : "Copy portal link"}
        className={cn(
          "shrink-0 rounded-md border border-input bg-background px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
          focusRing,
        )}
      >
        {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}
