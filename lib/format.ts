// Render a snake_case status (e.g. "changes_requested", "not_started") as
// human-readable Title Case With Spaces. Used for every status pill in the
// app so the formatting stays consistent.
export function formatStatus(status: string): string {
  return status
    .split("_")
    .map((word) => (word.length === 0 ? word : word[0].toUpperCase() + word.slice(1).toLowerCase()))
    .join(" ");
}

// AU GST is 10% inclusive — `total_amount` columns in this codebase are
// stored as the GST-inclusive figure. When we need to render a breakdown we
// back the subtotal and GST portion out of the stored total.
export const GST_RATE = 0.1;

export function splitGst(totalIncGst: number): {
  subtotal: number;
  gst: number;
  total: number;
} {
  const total = totalIncGst;
  const subtotal = total / (1 + GST_RATE);
  const gst = total - subtotal;
  return { subtotal, gst, total };
}

// Currency — single en-AU AUD formatter used everywhere.
export const currencyFmt = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
});

// Dates — three shapes cover the entire app. Hoisted so we don't pay the
// `new Intl.DateTimeFormat(...)` cost at every render and so the format stays
// uniform across pages.
//   short    →  "May 17, 2026"          (list rows, "Issued", "Added")
//   long     →  "May 17, 2026"  but with `month: "long"` (header meta lines,
//                 "Created" footer)
//   dateTime →  "May 17, 2026, 3:42 PM" (activity logs, time entries)
//   weekday  →  "Sunday, May 17"        (dashboard greeting line)
export const dateShortFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export const dateLongFmt = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

export const dateTimeFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export const dateWeekdayFmt = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
});

// Compact relative-time helper. Returns "Just now", "5m ago", "3h ago", etc.
// Null input renders as "Never" so callers can pass nullable columns directly.
export function timeAgo(value: string | Date | null): string {
  if (!value) return "Never";
  const then = new Date(value).getTime();
  const ms = Date.now() - then;
  if (ms < 60_000) return "Just now";
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}
