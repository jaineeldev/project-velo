// Render a snake_case status (e.g. "changes_requested", "not_started") as
// human-readable Title Case With Spaces. Used for every status pill in the
// app so the formatting stays consistent.
export function formatStatus(status: string): string {
  return status
    .split("_")
    .map((word) => (word.length === 0 ? word : word[0].toUpperCase() + word.slice(1).toLowerCase()))
    .join(" ");
}
