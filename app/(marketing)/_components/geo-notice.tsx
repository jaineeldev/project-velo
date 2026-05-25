"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Globe } from "lucide-react";
import { cn, focusRing } from "@/lib/utils";
import { EASE_OUT } from "../_lib/shared";

const GEO_NOTICE_KEY = "velo-geo-notice-dismissed";

// Compliance gate. Velo's privacy posture is AU-scoped, so non-AU visitors
// see a one-time notice before they sign up.
export function GeoNotice({ ready }: { ready: boolean }) {
  const prefersReduced = useReducedMotion();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!ready) return;
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
      const inAustralia = tz.startsWith("Australia/");
      const dismissed =
        window.localStorage.getItem(GEO_NOTICE_KEY) === "1";
      if (!inAustralia && !dismissed) {
        setShow(true);
      }
    } catch {
      // Silently skip
    }
  }, [ready]);

  const dismiss = useCallback(() => {
    setShow(false);
    try {
      window.localStorage.setItem(GEO_NOTICE_KEY, "1");
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!show) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") dismiss();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [show, dismiss]);

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          key="geo-notice"
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          initial={prefersReduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={prefersReduced ? { duration: 0 } : { duration: 0.2 }}
        >
          <button
            type="button"
            aria-label="Dismiss notice"
            onClick={dismiss}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="geo-notice-title"
            initial={
              prefersReduced ? false : { opacity: 0, y: 12, scale: 0.98 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              prefersReduced
                ? { opacity: 0 }
                : { opacity: 0, y: 12, scale: 0.98 }
            }
            transition={
              prefersReduced
                ? { duration: 0 }
                : { duration: 0.25, ease: EASE_OUT }
            }
            className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#111111] p-6 shadow-2xl sm:p-8"
          >
            <div className="flex items-center gap-3">
              <Globe aria-hidden className="h-5 w-5 shrink-0 text-primary" />
              <h2
                id="geo-notice-title"
                className="text-base font-medium tracking-tight text-white"
              >
                Heads up: Velo only follows Australian privacy law
              </h2>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/65">
              Velo&apos;s privacy practices are scoped to Australia. If you
              sign up from outside Australia, your data may not be handled in
              line with your local privacy laws (e.g. GDPR, CCPA). Please read
              the Privacy Policy before continuing.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link
                href="/privacy"
                className={cn(
                  "inline-flex h-9 items-center justify-center rounded-md border border-white/15 bg-white/[0.04] px-4 text-sm font-medium text-white transition-colors hover:bg-white/[0.08]",
                  focusRing,
                )}
              >
                Read Privacy Policy
              </Link>
              <button
                type="button"
                onClick={dismiss}
                className={cn(
                  "inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary/90",
                  focusRing,
                )}
              >
                I understand
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
