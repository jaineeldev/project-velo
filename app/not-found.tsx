import Link from "next/link";
import { Compass } from "lucide-react";
import { cn, focusRing } from "@/lib/utils";

export const metadata = {
  title: "Page not found · whereismyapp",
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center px-6 py-4">
          <Link
            href="/"
            aria-label="whereismyapp home"
            className={cn("flex items-center gap-2.5 rounded", focusRing)}
          >
            <span
              aria-hidden
              className="h-2 w-2 rounded-full bg-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.18)]"
            />
            <span className="text-sm font-semibold tracking-tight text-foreground">
              whereismyapp
            </span>
          </Link>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Compass aria-hidden className="h-6 w-6 text-primary" />
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            404
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            Page not found
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The page you're looking for doesn't exist or may have moved. If you
            arrived from a shared link, ask the sender for an updated one.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className={cn(
                "rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
                focusRing,
              )}
            >
              Back home
            </Link>
            <Link
              href="/dashboard"
              className={cn(
                "rounded-md border border-border px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
                focusRing,
              )}
            >
              Go to dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
