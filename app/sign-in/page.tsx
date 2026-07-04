import { AuthLayout } from "@/components/auth-layout";
import { SignInForm } from "@/components/auth/sign-in-form";

export default function SignInPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <AuthLayout>
      <SignInForm initialError={searchParams.error} />
    </AuthLayout>
  );
}
