'use client';

import { PDFDownloadLink } from '@react-pdf/renderer';
import InvoicePDF from './InvoicePDF';
import { InvoiceData } from '@/types';

interface PDFDownloadButtonProps {
  data: InvoiceData;
  fileName: string;
}

export default function PDFDownloadButton({ data, fileName }: PDFDownloadButtonProps) {
  return (
    <PDFDownloadLink
      document={<InvoicePDF data={data} />}
      fileName={fileName}
      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition inline-flex items-center gap-2"
    >
      {({ loading }) => (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          {loading ? 'Preparing PDF...' : 'Download PDF'}
        </>
      )}
    </PDFDownloadLink>
  );
}
