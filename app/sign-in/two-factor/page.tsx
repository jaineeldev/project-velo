import { AuthLayout } from "@/components/auth-layout";
import { TwoFactorForm } from "@/components/auth/two-factor-form";

export default function TwoFactorPage() {
  return (
    <AuthLayout>
      <TwoFactorForm />
    </AuthLayout>
  );
}
