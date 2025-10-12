'use client';

import { useState } from 'react';
import { Booking, ROOM_IDS } from '@/types';

interface BookingFormProps {
  onSuccess: () => void;
  editingBooking?: Booking | null;
  onCancel?: () => void;
}

export default function BookingForm({ onSuccess, editingBooking, onCancel }: BookingFormProps) {
  const [formData, setFormData] = useState({
    date: editingBooking?.date || new Date().toISOString().split('T')[0],
    name: editingBooking?.name || '',
    aadhaar: editingBooking?.aadhaar || '',
    phone: editingBooking?.phone || '',
    payment: editingBooking?.payment || '',
    platform: editingBooking?.platform || 'Airbnb',
    roomId: editingBooking?.roomId || ROOM_IDS[0],
    checkIn: editingBooking?.checkIn || '',
    checkOut: editingBooking?.checkOut || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = editingBooking
        ? `/api/bookings/${editingBooking.id}`
        : '/api/bookings';

      const method = editingBooking ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save booking');
      }

      // Reset form if adding new booking
      if (!editingBooking) {
        setFormData({
          date: new Date().toISOString().split('T')[0],
          name: '',
          aadhaar: '',
          phone: '',
          payment: '',
          platform: 'Airbnb',
          roomId: ROOM_IDS[0],
          checkIn: '',
          checkOut: '',
        });
      }

      onSuccess();
    } catch (err) {
      setError('Failed to save booking. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {editingBooking ? 'Edit Booking' : 'Add New Booking'}
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Date */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
            Date *
          </label>
          <input
            type="date"
            id="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Guest Name *
          </label>
          <input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter guest name"
          />
        </div>

        {/* Aadhaar */}
        <div>
          <label htmlFor="aadhaar" className="block text-sm font-medium text-gray-700 mb-2">
            Aadhaar Card No *
          </label>
          <input
            type="text"
            id="aadhaar"
            required
            value={formData.aadhaar}
            onChange={(e) => setFormData({ ...formData, aadhaar: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="XXXX-XXXX-XXXX"
          />
        </div>

        {/* Phone Number */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="+91 XXXXX XXXXX"
          />
        </div>

        {/* Payment */}
        <div>
          <label htmlFor="payment" className="block text-sm font-medium text-gray-700 mb-2">
            Payment Amount *
          </label>
          <input
            type="text"
            id="payment"
            required
            value={formData.payment}
            onChange={(e) => setFormData({ ...formData, payment: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="₹5000"
          />
        </div>

        {/* Platform */}
        <div>
          <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-2">
            Platform *
          </label>
          <select
            id="platform"
            required
            value={formData.platform}
            onChange={(e) => setFormData({ ...formData, platform: e.target.value as Booking['platform'] })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Airbnb">Airbnb</option>
            <option value="Goibibo">Goibibo</option>
            <option value="MakeMyTrip">MakeMyTrip</option>
            <option value="Agoda">Agoda</option>
            <option value="Offline">Offline</option>
          </select>
        </div>

        {/* Room ID */}
        <div>
          <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 mb-2">
            Room Number *
          </label>
          <select
            id="roomId"
            required
            value={formData.roomId}
            onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {ROOM_IDS.map((roomId) => (
              <option key={roomId} value={roomId}>
                {roomId}
              </option>
            ))}
          </select>
        </div>

        {/* Check-in */}
        <div>
          <label htmlFor="checkIn" className="block text-sm font-medium text-gray-700 mb-2">
            Check-in Date *
          </label>
          <input
            type="date"
            id="checkIn"
            required
            value={formData.checkIn}
            onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Check-out */}
        <div>
          <label htmlFor="checkOut" className="block text-sm font-medium text-gray-700 mb-2">
            Check-out Date *
          </label>
          <input
            type="date"
            id="checkOut"
            required
            value={formData.checkOut}
            onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex gap-4 mt-6">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : editingBooking ? 'Update Booking' : 'Add Booking'}
        </button>

        {editingBooking && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
