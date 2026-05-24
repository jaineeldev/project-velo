"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { EASE_OUT } from "../_lib/shared";
import { allFeatures, type FeatureMockupKind } from "../_lib/data";
import { FeatureMockup } from "./feature-mockup";

// Alternating two-column feature row used on / and /features. The text side
// stays typography-led: number, a hairline rule, the lucide icon, then the
// title and body. No card, no chip, no decorative dot.
//
// Takes only the mockup key, not the full Feature object, so it can be
// rendered from a server component without serialising the lucide icon
// component reference across the RSC boundary.
export function FeatureRow({
  mockup,
  flipped,
  index,
  tone = "light",
}: {
  mockup: FeatureMockupKind;
  flipped: boolean;
  index: number;
  tone?: "light" | "dark";
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
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        transition: { duration: 0.7, ease: EASE_OUT },
      };

  const isDark = tone === "dark";
  const titleClass = isDark ? "text-white" : "text-black";
  const bodyClass = isDark ? "text-white/60" : "text-[#666666]";
  const metaClass = isDark ? "text-white/40" : "text-neutral-400";
  const dividerClass = isDark ? "bg-white/15" : "bg-neutral-200";
  const borderClass = isDark
    ? "border-white/[0.06]"
    : "border-gray-100";

  return (
    <motion.div
      {...fadeUp}
      viewport={{ once: true, amount: 0.25 }}
      className={cn("border-b first:border-t", borderClass)}
    >
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 sm:px-10 sm:py-24 md:grid-cols-2 md:gap-16 lg:gap-28">
        <div
          className={cn(
            "flex flex-col justify-center",
            flipped ? "md:order-2" : "md:order-1",
          )}
        >
          <div className="flex items-center gap-4">
            <span
              className={cn(
                "text-[11px] font-semibold uppercase tracking-[0.28em] tabular-nums",
                metaClass,
              )}
            >
              {String(index).padStart(2, "0")}
            </span>
            <span className={cn("h-px w-12", dividerClass)} />
            <Icon
              aria-hidden
              className="h-4 w-4 text-primary"
              strokeWidth={2}
            />
          </div>
          <h3
            className={cn(
              "mt-8 text-5xl font-extrabold leading-[1] tracking-[-0.03em] sm:text-6xl",
              titleClass,
            )}
          >
            {feature.title}.
          </h3>
          <p
            className={cn(
              "mt-7 max-w-md text-base leading-relaxed sm:text-lg",
              bodyClass,
            )}
          >
            {feature.description}
          </p>
        </div>
        <div className={cn(flipped ? "md:order-1" : "md:order-2")}>
          <FeatureMockup kind={mockup} tone={tone} />
        </div>
      </div>
    </motion.div>
  );
}
