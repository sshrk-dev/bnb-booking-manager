'use client';

import { useState } from 'react';
import { InvoiceData } from '@/types';

interface InvoicePreviewProps {
  data: InvoiceData;
  onCreateAnother: () => void;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export default function InvoicePreview({ data, onCreateAnother }: InvoicePreviewProps) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  const handleDownloadPdf = async () => {
    setDownloading(true);
    setError('');

    try {
      const response = await fetch('/api/invoice/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.invoiceNo}_${data.guestName.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('PDF generation error:', err);
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Invoice Generated</h2>
        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs sm:text-sm font-medium self-start sm:self-auto">
          Ready to Download
        </span>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Invoice Summary */}
      <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Invoice No.</p>
            <p className="font-bold text-gray-900 text-sm sm:text-base">{data.invoiceNo}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Booking ID</p>
            <p className="font-bold text-gray-900 text-sm sm:text-base">{data.bookingId}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Invoice Date</p>
            <p className="font-bold text-gray-900 text-sm sm:text-base">{formatDate(data.invoiceDate)}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Guest Name</p>
            <p className="font-bold text-gray-900 text-sm sm:text-base truncate">{data.guestName}</p>
          </div>
        </div>

        <hr className="my-3 sm:my-4 border-gray-200" />

        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Check-In</p>
            <p className="font-bold text-gray-900 text-xs sm:text-base">{formatDate(data.checkIn)}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Check-Out</p>
            <p className="font-bold text-gray-900 text-xs sm:text-base">{formatDate(data.checkOut)}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Duration</p>
            <p className="font-bold text-gray-900 text-xs sm:text-base">{data.nights} Night(s)</p>
          </div>
        </div>

        <hr className="my-3 sm:my-4 border-gray-200" />

        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Price per Night</p>
            <p className="font-bold text-gray-900 text-sm sm:text-base">{formatCurrency(data.pricePerNight)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs sm:text-sm text-gray-600">Total Amount</p>
            <p className="font-bold text-xl sm:text-2xl text-green-600">{formatCurrency(data.totalAmount)}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <button
          onClick={handleDownloadPdf}
          disabled={downloading}
          className="flex-1 sm:flex-none bg-red-600 text-white px-4 sm:px-6 py-2.5 sm:py-2 rounded-md hover:bg-red-700 transition inline-flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base font-medium"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 sm:h-5 sm:w-5"
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
          {downloading ? 'Generating...' : 'Download PDF'}
        </button>

        <button
          onClick={onCreateAnother}
          className="flex-1 sm:flex-none bg-gray-200 text-gray-700 px-4 sm:px-6 py-2.5 sm:py-2 rounded-md hover:bg-gray-300 transition inline-flex items-center justify-center gap-2 text-sm sm:text-base font-medium"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 sm:h-5 sm:w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span className="hidden sm:inline">Create Another Invoice</span>
          <span className="sm:hidden">Create Another</span>
        </button>
      </div>
    </div>
  );
}
