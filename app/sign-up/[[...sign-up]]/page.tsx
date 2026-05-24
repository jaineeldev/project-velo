import { AuthLayout } from "@/components/auth-layout";
import { ConsentGate } from "@/components/auth/consent-gate";

export default function SignUpPage() {
  return (
    <AuthLayout>
      <div className="flex w-full flex-col items-center">
        <ConsentGate />
      </div>
    </AuthLayout>
  );
}
