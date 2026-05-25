"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

type Props = {
  statusText: string;
  // Duration of the bar fill in ms. Omit for an indeterminate bar (e.g.
  // when async work has unknown duration).
  fillMs?: number;
  // How long to hold the bar at 100% before calling onComplete.
  holdAfterMs?: number;
  // Fires after the bar's fill animation has actually completed AND the
  // hold-at-full window has elapsed. The host page should navigate here.
  onComplete?: () => void;
};

const BAR_START_DELAY_S = 0.25;

export function AuthPreloader({
  statusText,
  fillMs,
  holdAfterMs = 600,
  onComplete,
}: Props) {
  const determinate = typeof fillMs === "number";
  const completedRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  function handleBarComplete() {
    if (completedRef.current) return;
    completedRef.current = true;
    if (onComplete) {
      timerRef.current = window.setTimeout(onComplete, holdAfterMs);
    }
  }

  return (
    <main
      role="status"
      aria-live="polite"
      aria-label={statusText}
      className="fixed inset-0 z-50 flex min-h-screen flex-col items-center justify-center bg-background px-6"
    >
      <motion.span
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="inline-flex items-baseline text-5xl font-extrabold leading-none tracking-[-0.04em] text-foreground sm:text-6xl"
      >
        Velo
        <span className="text-primary">.</span>
      </motion.span>

      {determinate ? (
        <div
          className="relative mt-8 h-[3px] w-40 overflow-hidden bg-border/80 sm:w-52"
          aria-hidden
        >
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{
              duration: fillMs / 1000,
              ease: "linear",
              delay: BAR_START_DELAY_S,
            }}
            style={{ transformOrigin: "left" }}
            onAnimationComplete={handleBarComplete}
            className="absolute inset-0 bg-primary"
          />
        </div>
      ) : (
        <div
          className="relative mt-8 h-[3px] w-40 overflow-hidden bg-border/80 sm:w-52"
          aria-hidden
        >
          <motion.div
            animate={{ x: ["-40%", "140%"] }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-y-0 w-1/3 bg-primary"
          />
        </div>
      )}

      <motion.p
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mt-5 max-w-[20rem] text-balance text-center text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground"
      >
        {statusText}
      </motion.p>
    </main>
  );
}
