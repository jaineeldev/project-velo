"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/auth-client";

// Client-side equivalent of Clerk's `useUser()` — same `{ user, isLoaded }`
// shape so call sites migrating off Clerk stay a small diff. Supabase-js has
// no built-in React hook for this; `onAuthStateChange` fires immediately on
// mount with the current session (in addition to on every subsequent
// sign-in/sign-out), so a single subscription covers both the initial load
// and live updates.
export function useSupabaseUser(): { user: User | null; isLoaded: boolean } {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoaded(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  return { user, isLoaded };
}
