import { AuthLayout } from "@/components/auth-layout";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { SignUpsClosed } from "@/components/auth/sign-ups-closed";
import { SIGNUPS_OPEN } from "@/lib/site";

export default function SignUpPage() {
  return (
    <AuthLayout>{SIGNUPS_OPEN ? <SignUpForm /> : <SignUpsClosed />}</AuthLayout>
  );
}
