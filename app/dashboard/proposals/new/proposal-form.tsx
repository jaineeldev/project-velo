"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { currencyFmt, GST_RATE } from "@/lib/format";
import { cn, focusRing } from "@/lib/utils";
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

const inputCls =
  "w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring";

const labelCls = "block text-sm font-medium text-foreground";

function fmt(n: number) {
  return currencyFmt.format(n);
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

  // Monotonic key counter scoped to this component instance. Previously this
  // lived at module scope (`let nextKey = 1`) which leaked state across
  // simultaneously mounted forms.
  const nextKeyRef = useRef(1);
  const makeKey = () => nextKeyRef.current++;

  const [lineItems, setLineItems] = useState<LineItem[]>(() =>
    initialValues?.lineItems.length
      ? initialValues.lineItems.map((item) => ({
          key: makeKey(),
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        }))
      : [{ key: makeKey(), description: "", quantity: "1", unitPrice: "" }],
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
      { key: makeKey(), description: "", quantity: "1", unitPrice: "" },
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
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
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
            <span className="font-normal text-muted-foreground">
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

      <hr className="border-border" />

      {/* ── Line items ───────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Line items
        </h2>

        <div className="grid grid-cols-[1fr_5rem_8rem_7rem_2rem] gap-3">
          {["Description", "Qty", "Unit price", "Total", ""].map((h) => (
            <span
              key={h}
              className="text-xs font-medium text-muted-foreground"
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
              <span className="text-right text-sm text-foreground">
                {fmt(rowTotal)}
              </span>
              {lineItems.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeLineItem(item.key)}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                    focusRing,
                  )}
                  aria-label={`Remove line item ${item.description || "(unnamed)"}`}
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
          className={cn(
            "mt-1 rounded text-sm text-muted-foreground transition-colors hover:text-foreground",
            focusRing,
          )}
        >
          + Add line item
        </button>
      </section>

      <hr className="border-border" />

      {/* ── Summary ──────────────────────────────────────────────────────── */}
      <section className="space-y-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Summary
        </h2>

        <div className="flex flex-col items-end gap-2 text-sm">
          <div className="flex w-64 justify-between gap-8">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium text-foreground">
              {fmt(subtotal)}
            </span>
          </div>
          <div className="flex w-64 justify-between gap-8">
            <span className="text-muted-foreground">GST (10%)</span>
            <span className="font-medium text-foreground">{fmt(gst)}</span>
          </div>
          <div className="flex w-64 justify-between gap-8 border-t border-border pt-2">
            <span className="font-semibold text-foreground">Total</span>
            <span className="font-semibold text-foreground">{fmt(total)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label
            htmlFor="depositPct"
            className="shrink-0 text-sm font-medium text-foreground"
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
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
              %
            </span>
          </div>
          <span className="text-sm text-muted-foreground">
            = {fmt(deposit)}
          </span>
        </div>
      </section>

      {/* ── Error + submit ────────────────────────────────────────────────── */}
      {error && (
        <p role="alert" aria-live="polite" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <a
          href={cancelHref}
          className={cn(
            "rounded-md px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
            focusRing,
          )}
        >
          Cancel
        </a>
        <button
          type="submit"
          disabled={isPending}
          aria-busy={isPending}
          className={cn(
            "rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50",
            focusRing,
          )}
        >
          {isPending ? "Saving…" : proposalId ? "Save changes" : "Save proposal"}
        </button>
      </div>
    </form>
  );
}
