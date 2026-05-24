import type { CSSProperties } from "react";

// Marketing-wide design tokens. Locks colour-scheme to dark and pins the
// primary to blue 600 (#2563eb) so light sections inherit the same accent.
export const marketingTheme: CSSProperties = {
  "--primary": "221 83% 53%",
  "--primary-foreground": "0 0% 100%",
  "--ring": "221 83% 53%",
  colorScheme: "dark",
} as CSSProperties;

// Single easing curve shared across every marketing animation.
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
