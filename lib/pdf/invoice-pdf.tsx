import { Document, Page, Text, View } from "@react-pdf/renderer";
import { styles, formatCurrency, formatDate, shortNumber } from "./styles";
import { AgencyBlock } from "./agency-block";
import type { UserProfile } from "@/lib/user-profile";

export type InvoicePdfProps = {
  invoice: {
    id: string;
    type: string;
    status: string;
    total_amount: string;
    gst_amount: string;
    created_at: string | Date;
    due_date: string | Date | null;
  };
  client: {
    name: string;
    email: string | null;
    phone: string | null;
    company_name: string | null;
  };
  project: {
    title: string;
  };
  proposal: {
    total_amount: string;
    deposit_percentage: string;
  };
  lineItems: { description: string; quantity: string; unit_price: string }[];
  profile: UserProfile;
  account: { name: string | null; email: string };
};

export function InvoicePdf(props: InvoicePdfProps) {
  const { invoice, client, project, proposal, lineItems, profile, account } = props;

  const proposalTotal = Number(proposal.total_amount);
  const proposalSubtotal = proposalTotal / 1.1;
  const proposalGst = proposalTotal - proposalSubtotal;
  const depositPct = Number(proposal.deposit_percentage);
  const invoiceAmount = Number(invoice.total_amount);
  const dueLabel =
    invoice.type === "final"
      ? "Final balance due"
      : `Deposit (${depositPct}%) due`;

  return (
    <Document
      title={`Invoice ${shortNumber(invoice.id)}`}
      author={profile.business_name ?? account.name ?? account.email}
    >
      <Page size="A4" style={styles.page}>
        {/* Top band */}
        <View style={styles.topRow}>
          <View>
            <Text style={styles.documentLabel}>INVOICE</Text>
            <Text style={[styles.partyLine, { marginTop: 4 }]}>
              {project.title}
            </Text>
          </View>
          <AgencyBlock
            profile={profile}
            fallbackName={account.name}
            fallbackEmail={account.email}
          />
        </View>

        {/* Bill to + meta */}
        <View style={styles.metaRow}>
          <View>
            <Text style={styles.blockLabel}>Bill to</Text>
            <Text style={styles.partyName}>{client.name}</Text>
            {client.company_name ? (
              <Text style={styles.partyLine}>{client.company_name}</Text>
            ) : null}
            {client.email ? (
              <Text style={styles.partyLine}>{client.email}</Text>
            ) : null}
            {client.phone ? (
              <Text style={styles.partyLine}>{client.phone}</Text>
            ) : null}
          </View>

          <View style={styles.metaList}>
            <View style={styles.metaPair}>
              <Text style={styles.metaKey}>Invoice number</Text>
              <Text style={styles.metaValue}>INV-{shortNumber(invoice.id)}</Text>
            </View>
            <View style={styles.metaPair}>
              <Text style={styles.metaKey}>Type</Text>
              <Text style={[styles.metaValue, { textTransform: "capitalize" }]}>
                {invoice.type}
              </Text>
            </View>
            <View style={styles.metaPair}>
              <Text style={styles.metaKey}>Issued</Text>
              <Text style={styles.metaValue}>{formatDate(invoice.created_at)}</Text>
            </View>
            {invoice.due_date ? (
              <View style={styles.metaPair}>
                <Text style={styles.metaKey}>Due</Text>
                <Text style={styles.metaValue}>{formatDate(invoice.due_date)}</Text>
              </View>
            ) : null}
            <View style={styles.metaPair}>
              <Text style={styles.metaKey}>Status</Text>
              <Text style={[styles.metaValue, { textTransform: "capitalize" }]}>
                {invoice.status}
              </Text>
            </View>
          </View>
        </View>

        {/* Line items */}
        <View style={styles.tableHeader}>
          <Text style={[styles.colDescription, styles.th]}>Description</Text>
          <Text style={[styles.colQty, styles.th]}>Qty</Text>
          <Text style={[styles.colUnit, styles.th]}>Unit price</Text>
          <Text style={[styles.colTotal, styles.th]}>Total</Text>
        </View>
        {lineItems.map((item, i) => {
          const qty = Number(item.quantity);
          const price = Number(item.unit_price);
          return (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.colDescription, styles.td]}>
                {item.description}
              </Text>
              <Text style={[styles.colQty, styles.tdMuted]}>{qty}</Text>
              <Text style={[styles.colUnit, styles.tdMuted]}>
                {formatCurrency(price)}
              </Text>
              <Text style={[styles.colTotal, styles.td]}>
                {formatCurrency(qty * price)}
              </Text>
            </View>
          );
        })}

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalKey}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatCurrency(proposalSubtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalKey}>GST (10%)</Text>
            <Text style={styles.totalValue}>{formatCurrency(proposalGst)}</Text>
          </View>
          <View style={styles.totalRowEmphasis}>
            <Text style={[styles.totalValue, { fontSize: 11 }]}>Total</Text>
            <Text style={[styles.totalValue, { fontSize: 11 }]}>
              {formatCurrency(proposalTotal)}
            </Text>
          </View>
          <View style={[styles.totalRowEmphasis, { marginTop: 8 }]}>
            <Text style={[styles.totalValue, { fontSize: 11 }]}>{dueLabel}</Text>
            <Text style={[styles.totalValue, { fontSize: 11 }]}>
              {formatCurrency(invoiceAmount)}
            </Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Thank you for your business. INV-{shortNumber(invoice.id)}
        </Text>
      </Page>
    </Document>
  );
}
