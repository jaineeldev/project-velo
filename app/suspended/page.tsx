import Link from "next/link";
import { redirect } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";
import { ShieldOff } from "lucide-react";
import { getOrCreateUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import { cn, focusRing } from "@/lib/utils";

export const dynamic = "force-dynamic";

// Landing page for suspended accounts. Layouts redirect here when
// user_profiles.suspended_at is set. If the row is later cleared by an
// operator, this page bounces the user back to their dashboard so they
// don't get stuck on a stale tab.

export default async function SuspendedPage() {
  const user = await getOrCreateUser();

  const rows = await sql`
    SELECT suspended_at, role
    FROM user_profiles
    WHERE user_id = ${user.id}
  `;
  const profile = rows[0] as
    | { suspended_at: string | null; role: "agency" | "client" | null }
    | undefined;

  if (!profile?.suspended_at) {
    redirect(profile?.role === "client" ? "/client/dashboard" : "/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
          <ShieldOff aria-hidden className="h-7 w-7 text-destructive" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-foreground">
          Your account has been suspended
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Access to Velo has been paused by an operator. If you think this is a
          mistake, reply to your last email from us or write to{" "}
          <a
            href="mailto:jaineelk.dev@gmail.com"
            className="text-foreground underline underline-offset-4"
          >
            jaineelk.dev@gmail.com
          </a>
          .
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <SignOutButton>
            <button
              type="button"
              className={cn(
                "rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent/60",
                focusRing,
              )}
            >
              Sign out
            </button>
          </SignOutButton>
          <Link
            href="/"
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
              focusRing,
            )}
          >
            Back to site
          </Link>
        </div>
      </div>
    </div>
  );
}
