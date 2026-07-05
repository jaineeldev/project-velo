import type { ReactNode } from "react";

// Shared header block for auth cards: font-mono eyebrow, font-display heading,
// muted description. Mirrors the eyebrow → headline pattern used in the
// marketing pricing/features sections.
export function AuthHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: ReactNode;
  description: ReactNode;
}) {
  return (
    <div>
      <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
        {eyebrow}
      </p>
      <h1 className="mt-3 font-display text-2xl font-black tracking-tight text-foreground">
        {title}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

// Horizontal "or" rule used between OAuth buttons and the email form.
// Kept as a small component so the eyebrow tracking stays consistent.
export function AuthDivider({ label = "or" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3" aria-hidden>
      <div className="h-px flex-1 bg-border" />
      <span className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}
