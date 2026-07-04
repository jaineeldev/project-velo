// Shared style tokens for the custom Better Auth pages (sign-in, sign-up,
// forgot/reset password, verify-email, magic-link, two-factor). Mirrors the
// input styling already used in app/dashboard/clients/client-form-fields.tsx
// so auth surfaces don't invent a second visual language.
export const authInputCls =
  "h-11 w-full rounded-md border border-input bg-card px-3.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60";

export const authLabelCls = "block text-sm font-medium text-foreground";

export const authCardCls =
  "w-full max-w-sm space-y-6 rounded-lg border border-border bg-card p-6 shadow-sm";

export const authPrimaryButtonCls =
  "inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60";

export const authSecondaryButtonCls =
  "inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function looksLikeEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}
