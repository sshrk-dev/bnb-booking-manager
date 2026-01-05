'use client';

import { useState, useEffect } from 'react';
import { InvoiceData } from '@/types';

interface InvoiceFormProps {
  onGenerate: (data: InvoiceData) => void;
}

const generateId = (prefix: string): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = prefix;
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const calculateNights = (checkIn: string, checkOut: string): number => {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = end.getTime() - start.getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
};

export default function InvoiceForm({ onGenerate }: InvoiceFormProps) {
  const [formData, setFormData] = useState({
    guestName: '',
    checkIn: '',
    checkOut: '',
    pricePerNight: '',
  });

  const [nights, setNights] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  // Auto-calculate nights and total when dates or price change
  useEffect(() => {
    const calculatedNights = calculateNights(formData.checkIn, formData.checkOut);
    setNights(calculatedNights);

    const price = parseFloat(formData.pricePerNight) || 0;
    setTotalAmount(calculatedNights * price);
  }, [formData.checkIn, formData.checkOut, formData.pricePerNight]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (nights <= 0) {
      alert('Check-out date must be after check-in date');
      return;
    }

    const invoiceData: InvoiceData = {
      invoiceNo: generateId('INV-'),
      invoiceDate: new Date().toISOString().split('T')[0],
      bookingId: generateId('BK-'),
      guestName: formData.guestName,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      nights,
      pricePerNight: parseFloat(formData.pricePerNight),
      totalAmount,
    };

    onGenerate(invoiceData);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">Create Invoice</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Guest Name */}
        <div className="sm:col-span-2">
          <label htmlFor="guestName" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            Guest Name *
          </label>
          <input
            type="text"
            id="guestName"
            required
            value={formData.guestName}
            onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            placeholder="Enter guest name"
          />
        </div>

        {/* Check-in */}
        <div>
          <label htmlFor="checkIn" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            Check-in Date *
          </label>
          <input
            type="date"
            id="checkIn"
            required
            value={formData.checkIn}
            onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          />
        </div>

        {/* Check-out */}
        <div>
          <label htmlFor="checkOut" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            Check-out Date *
          </label>
          <input
            type="date"
            id="checkOut"
            required
            value={formData.checkOut}
            onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          />
        </div>

        {/* Price per Night */}
        <div>
          <label htmlFor="pricePerNight" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            Price per Night (₹) *
          </label>
          <input
            type="number"
            id="pricePerNight"
            required
            min="0"
            value={formData.pricePerNight}
            onChange={(e) => setFormData({ ...formData, pricePerNight: e.target.value })}
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            placeholder="5000"
          />
        </div>

        {/* Calculated Fields */}
        <div className="bg-gray-50 rounded-md p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-gray-600 mb-2">
            Number of Nights: <span className="font-bold text-gray-900">{nights}</span>
          </p>
          <p className="text-xs sm:text-sm text-gray-600">
            Total Amount: <span className="font-bold text-gray-900 text-base sm:text-lg">{formatCurrency(totalAmount)}</span>
          </p>
        </div>
      </div>

      <div className="mt-4 sm:mt-6">
        <button
          type="submit"
          disabled={nights <= 0 || !formData.pricePerNight}
          className="w-full sm:w-auto bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-2 rounded-md hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base font-medium"
        >
          Generate Invoice
        </button>
      </div>
    </form>
  );
}
