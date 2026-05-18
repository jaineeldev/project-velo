import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Standard keyboard-focus ring used across every interactive element. Uses
// `focus-visible` so it only renders for keyboard users (mouse focus stays
// clean). `ring-offset-background` keeps the offset blending into whatever
// surface the element sits on; the ring colour comes from `--ring` which we
// alias to the primary accent in globals.css.
export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
