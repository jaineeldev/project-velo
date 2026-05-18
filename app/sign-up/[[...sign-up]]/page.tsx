import { AuthLayout } from "@/components/auth-layout";
import { ConsentGate } from "./consent-gate";

export default function SignUpPage() {
  return (
    <AuthLayout>
      <div className="flex w-full flex-col items-center">
        <ConsentGate />
      </div>
    </AuthLayout>
  );
}
