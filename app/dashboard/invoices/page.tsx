import Link from "next/link";
import { Receipt } from "lucide-react";
import { getInvoices } from "./actions";
import { currencyFmt, dateShortFmt } from "@/lib/format";
import { cn, focusRing } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function InvoicesPage() {
  const invoices = await getInvoices();

  return (
    <div className="px-10 py-12">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Invoices
        </h1>
      </header>

      {invoices.length === 0 ? (
        <Card className="mt-10 border-dashed shadow-none">
          <CardContent className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Receipt aria-hidden className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              No invoices yet. Invoices are created automatically when a client
              approves a proposal.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="mt-10 overflow-hidden">
          <ul className="divide-y divide-border">
            {invoices.map((i) => (
              <li key={i.id}>
                <Link
                  href={`/dashboard/invoices/${i.id}`}
                  className={cn(
                    "flex items-center gap-4 px-5 py-4 transition-colors hover:bg-accent",
                    focusRing,
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {i.project_title}
                    </p>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">
                      {i.client_name}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-4">
                    <StatusBadge status={i.type} />
                    <StatusBadge status={i.status} />
                    <p className="w-24 text-right text-sm font-medium text-foreground">
                      {currencyFmt.format(Number(i.total_amount))}
                    </p>
                    <p className="w-28 text-right text-xs text-muted-foreground">
                      {dateShortFmt.format(new Date(i.created_at))}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
