'use client';

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { InvoiceData } from '@/types';

const BANK_DETAILS = {
  name: 'HOUSE OF RIDHIMA KAUR',
  accountNumber: '81830713139',
  ifsc: 'IDFB0021012',
  bankName: 'IDFC FIRST',
  branch: 'GURGAON SUSHANT LOK-I',
};

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1f2937',
    backgroundColor: '#ffffff',
  },
  // Decorative border
  outerBorder: {
    border: '2px solid #1f2937',
    padding: 15,
  },
  // Header
  header: {
    textAlign: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottom: '1px solid #d1d5db',
  },
  topDecor: {
    textAlign: 'center',
    fontSize: 14,
    color: '#d4af37',
    marginBottom: 5,
  },
  brandName: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: '#1f2937',
    letterSpacing: 1,
    marginBottom: 3,
  },
  dividerLine: {
    textAlign: 'center',
    fontSize: 10,
    color: '#d4af37',
    marginBottom: 3,
  },
  tagline: {
    fontSize: 8,
    color: '#6b7280',
    letterSpacing: 3,
    marginBottom: 8,
  },
  invoiceTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#1f2937',
    letterSpacing: 2,
  },
  // Invoice Details Row
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottom: '1px solid #e5e7eb',
  },
  detailBox: {
    width: '32%',
    textAlign: 'center',
  },
  detailLabel: {
    fontSize: 7,
    color: '#6b7280',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  detailValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#1f2937',
  },
  // Section
  section: {
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
    paddingHorizontal: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  // Guest Details
  guestName: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    color: '#1f2937',
    paddingVertical: 5,
  },
  // Stay Details Table
  table: {
    marginTop: 3,
    border: '1px solid #e5e7eb',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #e5e7eb',
  },
  tableRowLast: {
    flexDirection: 'row',
  },
  tableLabel: {
    width: '50%',
    padding: 6,
    fontSize: 9,
    color: '#374151',
    backgroundColor: '#f9fafb',
  },
  tableValue: {
    width: '50%',
    padding: 6,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#1f2937',
    textAlign: 'right',
  },
  // Total Row
  totalRow: {
    flexDirection: 'row',
    backgroundColor: '#1f2937',
    marginTop: 1,
  },
  totalLabel: {
    width: '50%',
    padding: 8,
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
  },
  totalValue: {
    width: '50%',
    padding: 8,
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#d4af37',
    textAlign: 'right',
  },
  // Bank Details
  bankSection: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
  },
  bankTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 1,
  },
  bankGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  bankItem: {
    width: '50%',
    marginBottom: 5,
  },
  bankLabel: {
    fontSize: 7,
    color: '#6b7280',
    marginBottom: 1,
  },
  bankValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#1f2937',
  },
  // Terms
  termsSection: {
    marginTop: 10,
    paddingTop: 8,
    borderTop: '1px solid #e5e7eb',
  },
  termsTitle: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#6b7280',
    marginBottom: 4,
    letterSpacing: 1,
  },
  termsText: {
    fontSize: 7,
    color: '#9ca3af',
    lineHeight: 1.4,
  },
  termItem: {
    marginBottom: 1,
  },
  // Signature
  signatureSection: {
    marginTop: 15,
    alignItems: 'flex-end',
  },
  signatureLine: {
    width: 140,
    borderTop: '1px solid #1f2937',
    paddingTop: 4,
    textAlign: 'center',
  },
  signatureText: {
    fontSize: 7,
    color: '#6b7280',
  },
  signatureName: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#1f2937',
    marginTop: 1,
  },
  // Footer
  footer: {
    marginTop: 12,
    textAlign: 'center',
    paddingTop: 10,
    borderTop: '1px solid #d4af37',
  },
  footerDecor: {
    fontSize: 10,
    color: '#d4af37',
    marginBottom: 5,
  },
  thankYou: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#1f2937',
    marginBottom: 3,
  },
  footerSubtext: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 5,
  },
  bottomDecor: {
    fontSize: 10,
    color: '#d4af37',
    marginTop: 3,
  },
});

const formatCurrency = (amount: number): string => {
  // Use Rs. instead of ₹ for better font compatibility
  return 'Rs. ' + new Intl.NumberFormat('en-IN').format(amount);
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

interface InvoicePDFProps {
  data: InvoiceData;
}

export default function InvoicePDF({ data }: InvoicePDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.outerBorder}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.topDecor}>* * *</Text>
            <Text style={styles.brandName}>House of Ridhima Kaur</Text>
            <Text style={styles.dividerLine}>---------- * ----------</Text>
            <Text style={styles.tagline}>L U X U R Y   V A C A T I O N   R E N T A L S</Text>
            <Text style={styles.invoiceTitle}>*  I N V O I C E  *</Text>
          </View>

          {/* Invoice Details Row */}
          <View style={styles.detailsRow}>
            <View style={styles.detailBox}>
              <Text style={styles.detailLabel}>Invoice No.</Text>
              <Text style={styles.detailValue}>{data.invoiceNo}</Text>
            </View>
            <View style={styles.detailBox}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{formatDate(data.invoiceDate)}</Text>
            </View>
            <View style={styles.detailBox}>
              <Text style={styles.detailLabel}>Booking ID</Text>
              <Text style={styles.detailValue}>{data.bookingId}</Text>
            </View>
          </View>

          {/* Guest Details */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionLine} />
              <Text style={styles.sectionTitle}>Guest Details</Text>
              <View style={styles.sectionLine} />
            </View>
            <Text style={styles.guestName}>{data.guestName}</Text>
          </View>

          {/* Stay Details */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionLine} />
              <Text style={styles.sectionTitle}>Stay Details</Text>
              <View style={styles.sectionLine} />
            </View>

            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>Check-In</Text>
                <Text style={styles.tableValue}>{formatDate(data.checkIn)} at 2:00 PM</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>Check-Out</Text>
                <Text style={styles.tableValue}>{formatDate(data.checkOut)} at 11:00 AM</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>Duration</Text>
                <Text style={styles.tableValue}>{data.nights} Night(s)</Text>
              </View>
              <View style={styles.tableRowLast}>
                <Text style={styles.tableLabel}>Rate per Night</Text>
                <Text style={styles.tableValue}>{formatCurrency(data.pricePerNight)}</Text>
              </View>
            </View>

            {/* Total */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>GRAND TOTAL</Text>
              <Text style={styles.totalValue}>{formatCurrency(data.totalAmount)}</Text>
            </View>
          </View>

          {/* Bank Details */}
          <View style={styles.bankSection}>
            <Text style={styles.bankTitle}>--- BANK DETAILS FOR PAYMENT ---</Text>
            <View style={styles.bankGrid}>
              <View style={styles.bankItem}>
                <Text style={styles.bankLabel}>Account Name</Text>
                <Text style={styles.bankValue}>{BANK_DETAILS.name}</Text>
              </View>
              <View style={styles.bankItem}>
                <Text style={styles.bankLabel}>Account Number</Text>
                <Text style={styles.bankValue}>{BANK_DETAILS.accountNumber}</Text>
              </View>
              <View style={styles.bankItem}>
                <Text style={styles.bankLabel}>IFSC Code</Text>
                <Text style={styles.bankValue}>{BANK_DETAILS.ifsc}</Text>
              </View>
              <View style={styles.bankItem}>
                <Text style={styles.bankLabel}>Bank</Text>
                <Text style={styles.bankValue}>{BANK_DETAILS.bankName}</Text>
              </View>
              <View style={styles.bankItem}>
                <Text style={styles.bankLabel}>Branch</Text>
                <Text style={styles.bankValue}>{BANK_DETAILS.branch}</Text>
              </View>
            </View>
          </View>

          {/* Terms */}
          <View style={styles.termsSection}>
            <Text style={styles.termsTitle}>TERMS & CONDITIONS:</Text>
            <View>
              <Text style={[styles.termsText, styles.termItem]}>- Check-in: 2:00 PM | Check-out: 11:00 AM</Text>
              <Text style={[styles.termsText, styles.termItem]}>- Valid government ID mandatory at check-in</Text>
              <Text style={[styles.termsText, styles.termItem]}>- No refunds for early checkout or no-shows</Text>
              <Text style={[styles.termsText, styles.termItem]}>- Damages to property will be charged separately</Text>
            </View>
          </View>

          {/* Signature */}
          <View style={styles.signatureSection}>
            <View style={styles.signatureLine}>
              <Text style={styles.signatureText}>Authorized Signature</Text>
              <Text style={styles.signatureName}>House of Ridhima Kaur</Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerDecor}>---------- * ----------</Text>
            <Text style={styles.thankYou}>Thank You for Staying With Us!</Text>
            <Text style={styles.footerSubtext}>We hope to host you again soon.</Text>
            <Text style={styles.bottomDecor}>* * *</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
