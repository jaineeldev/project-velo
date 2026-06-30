"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { EASE_OUT } from "../_lib/shared";

const BAR_START_DELAY_MS = 350;
const BAR_FILL_MS = 1800;
const BAR_FULL_HOLD_MS = 500;
const FADE_OUT_MS = 500;
const TAGLINE_START_DELAY_MS = 600;
const TAGLINE_TYPE_MS = 28;
const PRELOADER_SEEN_KEY = "velo-preloader-seen";

const TAGLINES = [
  "Built in Brisbane.",
  "Side of the desk.",
  "For devs who hate freelance admin.",
  "Pre-launch and still rough. That's the point.",
  "AU-only for now.",
];

const WORDMARK = ["V", "e", "l", "o"] as const;

// Shows once per session on first marketing-page load.
export function Preloader({ onReady }: { onReady?: () => void }) {
  const prefersReduced = useReducedMotion();
  const [show, setShow] = useState(false);
  const [tagline, setTagline] = useState("");
  const [typedTagline, setTypedTagline] = useState("");
  const [progress, setProgress] = useState(0);
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

  useEffect(() => {
    if (!show) return;
    let frame = 0;
    const startAt = performance.now() + BAR_START_DELAY_MS;
    const endAt = startAt + BAR_FILL_MS;
    function tick(now: number) {
      if (now < startAt) {
        frame = requestAnimationFrame(tick);
        return;
      }
      if (now >= endAt) {
        setProgress(100);
        return;
      }
      setProgress(((now - startAt) / BAR_FILL_MS) * 100);
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [show]);

  useEffect(() => {
    if (!show || !tagline) return;
    let i = 0;
    let timer: number | null = null;
    const kickoff = window.setTimeout(() => {
      function type() {
        i += 1;
        setTypedTagline(tagline.slice(0, i));
        if (i < tagline.length) {
          timer = window.setTimeout(type, TAGLINE_TYPE_MS);
        }
      }
      type();
    }, TAGLINE_START_DELAY_MS);
    return () => {
      window.clearTimeout(kickoff);
      if (timer !== null) window.clearTimeout(timer);
    };
  }, [show, tagline]);

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
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#0A0A0A]"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: FADE_OUT_MS / 1000, ease: EASE_OUT }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-overlay"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            }}
          />

          <motion.div
            className="relative inline-flex items-baseline font-display text-6xl font-black leading-[0.95] tracking-[-0.05em] text-white sm:text-7xl"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.08, delayChildren: 0.1 },
              },
            }}
          >
            {WORDMARK.map((letter, i) => (
              <span
                key={i}
                className="inline-block overflow-hidden align-bottom"
              >
                <motion.span
                  className="inline-block"
                  variants={{
                    hidden: { y: "110%", opacity: 0 },
                    visible: {
                      y: 0,
                      opacity: 1,
                      transition: { duration: 0.55, ease: EASE_OUT },
                    },
                  }}
                >
                  {letter}
                </motion.span>
              </span>
            ))}
            <motion.span
              className="ml-0.5 inline-block text-[#4F7EF7]"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.5,
                delay: 0.55,
                ease: [0.34, 1.56, 0.64, 1],
              }}
            >
              .
            </motion.span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.4,
              delay: BAR_START_DELAY_MS / 1000,
              ease: EASE_OUT,
            }}
            className="relative mt-10 flex flex-col items-center"
          >
            <span
              className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.32em] text-[#555] tabular-nums"
              aria-hidden
            >
              Loading {String(Math.round(progress)).padStart(3, "0")}
              <span className="text-[#444]">%</span>
            </span>

            <div
              className="relative h-[2px] w-44 overflow-hidden bg-[#1A1A1A] sm:w-56"
              aria-hidden
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{
                  duration: BAR_FILL_MS / 1000,
                  ease: "linear",
                }}
                onAnimationComplete={handleBarComplete}
                className="absolute inset-y-0 left-0 overflow-hidden bg-[#4F7EF7]"
              >
                <motion.div
                  className="absolute inset-y-0 w-16"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)",
                  }}
                  initial={{ x: "-100%" }}
                  animate={{ x: "350%" }}
                  transition={{
                    duration: 1.1,
                    ease: "easeInOut",
                    repeat: Infinity,
                  }}
                />
              </motion.div>
            </div>
          </motion.div>

          <p
            className="relative mt-5 h-4 max-w-[20rem] text-balance text-center font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-[#555]"
            aria-live="polite"
          >
            {typedTagline}
            <motion.span
              className="ml-0.5 inline-block w-[1px] bg-[#555] align-middle"
              style={{ height: "0.75em" }}
              animate={{ opacity: [1, 0, 1] }}
              transition={{
                duration: 0.9,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
