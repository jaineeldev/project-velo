export default function ClientDashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10 sm:py-16">
      <div className="h-9 w-72 animate-pulse rounded bg-muted sm:h-10" />
      <div className="mt-3 h-4 w-56 animate-pulse rounded bg-muted" />

      <div className="mt-8 h-[68px] animate-pulse rounded-lg bg-muted/60" />

      <div className="mt-12 space-y-16">
        <Section />
        <Section />
      </div>
    </div>
  );
}

function Section() {
  return (
    <section>
      <div className="mb-4 h-3 w-32 animate-pulse rounded bg-muted" />
      <ul className="overflow-hidden rounded-lg border border-border bg-card">
        {Array.from({ length: 3 }).map((_, i) => (
          <li
            key={i}
            className="border-b border-border px-7 py-6 last:border-0"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
              </div>
              <div className="h-5 w-20 shrink-0 animate-pulse rounded-full bg-muted" />
            </div>
            <div className="mt-4 flex items-end justify-between gap-4">
              <div className="h-3 w-24 animate-pulse rounded bg-muted" />
              <div className="space-y-1.5 text-right">
                <div className="ml-auto h-4 w-20 animate-pulse rounded bg-muted" />
                <div className="ml-auto h-2.5 w-14 animate-pulse rounded bg-muted" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
