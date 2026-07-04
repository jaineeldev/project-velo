import { AuthLayout } from "@/components/auth-layout";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

// app/auth/callback/route.ts already exchanged the emailed code for a
// session before redirecting here — ResetPasswordForm checks for that
// session client-side rather than reading a token from the URL.
export default function ResetPasswordPage() {
  return (
    <AuthLayout>
      <ResetPasswordForm />
    </AuthLayout>
  );
}
