import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between gap-4 px-6 py-6 sm:px-10 sm:py-8">
        <Link
          href="/"
          aria-label="Velo home"
          className="rounded-sm font-display text-lg font-black tracking-tight text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Velo
        </Link>

        <Link
          href="/"
          className="group inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all duration-200 hover:border-foreground/20 hover:text-foreground motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <ArrowLeft
            aria-hidden
            className="h-3.5 w-3.5 transition-transform duration-200 motion-safe:group-hover:-translate-x-0.5"
          />
          Back to homepage
        </Link>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-12">
        {children}
      </div>

      <footer className="px-6 py-6 sm:px-10">
        <p className="text-center font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
          Waitlist only &middot; Public beta coming
        </p>
      </footer>
    </main>
  );
}
