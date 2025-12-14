'use client';

import { useState } from 'react';
import Link from 'next/link';
import InvoiceForm from '@/components/InvoiceForm';
import InvoicePreview from '@/components/InvoicePreview';
import { InvoiceData } from '@/types';

export default function InvoicePage() {
  const [generatedInvoice, setGeneratedInvoice] = useState<InvoiceData | null>(null);

  const handleGenerate = (data: InvoiceData) => {
    setGeneratedInvoice(data);
  };

  const handleCreateAnother = () => {
    setGeneratedInvoice(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-gray-800">Invoice Generator</h1>
            </div>
            <span className="text-sm text-gray-500">House of Ridhima Kaur</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {generatedInvoice ? (
          <InvoicePreview data={generatedInvoice} onCreateAnother={handleCreateAnother} />
        ) : (
          <InvoiceForm onGenerate={handleGenerate} />
        )}
      </main>
    </div>
  );
}
