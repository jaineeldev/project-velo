"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { EASE_OUT } from "../_lib/shared";

const PRELOADER_HOLD_MS = 2100;
const PRELOADER_SEEN_KEY = "velo-preloader-seen";

// Shows once per session on first marketing-page load. The `onReady` callback
// fires when the preloader resolves, so downstream effects (like GeoNotice)
// don't surface before the first impression lands.
export function Preloader({ onReady }: { onReady?: () => void }) {
  const prefersReduced = useReducedMotion();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (prefersReduced) {
      onReady?.();
      return;
    }
    let seen = false;
    try {
      seen = window.sessionStorage.getItem(PRELOADER_SEEN_KEY) === "1";
    } catch {
      // Private browsing / blocked storage. Treat as unseen.
    }
    if (seen) {
      onReady?.();
      return;
    }
    setShow(true);
    const t = window.setTimeout(() => {
      setShow(false);
      onReady?.();
      try {
        window.sessionStorage.setItem(PRELOADER_SEEN_KEY, "1");
      } catch {
        // ignore
      }
    }, PRELOADER_HOLD_MS);
    return () => window.clearTimeout(t);
  }, [prefersReduced, onReady]);

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          key="preloader"
          role="status"
          aria-label="Loading Velo"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d0d0f]"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: EASE_OUT }}
        >
          <motion.span
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: EASE_OUT }}
            className="inline-flex items-baseline text-6xl font-extrabold leading-none tracking-[-0.04em] text-white sm:text-7xl"
          >
            Velo
            <span className="text-primary">.</span>
          </motion.span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
