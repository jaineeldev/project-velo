import { trustItems } from "../_lib/data";

// Trust row, dark surface. Leads with a live-status chip so the brand's
// emerald 'approved' colour anchors the strip; the rest of the items
// separate with the existing primary dots.
export function TrustStrip() {
  return (
    <div className="border-y border-white/[0.06] bg-[#0d0d0f]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-7 gap-y-3 px-6 py-6 text-[11px] font-medium uppercase tracking-[0.22em] text-white/60 sm:px-10">
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-400">
          <span
            aria-hidden
            className="relative flex h-1.5 w-1.5"
          >
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          Early beta
        </span>
        {trustItems.map((item, i) => (
          <span key={item} className="flex items-center gap-7">
            <span>{item}</span>
            {i < trustItems.length - 1 ? (
              <span
                aria-hidden
                className="h-1 w-1 rounded-full bg-primary"
              />
            ) : null}
          </span>
        ))}
      </div>
    </div>
  );
}
