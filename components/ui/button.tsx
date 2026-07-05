import * as React from "react";
import { cn, focusRing } from "@/lib/utils";

// Marketing-parity button styling: transition-all 200ms, ~2px hover lift,
// press feedback via active:scale-[0.98]. All motion is motion-safe: gated so
// prefers-reduced-motion users get the color/border shift only.
//
// Exposed as both a component (<Button variant="primary" />) and a class
// helper (buttonVariants({ variant, size })) so hand-rolled <button>s across
// the dashboard can adopt the same look with a one-line class swap instead
// of a JSX rewrite.

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
type ButtonSize = "sm" | "md" | "lg";

type ButtonVariantOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-60";

const motion =
  "motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.98]";

const variantCls: Record<ButtonVariant, string> = {
  primary: `bg-primary text-primary-foreground hover:bg-primary/90 ${motion}`,
  secondary: `border border-border bg-card text-foreground hover:border-foreground/20 hover:bg-accent ${motion}`,
  ghost: "text-muted-foreground hover:bg-accent hover:text-foreground",
  destructive: `bg-destructive text-destructive-foreground hover:bg-destructive/90 ${motion}`,
};

const sizeCls: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-9 px-3.5 text-sm",
  lg: "h-11 px-5 text-sm",
};

export function buttonVariants({
  variant = "primary",
  size = "md",
}: ButtonVariantOptions = {}) {
  return cn(base, variantCls[variant], sizeCls[size], focusRing);
}

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonVariantOptions;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";
