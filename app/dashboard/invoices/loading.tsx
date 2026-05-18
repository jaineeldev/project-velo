import { Card } from "@/components/ui/card";

export default function InvoicesLoading() {
  return (
    <div className="px-10 py-12">
      <header className="flex items-center justify-between">
        <div className="h-7 w-28 animate-pulse rounded bg-muted" />
      </header>

      <Card className="mt-10 overflow-hidden">
        <ul className="divide-y divide-border">
          {Array.from({ length: 6 }).map((_, i) => (
            <li
              key={i}
              className="flex items-center gap-4 px-5 py-4"
            >
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
                <div className="h-3 w-1/4 animate-pulse rounded bg-muted" />
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
                <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
                <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                <div className="h-3 w-24 animate-pulse rounded bg-muted" />
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
