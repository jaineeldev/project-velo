"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { supabase } from "@/lib/auth-client";
import { cn, focusRing } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { updateName } from "./actions";

type Props = {
  name: string;
  email: string;
};

export function ProfileForm({ name, email }: Props) {
  return (
    <div className="mt-6 space-y-4">
      <NameRow initialName={name} />
      <FieldRow label="Email">
        <p className="truncate text-sm font-medium text-foreground">{email}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Email changes aren&apos;t available yet.
        </p>
      </FieldRow>
    </div>
  );
}

function NameRow({ initialName }: { initialName: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onCancel() {
    setValue(initialName);
    setError(null);
    setEditing(false);
  }

  function onSave() {
    setError(null);
    startTransition(async () => {
      try {
        await updateName(value);
        // The sidebars read the name from the browser's Supabase session,
        // which doesn't see the server-side update until it refreshes.
        await supabase.auth.refreshSession().catch(() => {});
        setEditing(false);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't update your name.");
      }
    });
  }

  return (
    <FieldRow label="Name">
      {!editing ? (
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-foreground">
            {value.trim() || "Not set"}
          </span>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
              focusRing,
            )}
          >
            <Pencil aria-hidden className="h-3 w-3" />
            Edit
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <label className="block">
            <span className="sr-only">Name</span>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoComplete="name"
              maxLength={100}
              autoFocus
              disabled={isPending}
              className={cn(
                "block w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground outline-none focus:border-primary",
                focusRing,
              )}
            />
          </label>

          {error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onSave}
              disabled={isPending || !value.trim()}
              className={buttonVariants({ variant: "primary" })}
            >
              {isPending ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isPending}
              className={buttonVariants({ variant: "secondary" })}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </FieldRow>
  );
}

function FieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="mt-2">{children}</div>
    </div>
  );
}
