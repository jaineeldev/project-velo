import { ArrowRight } from "lucide-react";
import { cn, focusRing } from "@/lib/utils";

type Props = {
  label: string;
  amount: string;
  size?: "sm" | "md";
};

// Placeholder. Card payments aren't wired up yet, so this is a visual CTA
// that signals "you owe this" without pretending to take a charge. The
// caption below is the honest disclosure of the current state.
export function SharePaymentButton({ label, amount, size = "md" }: Props) {
  return (
    <div>
      <button
        type="button"
        aria-label={`${label} ${amount}`}
        className={cn(
          "inline-flex items-center gap-2 rounded-md bg-primary font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90",
          size === "md" ? "px-4 py-2 text-sm" : "px-3 py-1.5 text-xs",
          focusRing,
        )}
      >
        <span>{label}</span>
        <span className="font-mono tabular-nums">{amount}</span>
        <ArrowRight
          aria-hidden
          className={size === "md" ? "h-4 w-4" : "h-3.5 w-3.5"}
        />
      </button>
      <p
        className={cn(
          "mt-2 text-muted-foreground",
          size === "md" ? "text-xs" : "text-[11px]",
        )}
      >
        Card payments coming soon. Bank transfer details are on your invoice.
      </p>
    </div>
  );
}
