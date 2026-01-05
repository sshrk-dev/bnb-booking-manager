'use client';

import { useState } from 'react';
import { Booking } from '@/types';

interface BookingsTableProps {
  bookings: Booking[];
  onEdit: (booking: Booking) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

export default function BookingsTable({ bookings, onEdit, onDelete, loading }: BookingsTableProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlatform, setFilterPlatform] = useState<string>('All');

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch =
      booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.aadhaar.includes(searchTerm) ||
      booking.payment.includes(searchTerm);

    const matchesPlatform = filterPlatform === 'All' || booking.platform === filterPlatform;

    return matchesSearch && matchesPlatform;
  });

  const handleDelete = (id: string) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = (id: string) => {
    onDelete(id);
    setDeleteConfirm(null);
  };

  const getPlatformStyle = (platform: string) => {
    switch (platform) {
      case 'Airbnb': return 'bg-red-100 text-red-800';
      case 'Goibibo': return 'bg-blue-100 text-blue-800';
      case 'MakeMyTrip': return 'bg-orange-100 text-orange-800';
      case 'Agoda': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">All Bookings</h2>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <input
            type="text"
            placeholder="Search name, Aadhaar, payment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          />

          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
            className="px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          >
            <option value="All">All Platforms</option>
            <option value="Airbnb">Airbnb</option>
            <option value="Goibibo">Goibibo</option>
            <option value="MakeMyTrip">MakeMyTrip</option>
            <option value="Agoda">Agoda</option>
            <option value="Offline">Offline</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600 text-sm sm:text-base">Loading bookings...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
          No bookings found. {searchTerm || filterPlatform !== 'All' ? 'Try adjusting your filters.' : 'Add your first booking above!'}
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="block lg:hidden space-y-3">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                {/* Header with name and platform */}
                <div className="flex justify-between items-start mb-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 truncate">{booking.name}</p>
                    <p className="text-xs text-gray-500">ID: {booking.id}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 flex-shrink-0 ${getPlatformStyle(booking.platform)}`}>
                    {booking.platform}
                  </span>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <p className="text-gray-500 text-xs">Room</p>
                    <p className="text-gray-900">{booking.roomId}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Guests</p>
                    <p className="text-gray-900">{1 + (booking.additionalGuests?.length || 0)} {1 + (booking.additionalGuests?.length || 0) === 1 ? 'guest' : 'guests'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Payment</p>
                    <p className="text-gray-900 font-medium">₹{parseFloat(booking.payment).toLocaleString('en-IN')}</p>
                    {booking.ratePerNight && booking.totalNights && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {booking.totalNights} {booking.totalNights === 1 ? 'night' : 'nights'} @ ₹{parseFloat(booking.ratePerNight).toLocaleString('en-IN')}
                        {booking.customDailyRates && Object.keys(booking.customDailyRates).length > 0 && ' *'}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Check-in</p>
                    <p className="text-gray-900">{new Date(booking.checkIn).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Check-out</p>
                    <p className="text-gray-900">{new Date(booking.checkOut).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Phone</p>
                    <p className="text-gray-900">{booking.phone}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                  {deleteConfirm === booking.id ? (
                    <>
                      <button
                        onClick={() => confirmDelete(booking.id)}
                        className="px-3 py-1.5 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
                      >
                        Confirm Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => onEdit(booking)}
                        className="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(booking.id)}
                        className="px-3 py-1.5 text-sm text-red-600 hover:text-red-800 font-medium"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guest Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guests
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Platform
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Room
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-in
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-out
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {booking.id}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(booking.date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      <div className="flex flex-col">
                        <span className="font-medium">{booking.name}</span>
                        <span className="text-xs text-gray-500">{booking.aadhaar}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {1 + (booking.additionalGuests?.length || 0)} {1 + (booking.additionalGuests?.length || 0) === 1 ? 'guest' : 'guests'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {booking.phone}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">₹{parseFloat(booking.payment).toLocaleString('en-IN')}</span>
                        {booking.ratePerNight && booking.totalNights && (
                          <span className="text-xs text-gray-500 mt-0.5" title={booking.customDailyRates && Object.keys(booking.customDailyRates).length > 0 ? 'Custom daily pricing applied' : ''}>
                            {booking.totalNights} {booking.totalNights === 1 ? 'night' : 'nights'} @ ₹{parseFloat(booking.ratePerNight).toLocaleString('en-IN')}
                            {booking.customDailyRates && Object.keys(booking.customDailyRates).length > 0 && ' *'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlatformStyle(booking.platform)}`}>
                        {booking.platform}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {booking.roomId}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(booking.checkIn).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(booking.checkOut).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      {deleteConfirm === booking.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => confirmDelete(booking.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => onEdit(booking)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(booking.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="mt-4 text-xs sm:text-sm text-gray-600">
        Showing {filteredBookings.length} of {bookings.length} bookings
      </div>
    </div>
  );
}
