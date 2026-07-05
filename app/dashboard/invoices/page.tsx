import { Receipt } from "lucide-react";
import { getInvoices } from "./actions";
import { Card, CardContent } from "@/components/ui/card";
import { InvoicesList } from "./invoices-list";

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
        <Card className="mt-10 border-dashed">
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
        <InvoicesList invoices={invoices} />
      )}
    </div>
  );
}
