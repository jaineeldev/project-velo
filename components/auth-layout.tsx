export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen lg:grid lg:grid-cols-[1.1fr_1fr]">
      {/* Left — fixed dark hero panel. The `dark` class locks this subtree into
          the dark theme regardless of the user's global preference, so the
          marketing side keeps a consistent identity in both modes. */}
      <aside className="dark relative hidden flex-col justify-between overflow-hidden bg-neutral-950 p-12 text-neutral-100 lg:flex lg:p-14">
        {/* Faint radial-gradient dot grid — full coverage, just enough to
            break up the flat black */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />

        {/* Soft glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 -top-40 h-[28rem] w-[28rem] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.07), transparent 70%)",
          }}
        />

        {/* Top — app mark */}
        <div className="relative z-10 flex items-center gap-2.5">
          <span className="block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.55)]" />
          <span className="text-xs font-medium uppercase tracking-[0.22em] text-neutral-300">
            whereismyapp
          </span>
        </div>

        {/* Middle — tagline */}
        <div className="relative z-10 max-w-md">
          <h1 className="text-[2.75rem] font-semibold leading-[1.05] tracking-tight text-neutral-50">
            From proposal
            <br />
            to paid.
          </h1>
          <p className="mt-6 text-[15px] leading-relaxed text-neutral-400">
            whereismyapp turns a signed proposal into a project, milestones, and
            invoices automatically — so you can spend more time shipping and
            less on the busywork.
          </p>

          <ul className="mt-10 space-y-2.5 text-[13px] text-neutral-400">
            <li className="flex items-center gap-3">
              <span aria-hidden className="text-neutral-600">
                →
              </span>
              Proposals that auto-create projects
            </li>
            <li className="flex items-center gap-3">
              <span aria-hidden className="text-neutral-600">
                →
              </span>
              Client portals with no login required
            </li>
            <li className="flex items-center gap-3">
              <span aria-hidden className="text-neutral-600">
                →
              </span>
              Invoicing built in
            </li>
          </ul>
        </div>

        {/* Bottom — meta */}
        <div className="relative z-10 border-t border-white/10 pt-6 text-xs text-neutral-500">
          © 2026 whereismyapp
        </div>
      </aside>

      {/* Right — theme-aware widget panel */}
      <section className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-6 py-12 dark:bg-neutral-950">
        {/* Mobile-only mark (left panel is hidden under lg) */}
        <div className="mb-8 flex items-center gap-2.5 lg:hidden">
          <span className="block h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="text-xs font-medium uppercase tracking-[0.22em] text-neutral-500 dark:text-neutral-400">
            whereismyapp
          </span>
        </div>
        {children}
      </section>
    </main>
  );
}
