"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Globe } from "lucide-react";
import { EASE_OUT, focusRing } from "../_lib/shared";

const GEO_NOTICE_KEY = "velo-geo-notice-dismissed";

export function GeoNotice({ ready }: { ready: boolean }) {
  const prefersReduced = useReducedMotion();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!ready) return;
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
      const inAustralia = tz.startsWith("Australia/");
      const dismissed = window.localStorage.getItem(GEO_NOTICE_KEY) === "1";
      if (!inAustralia && !dismissed) {
        setShow(true);
      }
    } catch {
      // ignore
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
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
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
            className="relative w-full max-w-md rounded-xl border border-[#2A2A2A] bg-[#111] p-6 shadow-2xl sm:p-8"
          >
            <div className="flex items-center gap-3 border-b border-[#2A2A2A] pb-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] text-[#4F7EF7]">
                <Globe aria-hidden className="h-4 w-4" strokeWidth={2} />
              </span>
              <h2
                id="geo-notice-title"
                className="font-display text-base font-bold tracking-tight text-white"
              >
                Heads up: Velo only follows Australian privacy law
              </h2>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-[#A0A0A0]">
              Velo&apos;s privacy practices are scoped to Australia. If you
              sign up from outside Australia, your data may not be handled in
              line with your local privacy laws (e.g. GDPR, CCPA). Please read
              the Privacy Policy before continuing.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link
                href="/privacy"
                className={`inline-flex items-center justify-center rounded-lg border border-[#2A2A2A] px-4 py-2 text-sm font-medium text-[#A0A0A0] transition-all duration-200 hover:border-[#444] hover:text-white motion-safe:hover:-translate-y-0.5 ${focusRing}`}
              >
                Read Privacy Policy
              </Link>
              <button
                type="button"
                onClick={dismiss}
                className={`inline-flex items-center justify-center rounded-lg bg-[#4F7EF7] px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#3B6AE8] motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.98] ${focusRing}`}
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
