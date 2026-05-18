export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      {/* Brand mark — top-left */}
      <header className="px-6 py-6 sm:px-10 sm:py-8">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5" aria-hidden>
            <span className="absolute inset-0 inline-flex h-full w-full rounded-full bg-primary opacity-60 motion-safe:animate-ping" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.6)]" />
          </span>
          <span className="font-mono text-[13px] uppercase tracking-[0.22em] text-foreground">
            Velo
          </span>
        </div>
      </header>

      {/* Centered widget */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-12">
        {children}
      </div>
    </main>
  );
}
