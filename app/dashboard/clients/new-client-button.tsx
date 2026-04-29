"use client";

import { useRef, useState, useTransition } from "react";
import { createClient } from "./actions";

const inputCls =
  "w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-300 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-600 dark:focus:border-neutral-600 dark:focus:ring-neutral-700";

const labelCls =
  "block text-sm font-medium text-neutral-900 dark:text-neutral-100";

export function NewClientButton() {
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
        await createClient(formData);
        form.reset();
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
        className="rounded-md bg-neutral-900 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
      >
        New client
      </button>

      <dialog
        ref={dialogRef}
        onClose={() => setError(null)}
        className="w-full max-w-md rounded-lg border border-neutral-200 bg-white p-6 shadow-xl backdrop:bg-black/50 backdrop:backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900"
      >
        <h2 className="text-base font-medium text-neutral-900 dark:text-neutral-100">
          New client
        </h2>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Add a client to start sending proposals.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="name" className={labelCls}>
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="off"
              className={inputCls}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className={labelCls}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="off"
              className={inputCls}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="phone" className={labelCls}>
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="off"
              className={inputCls}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={close}
              className="rounded-md px-3.5 py-2 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-neutral-900 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              {isPending ? "Saving…" : "Save client"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
