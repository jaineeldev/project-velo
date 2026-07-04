import { AuthLayout } from "@/components/auth-layout";
import { VerifyEmailView } from "@/components/auth/verify-email-view";

export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { email?: string };
}) {
  return (
    <AuthLayout>
      <VerifyEmailView email={searchParams.email} />
    </AuthLayout>
  );
}
