import Link from "next/link";
import { notFound } from "next/navigation";
import { getInvoice } from "../actions";
import { MarkAsPaidButton } from "./mark-as-paid-button";
import { getOrCreateUser } from "@/lib/auth";
import {
  getUserProfile,
  formatAbn,
  formatAddressLine,
} from "@/lib/user-profile";
import { currencyFmt, dateLongFmt, splitGst } from "@/lib/format";
import { cn, focusRing } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function InvoiceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // Resolve user first (cached for the request), then fetch the invoice and
  // the agency profile in parallel — the "From" block doesn't depend on
  // invoice data, so there's no reason for it to wait.
  const user = await getOrCreateUser();
  const [invoice, profile] = await Promise.all([
    getInvoice(params.id),
    getUserProfile(user.id),
  ]);
  if (!invoice) notFound();

  const agencyName = profile.business_name ?? user.name ?? user.email;
  const agencyAddress = formatAddressLine(profile);
  const agencyAbn = formatAbn(profile.abn);

  // `invoice.total_amount` is the GST-inclusive amount the client owes for
  // this specific invoice — the deposit slice of the proposal for a deposit
  // invoice, or the remaining balance for a final invoice. The breakdown
  // below splits *that* amount into its ex-GST and GST components, so the
  // figures on screen match what the client is actually paying.
  const depositPct = Number(invoice.proposal.deposit_percentage);
  const invoiceSplit = splitGst(Number(invoice.total_amount));
  const totalLabel =
    invoice.type === "final"
      ? "Final balance"
      : `Deposit (${depositPct}%)`;

  return (
    <div className="px-10 py-12">
      <Link
        href="/dashboard/invoices"
        className={cn(
          "inline-flex items-center gap-1 rounded text-sm text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100",
          focusRing,
        )}
      >
        ← Invoices
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            {invoice.project.title}
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {invoice.client.name}
            {invoice.client.company_name
              ? ` · ${invoice.client.company_name}`
              : ""}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <StatusBadge status={invoice.type} />
          <StatusBadge status={invoice.status} />
          {invoice.status === "unpaid" && (
            <MarkAsPaidButton invoiceId={invoice.id} />
          )}
          <a
            href={`/api/invoices/${invoice.id}/pdf`}
            className={cn(
              "rounded-md border border-neutral-200 px-3.5 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-900",
              focusRing,
            )}
          >
            Download PDF
          </a>
        </div>
      </div>

      {/* Agency "From" block */}
      <section className="mt-8 rounded-lg border border-neutral-200 p-5 dark:border-neutral-800">
        <p className="text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          From
        </p>
        <p className="mt-1 text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {agencyName}
        </p>
        <div className="mt-1 flex flex-wrap gap-x-4 text-sm text-neutral-500 dark:text-neutral-400">
          {agencyAbn && <span>ABN {agencyAbn}</span>}
          {agencyAddress && <span>{agencyAddress}</span>}
          {profile.phone && <span>{profile.phone}</span>}
          {profile.website && <span>{profile.website}</span>}
        </div>
      </section>

      {/* Client + project meta */}
      <section className="mt-4 grid grid-cols-1 gap-3 rounded-lg border border-neutral-200 p-5 sm:grid-cols-3 dark:border-neutral-800">
        <div>
          <p className="text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Client
          </p>
          <p className="mt-1 text-sm text-neutral-900 dark:text-neutral-100">
            {invoice.client.name}
          </p>
          {invoice.client.email && (
            <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
              {invoice.client.email}
            </p>
          )}
          {invoice.client.phone && (
            <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
              {invoice.client.phone}
            </p>
          )}
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Project
          </p>
          <Link
            href={`/dashboard/projects/${invoice.project.id}`}
            className="mt-1 inline-block text-sm text-neutral-900 underline-offset-2 hover:underline dark:text-neutral-100"
          >
            {invoice.project.title}
          </Link>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Issued
          </p>
          <p className="mt-1 text-sm text-neutral-900 dark:text-neutral-100">
            {dateLongFmt.format(new Date(invoice.created_at))}
          </p>
          {invoice.due_date && (
            <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
              Due {dateLongFmt.format(new Date(invoice.due_date))}
            </p>
          )}
        </div>
      </section>

      {/* Line items (from the linked proposal) */}
      <div className="mt-10">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Line items
        </h2>
        <div className="grid grid-cols-[1fr_5rem_8rem_7rem] gap-3 border-b border-neutral-200 pb-2 dark:border-neutral-800">
          {["Description", "Qty", "Unit price", "Total"].map((h) => (
            <span
              key={h}
              className="text-xs font-medium text-neutral-500 dark:text-neutral-400"
            >
              {h}
            </span>
          ))}
        </div>
        {invoice.lineItems.map((item, i) => {
          const qty = Number(item.quantity);
          const price = Number(item.unit_price);
          return (
            <div
              key={i}
              className="grid grid-cols-[1fr_5rem_8rem_7rem] gap-3 border-b border-neutral-100 py-3 dark:border-neutral-900"
            >
              <span className="text-sm text-neutral-900 dark:text-neutral-100">
                {item.description}
              </span>
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                {qty}
              </span>
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                {currencyFmt.format(price)}
              </span>
              <span className="text-right text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {currencyFmt.format(qty * price)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Totals — for this invoice only, not the full project value. */}
      <div className="mt-6 flex flex-col items-end gap-2 text-sm">
        <div className="flex w-72 justify-between gap-8">
          <span className="text-neutral-500 dark:text-neutral-400">
            {totalLabel} (ex. GST)
          </span>
          <span className="font-medium text-neutral-900 dark:text-neutral-100">
            {currencyFmt.format(invoiceSplit.subtotal)}
          </span>
        </div>
        <div className="flex w-72 justify-between gap-8">
          <span className="text-neutral-500 dark:text-neutral-400">GST (10%)</span>
          <span className="font-medium text-neutral-900 dark:text-neutral-100">
            {currencyFmt.format(invoiceSplit.gst)}
          </span>
        </div>
        <div className="flex w-72 justify-between gap-8 border-t border-neutral-200 pt-2 dark:border-neutral-800">
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">
            {totalLabel} due now
          </span>
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">
            {currencyFmt.format(invoiceSplit.total)}
          </span>
        </div>
      </div>
    </div>
  );
}
