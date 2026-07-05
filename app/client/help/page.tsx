import Link from "next/link";
import { Mail, FileText, ShieldCheck } from "lucide-react";
import { cn, focusRing } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export default function ClientHelpPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Help
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Questions about a proposal, project, or invoice? Start with the agency
        that shared the work with you. For anything about Velo itself, the
        contact below reaches me directly.
      </p>

      <section className="mt-10 border-t border-border pt-8">
        <h2 className="text-base font-medium text-foreground">
          Questions about your work
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The agency you&apos;re working with is the right first stop. Their
          name shows on each proposal and project on your dashboard.
        </p>
      </section>

      <section className="mt-10 border-t border-border pt-8">
        <h2 className="text-base font-medium text-foreground">
          Questions about Velo
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          If something looks broken, or you want to flag a security concern,
          reach me directly.
        </p>
        <a
          href="mailto:jaineelk.dev@gmail.com"
          className={cn(buttonVariants({ variant: "secondary" }), "mt-4")}
        >
          <Mail aria-hidden className="h-4 w-4" />
          jaineelk.dev@gmail.com
        </a>
      </section>

      <section className="mt-10 border-t border-border pt-8">
        <h2 className="text-base font-medium text-foreground">
          Reference
        </h2>
        <ul className="mt-4 space-y-2">
          <li>
            <Link
              href="/privacy"
              className={cn(
                "group flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-all duration-200 hover:border-foreground/20 hover:bg-accent motion-safe:hover:-translate-y-0.5",
                focusRing,
              )}
            >
              <ShieldCheck
                aria-hidden
                className="mt-0.5 h-4 w-4 text-muted-foreground"
              />
              <span className="flex-1">
                <span className="block text-sm font-medium text-foreground">
                  Privacy policy
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  What Velo stores about you and what it doesn&apos;t.
                </span>
              </span>
            </Link>
          </li>
          <li>
            <Link
              href="/terms"
              className={cn(
                "group flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-all duration-200 hover:border-foreground/20 hover:bg-accent motion-safe:hover:-translate-y-0.5",
                focusRing,
              )}
            >
              <FileText
                aria-hidden
                className="mt-0.5 h-4 w-4 text-muted-foreground"
              />
              <span className="flex-1">
                <span className="block text-sm font-medium text-foreground">
                  Terms of service
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  The rules for using your client account.
                </span>
              </span>
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
