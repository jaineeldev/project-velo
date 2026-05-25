"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { cn, focusRing } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ClientSidebarContent } from "./client-sidebar";

export function ClientMobileNav({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-card px-4",
        className,
      )}
    >
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            aria-label="Open navigation menu"
            className={cn(
              "-ml-2 flex h-10 w-10 items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent",
              focusRing,
            )}
          >
            <Menu aria-hidden className="h-5 w-5" />
          </button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-60 border-r border-border bg-card p-0"
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <ClientSidebarContent onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className="h-2 w-2 rounded-full bg-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.18)]"
        />
        <span className="text-sm font-semibold tracking-tight text-foreground">
          Velo
        </span>
      </div>
    </div>
  );
}
