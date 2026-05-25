export default function ShareProjectLoading() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="mb-8 h-4 w-32 animate-pulse rounded bg-muted" />

        <div className="mb-10 border-b border-border pb-8">
          <div className="h-3 w-48 animate-pulse rounded bg-muted" />
          <div className="mt-3 flex items-start justify-between gap-3">
            <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-6 w-20 shrink-0 animate-pulse rounded-full bg-muted" />
          </div>
        </div>

        <div>
          <div className="mb-4 h-3 w-32 animate-pulse rounded bg-muted" />
          <ul className="overflow-hidden rounded-lg border border-border">
            {Array.from({ length: 4 }).map((_, i) => (
              <li
                key={i}
                className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 last:border-0"
              >
                <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-12">
          <div className="mb-4 h-3 w-28 animate-pulse rounded bg-muted" />
          <div className="rounded-lg border border-border bg-card px-4 py-4">
            <div className="h-7 w-32 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-3 w-40 animate-pulse rounded bg-muted" />
          </div>
        </div>

        <div className="mt-12">
          <div className="mb-4 h-3 w-24 animate-pulse rounded bg-muted" />
          <ul className="overflow-hidden rounded-lg border border-border">
            {Array.from({ length: 2 }).map((_, i) => (
              <li
                key={i}
                className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 last:border-0"
              >
                <div className="min-w-0 space-y-1.5">
                  <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                </div>
                <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
