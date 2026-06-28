"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { EASE_OUT } from "../_lib/shared";

const BAR_START_DELAY_MS = 350;
const BAR_FILL_MS = 1600;
const BAR_FULL_HOLD_MS = 600;
const FADE_OUT_MS = 500;
const PRELOADER_SEEN_KEY = "velo-preloader-seen";

const TAGLINES = [
  "Built in Brisbane.",
  "Side of the desk.",
  "For devs who hate freelance admin.",
  "Pre-launch and still rough. That's the point.",
  "AU-only for now.",
];

// Shows once per session on first marketing-page load. Now lives on the warm
// canvas surface, matched to the rest of the marketing site.
export function Preloader({ onReady }: { onReady?: () => void }) {
  const prefersReduced = useReducedMotion();
  const [show, setShow] = useState(false);
  const [tagline, setTagline] = useState("");
  const dismissTimerRef = useRef<number | null>(null);
  const barCompletedRef = useRef(false);

  useEffect(() => {
    if (prefersReduced) {
      onReady?.();
      return;
    }
    let seen = false;
    try {
      seen = window.sessionStorage.getItem(PRELOADER_SEEN_KEY) === "1";
    } catch {
      // ignore
    }
    if (seen) {
      onReady?.();
      return;
    }
    setTagline(TAGLINES[Math.floor(Math.random() * TAGLINES.length)]);
    setShow(true);
    try {
      window.sessionStorage.setItem(PRELOADER_SEEN_KEY, "1");
    } catch {
      // ignore
    }

    return () => {
      if (dismissTimerRef.current !== null) {
        window.clearTimeout(dismissTimerRef.current);
      }
    };
  }, [prefersReduced, onReady]);

  function handleBarComplete() {
    if (barCompletedRef.current) return;
    barCompletedRef.current = true;
    dismissTimerRef.current = window.setTimeout(() => {
      setShow(false);
      onReady?.();
    }, BAR_FULL_HOLD_MS);
  }

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          key="preloader"
          role="status"
          aria-label="Loading Velo"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0A0A0A]"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: FADE_OUT_MS / 1000, ease: EASE_OUT }}
        >
          <motion.span
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: EASE_OUT }}
            className="inline-flex items-baseline font-display text-6xl font-black leading-none tracking-[-0.05em] text-white sm:text-7xl"
          >
            Velo
            <span className="text-[#4F7EF7]">.</span>
          </motion.span>

          <div
            className="relative mt-10 h-[2px] w-44 overflow-hidden bg-[#2A2A2A] sm:w-56"
            aria-hidden
          >
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{
                duration: BAR_FILL_MS / 1000,
                ease: "linear",
                delay: BAR_START_DELAY_MS / 1000,
              }}
              style={{ transformOrigin: "left" }}
              onAnimationComplete={handleBarComplete}
              className="absolute inset-0 bg-[#4F7EF7]"
            />
          </div>

          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6, ease: EASE_OUT }}
            className="mt-5 max-w-[20rem] text-balance text-center font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[#555]"
          >
            {tagline}
          </motion.p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
