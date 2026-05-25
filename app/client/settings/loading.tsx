export default function ClientSettingsLoading() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10 sm:py-16">
      <div className="h-9 w-40 animate-pulse rounded bg-muted sm:h-10" />
      <div className="mt-3 h-4 w-64 animate-pulse rounded bg-muted" />

      {Array.from({ length: 4 }).map((_, i) => (
        <section
          key={i}
          className="mt-10 border-t border-border pt-8"
        >
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-3 w-3/4 animate-pulse rounded bg-muted" />
          <div className="mt-6 h-24 animate-pulse rounded-lg bg-muted/60" />
        </section>
      ))}
    </div>
  );
}
