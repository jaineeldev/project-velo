import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export type RoadmapItem = {
  label: string;
};

export function RoadmapList({
  items,
  className,
}: {
  items: RoadmapItem[];
  className?: string;
}) {
  return (
    <ul className={cn("grid gap-3 sm:grid-cols-2 sm:gap-4", className)}>
      {items.map(({ label }) => (
        <li
          key={label}
          className="flex items-center gap-4 rounded-xl border border-white/[0.08] bg-white/[0.02] px-5 py-4"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
            <Clock aria-hidden className="h-4 w-4" strokeWidth={2} />
          </span>
          <span className="min-w-0 flex-1 text-sm font-semibold text-white sm:text-base">
            {label}
          </span>
        </li>
      ))}
    </ul>
  );
}
