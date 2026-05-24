import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

// Shared two-column roadmap list used on /features and /security. Each item
// shows a Clock icon, a feature name, and a small target-quarter pill so the
// section reads as a plan with dates rather than a list of missing things.

export type RoadmapItem = {
  label: string;
  quarter: string;
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
      {items.map(({ label, quarter }) => (
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
          <span className="shrink-0 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
            {quarter}
          </span>
        </li>
      ))}
    </ul>
  );
}
