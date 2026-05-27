import { Document, Page, Text, View } from "@react-pdf/renderer";
import { styles, formatCurrency, formatDate, shortNumber } from "./styles";
import { AgencyBlock } from "./agency-block";
import type { UserProfile } from "@/lib/user-profile";

const colDuration = { width: 70, textAlign: "right" as const };

export type ProposalPdfProps = {
  proposal: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    total_amount: string;
    deposit_percentage: string;
    created_at: string | Date;
  };
  client: {
    name: string;
    email: string | null;
    company_name?: string | null;
  };
  lineItems: {
    description: string;
    quantity: string;
    unit_price: string;
    estimated_duration: string | null;
  }[];
  profile: UserProfile;
  account: { name: string | null; email: string };
};

export function ProposalPdf(props: ProposalPdfProps) {
  const { proposal, client, lineItems, profile, account } = props;

  const total = Number(proposal.total_amount);
  const subtotal = total / 1.1;
  const gst = total - subtotal;
  const depositPct = Number(proposal.deposit_percentage);
  const deposit = total * (depositPct / 100);

  return (
    <Document
      title={`Proposal ${shortNumber(proposal.id)}`}
      author={profile.business_name ?? account.name ?? account.email}
    >
      <Page size="A4" style={styles.page}>
        {/* Top band */}
        <View style={styles.topRow}>
          <View>
            <Text style={styles.documentLabel}>PROPOSAL</Text>
            <Text style={[styles.partyLine, { marginTop: 4 }]}>
              {proposal.title}
            </Text>
          </View>
          <AgencyBlock
            profile={profile}
            fallbackName={account.name}
            fallbackEmail={account.email}
          />
        </View>

        {/* Prepared for + meta */}
        <View style={styles.metaRow}>
          <View>
            <Text style={styles.blockLabel}>Prepared for</Text>
            <Text style={styles.partyName}>{client.name}</Text>
            {client.company_name ? (
              <Text style={styles.partyLine}>{client.company_name}</Text>
            ) : null}
            {client.email ? (
              <Text style={styles.partyLine}>{client.email}</Text>
            ) : null}
          </View>

          <View style={styles.metaList}>
            <View style={styles.metaPair}>
              <Text style={styles.metaKey}>Proposal number</Text>
              <Text style={styles.metaValue}>PRO-{shortNumber(proposal.id)}</Text>
            </View>
            <View style={styles.metaPair}>
              <Text style={styles.metaKey}>Issued</Text>
              <Text style={styles.metaValue}>{formatDate(proposal.created_at)}</Text>
            </View>
            <View style={styles.metaPair}>
              <Text style={styles.metaKey}>Status</Text>
              <Text style={[styles.metaValue, { textTransform: "capitalize" }]}>
                {proposal.status.replace("_", " ")}
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        {proposal.description ? (
          <Text style={styles.description}>{proposal.description}</Text>
        ) : null}

        {/* Line items */}
        <View style={styles.tableHeader}>
          <Text style={[styles.colDescription, styles.th]}>Description</Text>
          <Text style={[styles.colQty, styles.th]}>Qty</Text>
          <Text style={[styles.colUnit, styles.th]}>Unit price</Text>
          <Text style={[colDuration, styles.th]}>Duration</Text>
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
              <Text style={[colDuration, styles.tdMuted]}>
                {item.estimated_duration ?? "—"}
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
            <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalKey}>GST (10%)</Text>
            <Text style={styles.totalValue}>{formatCurrency(gst)}</Text>
          </View>
          <View style={styles.totalRowEmphasis}>
            <Text style={[styles.totalValue, { fontSize: 11 }]}>Total</Text>
            <Text style={[styles.totalValue, { fontSize: 11 }]}>
              {formatCurrency(total)}
            </Text>
          </View>
          {depositPct > 0 ? (
            <View style={styles.totalRow}>
              <Text style={styles.totalKey}>Deposit ({depositPct}%)</Text>
              <Text style={styles.totalValue}>{formatCurrency(deposit)}</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.footer}>PRO-{shortNumber(proposal.id)}</Text>
      </Page>
    </Document>
  );
}
