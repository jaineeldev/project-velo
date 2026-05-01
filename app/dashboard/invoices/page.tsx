import Link from "next/link";
import { getInvoices } from "./actions";

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const currencyFmt = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
});

const statusStyles: Record<string, string> = {
  unpaid: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  paid: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400",
};

const typeStyles: Record<string, string> = {
  deposit:
    "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  final:
    "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
};

export default async function InvoicesPage() {
  const invoices = await getInvoices();

  return (
    <div className="px-10 py-12">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Invoices
        </h1>
      </header>

      {invoices.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed border-neutral-200 px-6 py-16 text-center dark:border-neutral-800">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No invoices yet. Invoices are created automatically when a client
            approves a proposal.
          </p>
        </div>
      ) : (
        <ul className="mt-10 divide-y divide-neutral-200 border-t border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
          {invoices.map((i) => (
            <li key={i.id}>
              <Link
                href={`/dashboard/invoices/${i.id}`}
                className="flex items-center justify-between py-4 transition-colors hover:text-neutral-700 dark:hover:text-neutral-300"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {i.project_title}
                  </p>
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    {i.client_name}
                  </p>
                </div>
                <div className="ml-4 flex shrink-0 items-center gap-4">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${typeStyles[i.type] ?? typeStyles.deposit}`}
                  >
                    {i.type}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusStyles[i.status] ?? statusStyles.unpaid}`}
                  >
                    {i.status}
                  </span>
                  <p className="w-24 text-right text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {currencyFmt.format(Number(i.total_amount))}
                  </p>
                  <p className="w-28 text-right text-sm text-neutral-500 dark:text-neutral-400">
                    {dateFmt.format(new Date(i.created_at))}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
