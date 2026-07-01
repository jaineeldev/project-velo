"use client";

import { useRef, useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import { cn, focusRing } from "@/lib/utils";
import { updateClient } from "./actions";
import { ClientFormFields } from "./client-form-fields";
import type { ClientRow } from "@/lib/clients-data";

export function EditClientButton({ client }: { client: ClientRow }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const open = () => {
    setError(null);
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      try {
        await updateClient(client.id, formData);
        close();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-label={`Edit ${client.name}`}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
          focusRing,
        )}
      >
        <Pencil aria-hidden className="h-3.5 w-3.5" />
        Edit
      </button>

      <dialog
        ref={dialogRef}
        onClose={() => setError(null)}
        className="w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-xl backdrop:bg-black/50 backdrop:backdrop-blur-sm"
      >
        <h2 className="text-base font-medium text-foreground">
          Edit client
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Update this client&apos;s details.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <ClientFormFields client={client} />

          {error && (
            <p
              role="alert"
              aria-live="polite"
              className="text-sm text-destructive"
            >
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={close}
              className={cn(
                "rounded-md px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                focusRing,
              )}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              aria-busy={isPending}
              className={cn(
                "rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50",
                focusRing,
              )}
            >
              {isPending ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
