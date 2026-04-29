"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

const options = ["light", "dark"] as const;

export function AppearanceToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div className="inline-flex rounded-md border border-neutral-200 p-0.5 dark:border-neutral-800">
      {options.map((opt) => {
        const active = mounted && theme === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => setTheme(opt)}
            className={
              "rounded px-3 py-1 text-sm capitalize transition-colors " +
              (active
                ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
                : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100")
            }
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
