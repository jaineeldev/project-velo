import Link from "next/link";
import { cn, focusRing } from "@/lib/utils";

export const metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of Velo.",
};

const linkClass = "text-primary hover:underline";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            aria-label="Velo home"
            className={cn("flex items-center gap-2.5 rounded", focusRing)}
          >
            <span
              aria-hidden
              className="h-2 w-2 rounded-full bg-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.18)]"
            />
            <span className="text-sm font-semibold tracking-tight text-foreground">
              Velo
            </span>
          </Link>
          <Link
            href="/"
            className={cn(
              "inline-flex items-center gap-1 rounded text-sm text-muted-foreground transition-colors hover:text-foreground",
              focusRing,
            )}
          >
            ← Back
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-12">
        <article className="prose prose-neutral max-w-none dark:prose-invert">
          <h1>Terms of Service</h1>
          <p>
            Our full terms of service will be available shortly. For any
            questions please contact us at{" "}
            <a href="mailto:jaineelk.dev@gmail.com" className={linkClass}>
              jaineelk.dev@gmail.com
            </a>
            .
          </p>
        </article>
      </div>
    </main>
  );
}
