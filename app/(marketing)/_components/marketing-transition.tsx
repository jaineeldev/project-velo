"use client";

import { type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";

export function MarketingTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <>{children}</>;
  }

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
