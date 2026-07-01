import type { CSSProperties } from "react";

// Marketing-wide design tokens. Pins the primary accent to the precision-craft
// blue (#4F7EF7) and forces dark colour-scheme so native form controls and
// scrollbars match the surrounding surface.
export const marketingTheme: CSSProperties = {
  "--primary": "221 91% 64%",
  "--primary-foreground": "0 0% 100%",
  "--ring": "221 91% 64%",
  colorScheme: "dark",
} as CSSProperties;

// Single easing curve shared across every marketing animation.
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F7EF7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]";
