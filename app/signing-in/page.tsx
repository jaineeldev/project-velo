"use client";

import { useRouter } from "next/navigation";
import { AuthPreloader } from "@/components/auth-preloader";

export default function SigningInPage() {
  const router = useRouter();

  return (
    <AuthPreloader
      statusText="Welcome back"
      fillMs={1300}
      holdAfterMs={600}
      onComplete={() => router.replace("/dashboard")}
    />
  );
}
