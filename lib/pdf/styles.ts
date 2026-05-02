import { StyleSheet } from "@react-pdf/renderer";

// Shared styles for invoice + proposal PDFs. The look is intentionally clean
// and professional — no colored backgrounds, just type, hairlines, and space.
export const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 56,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#171717",
    lineHeight: 1.4,
  },

  // Top band — document label on left, agency block on right.
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  documentLabel: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.5,
    color: "#171717",
  },
  agencyBlock: {
    textAlign: "right",
    maxWidth: 260,
  },
  agencyName: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  agencyLine: {
    fontSize: 9,
    color: "#525252",
  },

  // Two-column block: Bill to on the left, meta on the right.
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  blockLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    color: "#737373",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  partyName: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  partyLine: {
    fontSize: 9,
    color: "#525252",
  },
  metaList: {
    minWidth: 180,
  },
  metaPair: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  metaKey: {
    color: "#737373",
    marginRight: 16,
  },
  metaValue: {
    fontFamily: "Helvetica-Bold",
  },

  description: {
    marginBottom: 24,
    fontSize: 10,
    color: "#404040",
  },

  // Line items table.
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#171717",
    paddingBottom: 6,
    marginBottom: 6,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e5e5",
    paddingVertical: 6,
  },
  colDescription: { flex: 4 },
  colQty: { width: 40, textAlign: "right" },
  colUnit: { width: 80, textAlign: "right" },
  colTotal: { width: 80, textAlign: "right" },
  th: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#737373",
  },
  td: {
    fontSize: 10,
    color: "#171717",
  },
  tdMuted: {
    fontSize: 10,
    color: "#525252",
  },

  // Totals stack (right-aligned).
  totals: {
    marginTop: 16,
    alignSelf: "flex-end",
    minWidth: 240,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  totalRowEmphasis: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 6,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#171717",
  },
  totalKey: {
    color: "#525252",
  },
  totalValue: {
    fontFamily: "Helvetica-Bold",
  },

  footer: {
    position: "absolute",
    bottom: 24,
    left: 56,
    right: 56,
    textAlign: "center",
    fontSize: 8,
    color: "#a3a3a3",
  },
});

export const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(n);

export const formatDate = (d: Date | string) =>
  new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(d));

// Display number derived from a UUID — first 8 hex chars, uppercased.
export const shortNumber = (id: string) =>
  id.replace(/-/g, "").slice(0, 8).toUpperCase();
