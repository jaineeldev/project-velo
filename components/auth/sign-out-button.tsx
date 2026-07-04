"use client";

import { cloneElement, isValidElement, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/auth-client";

type Props = {
  children: ReactElement<{ onClick?: () => void }>;
  redirectUrl?: string;
};

// Minimal drop-in for Clerk's <SignOutButton> - clones the child element
// (typically a <button>) and wires an onClick that signs out of Supabase
// then navigates. Kept as a shared component since a handful of surfaces
// (admin sidebar, suspended page) render sign-out as a plain child button
// rather than owning their own handler the way the app/client sidebars do.
export function SignOutButton({ children, redirectUrl = "/sign-in" }: Props) {
  const router = useRouter();

  async function handleClick() {
    await supabase.auth.signOut();
    router.push(redirectUrl);
  }

  if (!isValidElement(children)) return children;
  return cloneElement(children, { onClick: handleClick });
}
