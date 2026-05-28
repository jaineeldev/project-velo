"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "dark" | "light";

const SHOW_AFTER_PX = 400;

export function ScrollToTop({
  variant: variantProp,
}: {
  variant?: Variant;
}) {
  const prefersReduced = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [detected, setDetected] = useState<Variant>("dark");

  useEffect(() => {
    const update = () => {
      setVisible(window.scrollY > SHOW_AFTER_PX);

      if (variantProp) return;

      // Probe the y-coordinate where the button sits and pick whichever
      // [data-bg] section overlaps it. Falls back to "dark" if nothing is
      // marked, so unmarked dark-dominant pages keep the dark button.
      const probeY = window.innerHeight - 36;
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>("[data-bg]"),
      );
      let next: Variant = "dark";
      for (const el of sections) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= probeY && rect.bottom >= probeY) {
          const bg = el.dataset.bg;
          if (bg === "light" || bg === "dark") {
            next = bg;
            break;
          }
        }
      }
      setDetected(next);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [variantProp]);

  const onClick = () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReduced ? "auto" : "smooth",
    });
  };

  const variant = variantProp ?? detected;
  const isLight = variant === "light";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Scroll to top"
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className={cn(
        "fixed bottom-6 right-6 z-50 rounded-full border p-3 backdrop-blur-sm",
        prefersReduced ? "" : "transition-all duration-200",
        visible ? "opacity-100" : "pointer-events-none opacity-0",
        isLight
          ? "border-black/10 bg-black/10 text-gray-900 hover:bg-black/20"
          : "border-white/10 bg-white/10 text-white hover:bg-white/20",
      )}
    >
      <ArrowUp aria-hidden className="h-4 w-4" strokeWidth={2.25} />
    </button>
  );
}
