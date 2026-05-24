"use client";

import { motion, useScroll } from "framer-motion";

// Hairline scroll progress indicator. Functional, not decorative — tracks
// reading position across the page.
export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      aria-hidden
      style={{ scaleX: scrollYProgress }}
      className="fixed inset-x-0 top-0 z-[60] h-px origin-left bg-primary/70"
    />
  );
}
