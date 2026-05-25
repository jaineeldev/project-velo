export default function ShareProposalLoading() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="mb-8 h-4 w-32 animate-pulse rounded bg-muted" />

        <div className="mb-10 border-b border-border pb-8">
          <div className="h-3 w-48 animate-pulse rounded bg-muted" />
          <div className="mt-3 h-8 w-3/4 animate-pulse rounded bg-muted" />
          <div className="mt-5 space-y-2">
            <div className="h-3 w-full animate-pulse rounded bg-muted" />
            <div className="h-3 w-11/12 animate-pulse rounded bg-muted" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
          </div>
        </div>

        <div>
          <div className="mb-4 h-3 w-32 animate-pulse rounded bg-muted" />
          <div className="overflow-hidden rounded-lg border border-border">
            <div className="border-b border-border bg-muted px-4 py-2.5">
              <div className="h-3 w-full animate-pulse rounded bg-muted-foreground/20" />
            </div>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_4rem_7rem_6rem] gap-3 border-b border-border px-4 py-3.5 last:border-0"
              >
                <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-3 w-6 animate-pulse rounded bg-muted" />
                <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                <div className="ml-auto h-3 w-14 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 ml-auto w-56 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="h-3 w-20 animate-pulse rounded bg-muted" />
              <div className="h-3 w-16 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <div className="h-5 w-32 animate-pulse rounded bg-muted" />
          <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-muted" />
          <div className="mt-6 flex gap-3">
            <div className="h-12 flex-1 animate-pulse rounded-lg bg-muted" />
            <div className="h-12 flex-1 animate-pulse rounded-lg bg-muted" />
          </div>
        </div>
      </div>
    </main>
  );
}
