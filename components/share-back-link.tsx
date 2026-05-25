import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn, focusRing } from "@/lib/utils";

// Resolved server-side by the caller (which already knows the viewer's
// role). Renders nothing for anonymous viewers since they have no
// dashboard to go back to.
export function ShareBackLink({ href }: { href: string | null }) {
  if (!href) return null;
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 rounded text-xs font-medium text-muted-foreground transition-colors hover:text-foreground",
        focusRing,
      )}
    >
      <ArrowLeft aria-hidden className="h-3.5 w-3.5" />
      Back to dashboard
    </Link>
  );
}
