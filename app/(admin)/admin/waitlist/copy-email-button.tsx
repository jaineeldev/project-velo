"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn, focusRing } from "@/lib/utils";

type Props = { email: string };

// Per-row clipboard copy button. Falls back to a no-op if the
// Clipboard API is missing (older Safari, file:// previews) rather
// than crashing the page. "Copied" feedback fades after 1.2s.

export function CopyEmailButton({ email }: Props) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1200);
    return () => clearTimeout(t);
  }, [copied]);

  async function onCopy() {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
    } catch {
      // Permissions or transient failure. Nothing to surface here.
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={`Copy ${email} to clipboard`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground",
        focusRing,
      )}
    >
      {copied ? (
        <>
          <Check aria-hidden className="h-3.5 w-3.5 text-success" />
          Copied
        </>
      ) : (
        <>
          <Copy aria-hidden className="h-3.5 w-3.5" />
          Copy
        </>
      )}
    </button>
  );
}
