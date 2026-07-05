// Shared style tokens for the custom Supabase auth pages (sign-in, sign-up,
// forgot/reset password, verify-email, magic-link, two-factor, consent-gate).
// Kept in one place so any restyle lands everywhere in one edit.

export const authInputCls =
  "h-11 w-full rounded-md border border-input bg-background px-3.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60";

// Field labels adopt the marketing eyebrow treatment: font-mono, uppercase,
// wide tracking, muted colour. Reads as a tag rather than a heading.
export const authLabelCls =
  "block font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground";

export const authCardCls =
  "w-full max-w-sm space-y-6 rounded-xl border border-border bg-card p-7";

// Buttons: transition-all 200ms with a small hover lift + press feedback,
// matching the marketing pricing card CTAs. motion-safe: gated so
// prefers-reduced-motion users get the colour shift only. focus-visible ring
// uses the semantic --ring token so it stays theme-correct.
const authButtonBase =
  "inline-flex h-11 w-full items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60 motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.98]";

export const authPrimaryButtonCls = `${authButtonBase} bg-primary text-primary-foreground hover:bg-primary/90`;

export const authSecondaryButtonCls = `${authButtonBase} border border-border bg-card text-foreground hover:border-foreground/20 hover:bg-accent`;

// Tertiary text link — subtler than a full button, used for "email me a link
// instead" / "use a password instead" toggles.
export const authLinkButtonCls =
  "w-full rounded-sm text-center text-sm font-medium text-primary transition-colors hover:text-primary/80 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function looksLikeEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}
