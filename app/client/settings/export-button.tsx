"use client";

import { Download } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function ExportButton() {
  return (
    <a
      href="/api/client/export"
      download
      className={buttonVariants({ variant: "secondary" })}
    >
      <Download aria-hidden className="h-4 w-4" />
      Download JSON
    </a>
  );
}
