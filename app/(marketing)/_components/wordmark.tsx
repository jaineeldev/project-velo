import { cn } from "@/lib/utils";

// Wordmark. Plain sans-extrabold mark with the trailing period in the brand
// accent. Reads the way Linear and Vercel marks read: confident, technical,
// no decoration.
export function Wordmark({
  className,
  variant = "light",
  size = "default",
}: {
  className?: string;
  variant?: "light" | "dark";
  size?: "default" | "lg";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline font-extrabold leading-none tracking-[-0.04em]",
        size === "lg" ? "text-2xl" : "text-lg",
        variant === "dark" ? "text-black" : "text-white",
        className,
      )}
    >
      Velo<span className="text-primary">.</span>
    </span>
  );
}
