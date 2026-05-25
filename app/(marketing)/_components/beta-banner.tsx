import { cn, focusRing } from "@/lib/utils";

// Top-of-page beta strip. Lives in every marketing page so the early-beta
// status is never hidden. One small primary dot marks a real, live state.
export function BetaBanner() {
  return (
    <div className="bg-[#0d0d0f]">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-6 py-2 text-xs text-white/60 sm:px-10">
        <span
          aria-hidden
          className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
        />
        <span className="text-center">
          <span className="font-medium text-white/90">
            Velo is in early beta
          </span>
          <span>. Expect rough edges. </span>
          <a
            href="mailto:hello@velo.app"
            className={cn(
              "rounded-sm font-medium text-primary underline-offset-2 hover:underline",
              focusRing,
            )}
          >
            Tell me what breaks
          </a>
        </span>
      </div>
    </div>
  );
}
