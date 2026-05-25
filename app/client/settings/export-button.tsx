"use client";

import { Download } from "lucide-react";
import { cn, focusRing } from "@/lib/utils";

export function ExportButton() {
  return (
    <a
      href="/api/client/export"
      download
      className={cn(
        "inline-flex items-center gap-2 rounded-md border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
        focusRing,
      )}
    >
      <Download aria-hidden className="h-4 w-4" />
      Download JSON
    </a>
  );
}
