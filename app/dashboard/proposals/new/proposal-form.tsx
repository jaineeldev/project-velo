"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createProposal, updateProposal } from "../actions";

type ClientOption = { id: string; name: string };

type LineItem = {
  key: number;
  description: string;
  quantity: string;
  unitPrice: string;
};

type InitialValues = {
  clientId: string;
  title: string;
  description: string | null;
  depositPercentage: string;
  lineItems: { description: string; quantity: string; unitPrice: string }[];
};

const GST_RATE = 0.1;
let nextKey = 1;

const inputCls =
  "w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-300 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-600 dark:focus:border-neutral-600 dark:focus:ring-neutral-700";

const labelCls =
  "block text-sm font-medium text-neutral-900 dark:text-neutral-100";

function fmt(n: number) {
  return `$${n.toFixed(2)}`;
}

function parseNum(s: string) {
  const n = parseFloat(s);
  return isFinite(n) ? n : 0;
}

export function ProposalForm({
  clients,
  proposalId,
  initialValues,
}: {
  clients: ClientOption[];
  proposalId?: string;
  initialValues?: InitialValues;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [lineItems, setLineItems] = useState<LineItem[]>(() =>
    initialValues?.lineItems.length
      ? initialValues.lineItems.map((item) => ({
          key: nextKey++,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        }))
      : [{ key: nextKey++, description: "", quantity: "1", unitPrice: "" }],
  );
  const [depositPct, setDepositPct] = useState(
    initialValues?.depositPercentage ?? "0",
  );

  // ── derived totals ────────────────────────────────────────────────────────
  const subtotal = lineItems.reduce(
    (sum, item) => sum + parseNum(item.quantity) * parseNum(item.unitPrice),
    0,
  );
  const gst = subtotal * GST_RATE;
  const total = subtotal + gst;
  const deposit = total * (parseNum(depositPct) / 100);

  // ── line item helpers ─────────────────────────────────────────────────────
  function addLineItem() {
    setLineItems((prev) => [
      ...prev,
      { key: nextKey++, description: "", quantity: "1", unitPrice: "" },
    ]);
  }

  function removeLineItem(key: number) {
    setLineItems((prev) => prev.filter((item) => item.key !== key));
  }

  function updateLineItem(
    key: number,
    field: keyof Omit<LineItem, "key">,
    value: string,
  ) {
    setLineItems((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, [field]: value } : item,
      ),
    );
  }

  // ── submit ────────────────────────────────────────────────────────────────
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const get = (name: string) =>
      (
        form.elements.namedItem(name) as
          | HTMLInputElement
          | HTMLSelectElement
          | HTMLTextAreaElement
      ).value;

    setError(null);
    startTransition(async () => {
      try {
        const payload = {
          clientId: get("clientId"),
          title: get("title"),
          description: get("description"),
          lineItems: lineItems.map((item) => ({
            description: item.description,
            quantity: parseNum(item.quantity),
            unitPrice: parseNum(item.unitPrice),
          })),
          depositPercentage: parseNum(depositPct),
        };

        if (proposalId) {
          await updateProposal(proposalId, payload);
          router.push(`/dashboard/proposals/${proposalId}`);
        } else {
          const id = await createProposal(payload);
          router.push(`/dashboard/proposals/${id}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  const cancelHref = proposalId
    ? `/dashboard/proposals/${proposalId}`
    : "/dashboard/proposals";

  return (
    <form onSubmit={handleSubmit} className="mt-8 max-w-3xl space-y-10">
      {/* ── Proposal details ─────────────────────────────────────────────── */}
      <section className="space-y-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Proposal details
        </h2>

        <div className="space-y-1.5">
          <label htmlFor="clientId" className={labelCls}>
            Client
          </label>
          <select
            id="clientId"
            name="clientId"
            required
            className={inputCls}
            defaultValue={initialValues?.clientId ?? ""}
          >
            <option value="" disabled>
              Select a client…
            </option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="title" className={labelCls}>
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            placeholder="e.g. Website redesign"
            autoComplete="off"
            defaultValue={initialValues?.title ?? ""}
            className={inputCls}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="description" className={labelCls}>
            Description{" "}
            <span className="font-normal text-neutral-400 dark:text-neutral-600">
              (optional)
            </span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            placeholder="Describe the scope of work…"
            defaultValue={initialValues?.description ?? ""}
            className={inputCls + " resize-none"}
          />
        </div>
      </section>

      <hr className="border-neutral-200 dark:border-neutral-800" />

      {/* ── Line items ───────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Line items
        </h2>

        <div className="grid grid-cols-[1fr_5rem_8rem_7rem_2rem] gap-3">
          {["Description", "Qty", "Unit price", "Total", ""].map((h) => (
            <span
              key={h}
              className="text-xs font-medium text-neutral-500 dark:text-neutral-400"
            >
              {h}
            </span>
          ))}
        </div>

        {lineItems.map((item) => {
          const rowTotal = parseNum(item.quantity) * parseNum(item.unitPrice);
          return (
            <div
              key={item.key}
              className="grid grid-cols-[1fr_5rem_8rem_7rem_2rem] items-center gap-3"
            >
              <input
                type="text"
                placeholder="Description"
                value={item.description}
                onChange={(e) =>
                  updateLineItem(item.key, "description", e.target.value)
                }
                required
                className={inputCls}
              />
              <input
                type="number"
                placeholder="1"
                value={item.quantity}
                min="0.01"
                step="0.01"
                onChange={(e) =>
                  updateLineItem(item.key, "quantity", e.target.value)
                }
                required
                className={inputCls}
              />
              <input
                type="number"
                placeholder="0.00"
                value={item.unitPrice}
                min="0"
                step="0.01"
                onChange={(e) =>
                  updateLineItem(item.key, "unitPrice", e.target.value)
                }
                required
                className={inputCls}
              />
              <span className="text-right text-sm text-neutral-700 dark:text-neutral-300">
                {fmt(rowTotal)}
              </span>
              {lineItems.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeLineItem(item.key)}
                  className="flex h-7 w-7 items-center justify-center rounded text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                  aria-label="Remove line item"
                >
                  ×
                </button>
              ) : (
                <span />
              )}
            </div>
          );
        })}

        <button
          type="button"
          onClick={addLineItem}
          className="mt-1 text-sm text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          + Add line item
        </button>
      </section>

      <hr className="border-neutral-200 dark:border-neutral-800" />

      {/* ── Summary ──────────────────────────────────────────────────────── */}
      <section className="space-y-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Summary
        </h2>

        <div className="flex flex-col items-end gap-2 text-sm">
          <div className="flex w-64 justify-between gap-8">
            <span className="text-neutral-500 dark:text-neutral-400">
              Subtotal
            </span>
            <span className="font-medium text-neutral-900 dark:text-neutral-100">
              {fmt(subtotal)}
            </span>
          </div>
          <div className="flex w-64 justify-between gap-8">
            <span className="text-neutral-500 dark:text-neutral-400">
              GST (10%)
            </span>
            <span className="font-medium text-neutral-900 dark:text-neutral-100">
              {fmt(gst)}
            </span>
          </div>
          <div className="flex w-64 justify-between gap-8 border-t border-neutral-200 pt-2 dark:border-neutral-800">
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
              Total
            </span>
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
              {fmt(total)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label
            htmlFor="depositPct"
            className="shrink-0 text-sm font-medium text-neutral-900 dark:text-neutral-100"
          >
            Deposit
          </label>
          <div className="relative w-28">
            <input
              id="depositPct"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={depositPct}
              onChange={(e) => setDepositPct(e.target.value)}
              className={inputCls + " pr-8"}
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-neutral-400 dark:text-neutral-600">
              %
            </span>
          </div>
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            = {fmt(deposit)}
          </span>
        </div>
      </section>

      {/* ── Error + submit ────────────────────────────────────────────────── */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="flex justify-end gap-3">
        <a
          href={cancelHref}
          className="rounded-md px-3.5 py-2 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          Cancel
        </a>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-neutral-900 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          {isPending ? "Saving…" : proposalId ? "Save changes" : "Save proposal"}
        </button>
      </div>
    </form>
  );
}
