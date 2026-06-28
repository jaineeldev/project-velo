import { cn } from "@/lib/utils";

export function Wordmark({
  className,
  size = "default",
}: {
  className?: string;
  size?: "default" | "lg";
  variant?: "default" | "onDark";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline font-display font-black leading-none tracking-tight text-white",
        size === "lg" ? "text-3xl" : "text-lg",
        className,
      )}
    >
      Velo
    </span>
  );
}
