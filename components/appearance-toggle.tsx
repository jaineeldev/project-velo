"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { cn, focusRing } from "@/lib/utils";

const options = ["light", "dark"] as const;

export function AppearanceToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div className="inline-flex rounded-md border border-border p-0.5">
      {options.map((opt) => {
        const active = mounted && theme === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => setTheme(opt)}
            aria-pressed={active}
            aria-label={`Use ${opt} theme`}
            className={cn(
              "rounded px-3 py-1 text-sm capitalize transition-colors",
              active
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:text-foreground",
              focusRing,
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
