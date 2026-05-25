import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { AuthLayout } from "@/components/auth-layout";
import { cn, focusRing } from "@/lib/utils";

export default function SignInPage() {
  return (
    <AuthLayout>
      <div className="flex w-full flex-col items-center">
        <SignIn
          forceRedirectUrl="/signing-in"
          appearance={{
            elements: {
              card: "!border-neutral-300 dark:!border-neutral-700 [box-shadow:none!important]",
              cardBox: "[box-shadow:none!important]",
              rootBox: "[box-shadow:none!important]",
            },
          }}
        />
        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link
            href="/terms"
            className={cn(
              "rounded hover:text-foreground hover:underline",
              focusRing,
            )}
          >
            Terms of Service
          </Link>
          <span aria-hidden className="mx-2">
            ·
          </span>
          <Link
            href="/privacy"
            className={cn(
              "rounded hover:text-foreground hover:underline",
              focusRing,
            )}
          >
            Privacy Policy
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
