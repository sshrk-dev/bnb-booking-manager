'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
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
  const [filterRoomId, setFilterRoomId] = useState<string>('All');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch =
      booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.aadhaar.includes(searchTerm) ||
      booking.phone.includes(searchTerm) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.payment.includes(searchTerm);

    const matchesPlatform = filterPlatform === 'All' || booking.platform === filterPlatform;
    const matchesRoom = filterRoomId === 'All' || booking.roomId === filterRoomId;

    const matchesDateFrom = !filterDateFrom || new Date(booking.date) >= new Date(filterDateFrom);
    const matchesDateTo = !filterDateTo || new Date(booking.date) <= new Date(filterDateTo);

    return matchesSearch && matchesPlatform && matchesRoom && matchesDateFrom && matchesDateTo;
  });

  // Get unique room IDs for filter
  const uniqueRoomIds = Array.from(new Set(bookings.map(b => b.roomId))).sort();

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

  // Helper to extract path from URL (handles both old public URLs and new paths)
  const extractPath = (urlOrPath: string): string => {
    // If it's already a path (doesn't contain http), return as is
    if (!urlOrPath.includes('http')) {
      return urlOrPath;
    }
    // Extract path from public URL
    const parts = urlOrPath.split('/storage/v1/object/public/aadhaar-cards/');
    return parts.length > 1 ? parts[1] : urlOrPath;
  };

  // Fetch signed URLs for all images when viewing booking
  useEffect(() => {
    const fetchSignedUrls = async () => {
      if (!viewingBooking) {
        setSignedUrls({});
        return;
      }

      const urlsToFetch: Record<string, string> = {};

      // Primary guest image
      if (viewingBooking.aadhaarImageUrl) {
        const path = extractPath(viewingBooking.aadhaarImageUrl);
        urlsToFetch[`primary`] = path;
      }

      // Additional guests images
      if (viewingBooking.additionalGuests) {
        viewingBooking.additionalGuests.forEach((guest, index) => {
          if (guest.aadhaarImageUrl) {
            const path = extractPath(guest.aadhaarImageUrl);
            urlsToFetch[`guest-${index}`] = path;
          }
        });
      }

      // Fetch all signed URLs
      const fetchedUrls: Record<string, string> = {};
      for (const [key, path] of Object.entries(urlsToFetch)) {
        try {
          const response = await fetch(`/api/aadhaar-image?path=${encodeURIComponent(path)}`);
          const data = await response.json();
          if (data.signedUrl) {
            fetchedUrls[key] = data.signedUrl;
          }
        } catch (error) {
          console.error(`Error fetching signed URL for ${key}:`, error);
        }
      }

      setSignedUrls(fetchedUrls);
    };

    fetchSignedUrls();
  }, [viewingBooking]);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">All Bookings</h2>

        {/* Filters */}
        <div className="space-y-3">
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search by name, ID, phone, Aadhaar, or amount..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          />

          {/* Filter Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Platform Filter */}
            <select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="All">All Platforms</option>
              <option value="Airbnb">Airbnb</option>
              <option value="Goibibo">Goibibo</option>
              <option value="MakeMyTrip">MakeMyTrip</option>
              <option value="Agoda">Agoda</option>
              <option value="Offline">Offline</option>
            </select>

            {/* Room Filter */}
            <select
              value={filterRoomId}
              onChange={(e) => setFilterRoomId(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="All">All Rooms</option>
              {uniqueRoomIds.map(roomId => (
                <option key={roomId} value={roomId}>{roomId}</option>
              ))}
            </select>

            {/* Date From */}
            <input
              type="date"
              placeholder="From Date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />

            {/* Date To */}
            <input
              type="date"
              placeholder="To Date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Clear Filters Button */}
          {(searchTerm || filterPlatform !== 'All' || filterRoomId !== 'All' || filterDateFrom || filterDateTo) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterPlatform('All');
                setFilterRoomId('All');
                setFilterDateFrom('');
                setFilterDateTo('');
              }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear all filters
            </button>
          )}
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
                        onClick={() => setViewingBooking(booking)}
                        className="px-3 py-1.5 text-sm text-green-600 hover:text-green-800 font-medium"
                      >
                        View
                      </button>
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
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500">{booking.aadhaar}</span>
                          {booking.aadhaarImageUrl && (
                            <span className="inline-flex items-center text-blue-600" title="Aadhaar card image uploaded">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </span>
                          )}
                        </div>
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
                            onClick={() => setViewingBooking(booking)}
                            className="text-green-600 hover:text-green-900"
                          >
                            View
                          </button>
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

      {/* View Details Modal */}
      {viewingBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
              <button
                onClick={() => setViewingBooking(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Booking ID</p>
                    <p className="text-base font-medium text-gray-900">{viewingBooking.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Booking Date</p>
                    <p className="text-base font-medium text-gray-900">{new Date(viewingBooking.date).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Platform</p>
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${getPlatformStyle(viewingBooking.platform)}`}>
                      {viewingBooking.platform}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Room Number</p>
                    <p className="text-base font-medium text-gray-900">{viewingBooking.roomId}</p>
                  </div>
                </div>
              </div>

              {/* Stay Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Stay Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Check-in</p>
                    <p className="text-base font-medium text-gray-900">{new Date(viewingBooking.checkIn).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Check-out</p>
                    <p className="text-base font-medium text-gray-900">{new Date(viewingBooking.checkOut).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Nights</p>
                    <p className="text-base font-medium text-gray-900">{viewingBooking.totalNights || 'N/A'} nights</p>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Payment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Rate per Night</p>
                    <p className="text-base font-medium text-gray-900">
                      {viewingBooking.ratePerNight ? `₹${parseFloat(viewingBooking.ratePerNight).toLocaleString('en-IN')}` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="text-xl font-bold text-green-600">₹{parseFloat(viewingBooking.payment).toLocaleString('en-IN')}</p>
                  </div>
                </div>
                {viewingBooking.customDailyRates && Object.keys(viewingBooking.customDailyRates).length > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-2">Custom Daily Pricing</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.entries(viewingBooking.customDailyRates).map(([date, rate]) => (
                        <div key={date} className="text-sm">
                          <span className="text-gray-600">{new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}:</span>{' '}
                          <span className="font-medium">₹{rate.toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Primary Guest */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Primary Guest</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="text-base font-medium text-gray-900">{viewingBooking.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-base font-medium text-gray-900">{viewingBooking.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Aadhaar Number</p>
                    <p className="text-base font-medium text-gray-900">{viewingBooking.aadhaar}</p>
                  </div>
                  {viewingBooking.aadhaarImageUrl && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500 mb-2">Aadhaar Card Image</p>
                      {signedUrls['primary'] ? (
                        <div
                          className="relative w-full max-w-md h-64 rounded-lg border border-gray-300 shadow-sm hover:shadow-md transition cursor-pointer overflow-hidden"
                          onClick={() => window.open(signedUrls['primary'], '_blank')}
                        >
                          <Image
                            src={signedUrls['primary']}
                            alt="Primary Guest Aadhaar"
                            fill
                            sizes="(max-width: 768px) 100vw, 448px"
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-full max-w-md h-48 rounded-lg border border-gray-300 bg-gray-100 flex items-center justify-center">
                          <div className="text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                            <p className="text-sm text-gray-600">Loading image...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Guests */}
              {viewingBooking.additionalGuests && viewingBooking.additionalGuests.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Additional Guests ({viewingBooking.additionalGuests.length})
                  </h3>
                  <div className="space-y-4">
                    {viewingBooking.additionalGuests.map((guest, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-3">Guest {index + 2}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Name</p>
                            <p className="text-base font-medium text-gray-900">{guest.name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="text-base font-medium text-gray-900">{guest.phone}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Aadhaar Number</p>
                            <p className="text-base font-medium text-gray-900">{guest.aadhaar}</p>
                          </div>
                          {guest.aadhaarImageUrl && (
                            <div className="md:col-span-2">
                              <p className="text-sm text-gray-500 mb-2">Aadhaar Card Image</p>
                              {signedUrls[`guest-${index}`] ? (
                                <div
                                  className="relative w-full max-w-md h-64 rounded-lg border border-gray-300 shadow-sm hover:shadow-md transition cursor-pointer overflow-hidden"
                                  onClick={() => window.open(signedUrls[`guest-${index}`], '_blank')}
                                >
                                  <Image
                                    src={signedUrls[`guest-${index}`]}
                                    alt={`Guest ${index + 2} Aadhaar`}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 448px"
                                    className="object-contain"
                                    unoptimized
                                  />
                                </div>
                              ) : (
                                <div className="w-full max-w-md h-48 rounded-lg border border-gray-300 bg-gray-100 flex items-center justify-center">
                                  <div className="text-center">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                                    <p className="text-sm text-gray-600">Loading image...</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setViewingBooking(null);
                  onEdit(viewingBooking);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Edit Booking
              </button>
              <button
                onClick={() => setViewingBooking(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
