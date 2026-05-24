import { type Variants } from "framer-motion";
import { EASE_OUT } from "./shared";

// Stagger helper. Pass `prefersReduced` so motion-sensitive users get a
// static final frame rather than the cascade.
export function staggerVariants(
  prefersReduced: boolean | null,
  stagger: number,
  yOffset = 24,
  extraChild: Record<string, number> = {},
): { container: Variants; item: Variants } {
  if (prefersReduced) {
    const finalItem = { opacity: 1, y: 0, ...extraChild };
    return {
      container: { hidden: {}, visible: {} },
      item: { hidden: finalItem, visible: finalItem },
    };
  }
  return {
    container: {
      hidden: {},
      visible: { transition: { staggerChildren: stagger } },
    },
    item: {
      hidden: {
        opacity: 0,
        y: yOffset,
        ...Object.fromEntries(
          Object.entries(extraChild).map(([k, v]) => [
            k,
            k === "scale" ? 0.95 : v,
          ]),
        ),
      },
      visible: {
        opacity: 1,
        y: 0,
        ...extraChild,
        transition: { duration: 0.6, ease: EASE_OUT },
      },
    },
  };
}
