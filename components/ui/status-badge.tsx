import { cn } from "@/lib/utils";
import { formatStatus } from "@/lib/format";

// Single source of truth for every status pill in the app. Map each known
// status string to one of four visual intents (neutral / primary / success /
// warning), then render a soft-tint pill. If an unknown status sneaks in we
// fall back to neutral so the UI doesn't break.
type Intent = "neutral" | "primary" | "success" | "warning";

const intents: Record<string, Intent> = {
  // proposal.status
  draft: "neutral",
  sent: "primary",
  approved: "success",
  changes_requested: "warning",

  // project.status
  active: "primary",
  completed: "success",
  delivered: "success",

  // milestone.status
  not_started: "neutral",
  in_progress: "primary",
  // `completed` shared with project.status above

  // invoice.status
  unpaid: "warning",
  paid: "success",

  // invoice.type
  deposit: "neutral",
  final: "primary",
};

const intentCls: Record<Intent, string> = {
  neutral: "bg-muted text-muted-foreground ring-1 ring-inset ring-border",
  primary: "bg-primary/10 text-primary ring-1 ring-inset ring-primary/20",
  success: "bg-success/10 text-success ring-1 ring-inset ring-success/25",
  warning: "bg-warning/10 text-warning ring-1 ring-inset ring-warning/25",
};

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const intent = intents[status] ?? "neutral";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        intentCls[intent],
        className,
      )}
    >
      <span className="sr-only">Status: </span>
      {formatStatus(status)}
    </span>
  );
}
