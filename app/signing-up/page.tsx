"use client";

import { useRouter } from "next/navigation";
import { AuthPreloader } from "@/components/auth-preloader";

export default function SigningUpPage() {
  const router = useRouter();

  return (
    <AuthPreloader
      statusText="Setting up your workspace"
      fillMs={1600}
      holdAfterMs={700}
      onComplete={() => router.replace("/dashboard")}
    />
  );
}
