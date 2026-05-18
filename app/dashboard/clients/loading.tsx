export default function ClientsLoading() {
  return (
    <div className="px-10 py-12">
      <header className="flex items-center justify-between">
        <div className="h-7 w-24 animate-pulse rounded bg-muted" />
        <div className="h-9 w-28 animate-pulse rounded-md bg-muted" />
      </header>

      <ul className="mt-10 divide-y divide-border border-t border-border">
        {Array.from({ length: 6 }).map((_, i) => (
          <li
            key={i}
            className="flex items-center justify-between py-4"
          >
            <div className="min-w-0 space-y-2">
              <div className="h-4 w-48 animate-pulse rounded bg-muted" />
              <div className="h-3 w-64 animate-pulse rounded bg-muted" />
            </div>
            <div className="ml-4 flex shrink-0 items-center gap-4">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-8 w-8 animate-pulse rounded-md bg-muted" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
