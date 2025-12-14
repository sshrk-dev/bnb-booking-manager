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

  const handleDownload = async () => {
    setDownloading(true);
    setError('');

    try {
      const response = await fetch('/api/invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to generate invoice');
      }

      // Get the blob from the response
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.invoiceNo}_${data.guestName.replace(/\s+/g, '_')}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download invoice. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Invoice Generated</h2>
        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
          Ready to Download
        </span>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Invoice Summary */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Invoice No.</p>
            <p className="font-bold text-gray-900">{data.invoiceNo}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Booking ID</p>
            <p className="font-bold text-gray-900">{data.bookingId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Invoice Date</p>
            <p className="font-bold text-gray-900">{formatDate(data.invoiceDate)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Guest Name</p>
            <p className="font-bold text-gray-900">{data.guestName}</p>
          </div>
        </div>

        <hr className="my-4 border-gray-200" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Check-In</p>
            <p className="font-bold text-gray-900">{formatDate(data.checkIn)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Check-Out</p>
            <p className="font-bold text-gray-900">{formatDate(data.checkOut)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Duration</p>
            <p className="font-bold text-gray-900">{data.nights} Night(s)</p>
          </div>
        </div>

        <hr className="my-4 border-gray-200" />

        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Price per Night</p>
            <p className="font-bold text-gray-900">{formatCurrency(data.pricePerNight)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="font-bold text-2xl text-green-600">{formatCurrency(data.totalAmount)}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition inline-flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
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
          {downloading ? 'Generating...' : 'Download Invoice (.docx)'}
        </button>

        <button
          onClick={onCreateAnother}
          className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition inline-flex items-center gap-2"
        >
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create Another Invoice
        </button>
      </div>

      <p className="mt-4 text-sm text-gray-500">
        The invoice will be downloaded as a Word document (.docx) with your exact template design.
      </p>
    </div>
  );
}
