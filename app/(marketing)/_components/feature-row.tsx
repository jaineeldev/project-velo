"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { EASE_OUT } from "../_lib/shared";
import { allFeatures, type FeatureMockupKind } from "../_lib/data";
import { FeatureMockup } from "./feature-mockup";

export function FeatureRow({
  mockup,
  flipped,
  index,
  tone = "light",
  footer,
}: {
  mockup: FeatureMockupKind;
  flipped: boolean;
  index: number;
  tone?: "light" | "dark";
  footer?: React.ReactNode;
}) {
  const prefersReduced = useReducedMotion();
  const feature = allFeatures.find((f) => f.mockup === mockup);
  if (!feature) return null;
  const Icon = feature.icon;

  const fadeUp = prefersReduced
    ? {
        initial: false as const,
        whileInView: { opacity: 1, y: 0 },
        transition: { duration: 0 },
      }
    : {
        initial: { opacity: 0, y: 18 },
        whileInView: { opacity: 1, y: 0 },
        transition: { duration: 0.6, ease: EASE_OUT },
      };

  const isDark = tone === "dark";
  const titleClass = isDark ? "text-white" : "text-black";
  const bodyClass = isDark ? "text-white/70" : "text-[#737373]";
  const metaClass = isDark ? "text-white/50" : "text-[#737373]";

  return (
    <motion.div
      {...fadeUp}
      viewport={{ once: true, amount: 0.25 }}
      className="border-b-2 border-black first:border-t-2"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 sm:px-10 sm:py-24 md:grid-cols-2 md:gap-16 lg:gap-20">
        <div
          className={cn(
            "flex flex-col justify-center",
            flipped ? "md:order-2" : "md:order-1",
          )}
        >
          <div className="flex items-center gap-4">
            <span
              className={cn(
                "border-2 border-current px-2 py-0.5 font-mono text-xs font-bold uppercase tabular-nums",
                metaClass,
              )}
            >
              {String(index).padStart(2, "0")}
            </span>
            <Icon
              aria-hidden
              className="h-5 w-5 text-blue-600"
              strokeWidth={2.5}
            />
          </div>
          <h3
            className={cn(
              "mt-6 font-display text-5xl font-black leading-[0.95] tracking-[-0.04em] sm:text-6xl",
              titleClass,
            )}
          >
            {feature.title}.
          </h3>
          <p
            className={cn(
              "mt-6 max-w-md text-lg leading-relaxed",
              bodyClass,
            )}
          >
            {feature.description}
          </p>
          {footer ? <div className="mt-5 max-w-md">{footer}</div> : null}
        </div>
        <div
          className={cn(
            "border-2 border-black bg-white p-4 shadow-brut",
            flipped ? "md:order-1" : "md:order-2",
          )}
        >
          <FeatureMockup kind={mockup} tone="light" />
        </div>
      </div>
    </motion.div>
  );
}
