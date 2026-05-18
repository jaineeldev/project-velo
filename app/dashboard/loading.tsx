import { Card, CardContent } from "@/components/ui/card";

// Shown while the dashboard's data fetches resolve. Layout mirrors the real
// page so the loaded view doesn't shift, and Tailwind's `animate-pulse` gives
// each placeholder block a subtle breathing animation.
export default function DashboardLoading() {
  return (
    <div className="px-10 py-12">
      <header>
        <div className="h-7 w-64 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-4 w-40 animate-pulse rounded bg-muted" />
      </header>

      <section className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="shadow-md">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="h-12 w-12 shrink-0 animate-pulse rounded-lg bg-muted" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                <div className="h-8 w-12 animate-pulse rounded bg-muted" />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-10">
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
        <Card className="mt-4 overflow-hidden">
          <ul className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <li key={i} className="flex items-center gap-4 px-5 py-3.5">
                <div className="h-8 w-8 shrink-0 animate-pulse rounded-md bg-muted" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                </div>
                <div className="h-3 w-16 animate-pulse rounded bg-muted" />
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}
