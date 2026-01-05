'use client';

import { useState, useEffect, useMemo } from 'react';
import { Booking, ROOM_IDS, GuestInfo } from '@/types';

// Extended guest info for form handling (includes file upload state)
interface GuestInfoWithFile extends GuestInfo {
  aadhaarFile?: File;
  aadhaarInputType?: 'number' | 'image';
}

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
    ratePerNight: editingBooking?.ratePerNight || '',
    platform: editingBooking?.platform || 'Airbnb',
    roomId: editingBooking?.roomId || ROOM_IDS[0],
    checkIn: editingBooking?.checkIn || '',
    checkOut: editingBooking?.checkOut || '',
  });

  const [additionalGuests, setAdditionalGuests] = useState<GuestInfoWithFile[]>(
    editingBooking?.additionalGuests || []
  );
  const [useCustomRates, setUseCustomRates] = useState(false);
  const [customDailyRates, setCustomDailyRates] = useState<Record<string, number>>(
    editingBooking?.customDailyRates || {}
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Aadhaar upload states
  const [primaryAadhaarInputType, setPrimaryAadhaarInputType] = useState<'number' | 'image'>(
    editingBooking?.aadhaarImageUrl ? 'image' : 'number'
  );
  const [primaryAadhaarFile, setPrimaryAadhaarFile] = useState<File | null>(null);
  const [primaryAadhaarImageUrl, setPrimaryAadhaarImageUrl] = useState<string>(
    editingBooking?.aadhaarImageUrl || ''
  );

  // Calculate nights
  const totalNights = useMemo(() => {
    if (!formData.checkIn || !formData.checkOut) return 0;
    const start = new Date(formData.checkIn);
    const end = new Date(formData.checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [formData.checkIn, formData.checkOut]);

  // Generate date range for custom pricing
  const dateRange = useMemo(() => {
    if (!formData.checkIn || !formData.checkOut) return [];
    const dates: string[] = [];
    const start = new Date(formData.checkIn);

    for (let i = 0; i < totalNights; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);
      dates.push(currentDate.toISOString().split('T')[0]);
    }

    return dates;
  }, [formData.checkIn, formData.checkOut, totalNights]);

  // Calculate total amount
  const totalAmount = useMemo(() => {
    if (useCustomRates && Object.keys(customDailyRates).length > 0) {
      return dateRange.reduce((total, date) => {
        const rate = customDailyRates[date] || parseFloat(formData.ratePerNight) || 0;
        return total + rate;
      }, 0);
    }
    return (parseFloat(formData.ratePerNight) || 0) * totalNights;
  }, [useCustomRates, customDailyRates, formData.ratePerNight, totalNights, dateRange]);

  // Update form when editingBooking changes
  useEffect(() => {
    if (editingBooking) {
      setFormData({
        date: editingBooking.date || new Date().toISOString().split('T')[0],
        name: editingBooking.name || '',
        aadhaar: editingBooking.aadhaar || '',
        phone: editingBooking.phone || '',
        ratePerNight: editingBooking.ratePerNight || '',
        platform: editingBooking.platform || 'Airbnb',
        roomId: editingBooking.roomId || ROOM_IDS[0],
        checkIn: editingBooking.checkIn || '',
        checkOut: editingBooking.checkOut || '',
      });
      setAdditionalGuests(editingBooking.additionalGuests || []);
      setCustomDailyRates(editingBooking.customDailyRates || {});
      setUseCustomRates(!!(editingBooking.customDailyRates && Object.keys(editingBooking.customDailyRates).length > 0));
      setPrimaryAadhaarInputType(editingBooking.aadhaarImageUrl ? 'image' : 'number');
      setPrimaryAadhaarImageUrl(editingBooking.aadhaarImageUrl || '');
      setPrimaryAadhaarFile(null);
    }
  }, [editingBooking]);

  // Initialize custom rates when switching to custom mode or dates change
  useEffect(() => {
    if (useCustomRates && dateRange.length > 0) {
      const newRates = { ...customDailyRates };
      dateRange.forEach(date => {
        if (!(date in newRates)) {
          newRates[date] = parseFloat(formData.ratePerNight) || 0;
        }
      });
      setCustomDailyRates(newRates);
    }
  }, [useCustomRates, dateRange.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Add a new guest
  const addGuest = () => {
    setAdditionalGuests([...additionalGuests, { name: '', aadhaar: '', phone: '' }]);
  };

  // Remove a guest by index
  const removeGuest = (index: number) => {
    setAdditionalGuests(additionalGuests.filter((_, i) => i !== index));
  };

  // Update guest field
  const updateGuest = (index: number, field: keyof GuestInfo, value: string) => {
    const updated = [...additionalGuests];
    updated[index] = { ...updated[index], [field]: value };
    setAdditionalGuests(updated);
  };

  // Handle file upload for guest
  const handleGuestFileUpload = async (index: number, file: File | null) => {
    if (!file) return;

    const updated = [...additionalGuests];
    // Temporarily store file reference in a way we can retrieve it later
    // We'll upload during form submission
    updated[index] = { ...updated[index], aadhaarFile: file };
    setAdditionalGuests(updated);
  };

  // Upload Aadhaar image helper
  const uploadAadhaarImage = async (file: File, bookingId: string, guestType: 'primary' | number): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bookingId', bookingId);
    formData.append('guestType', guestType.toString());

    try {
      const response = await fetch('/api/upload-aadhaar', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      return data.url;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Generate temp booking ID for file uploads (use existing ID if editing)
      const tempBookingId = editingBooking?.id || `TEMP_${Date.now()}`;

      // Upload primary guest Aadhaar image if file is selected
      let primaryImageUrl = primaryAadhaarImageUrl;
      if (primaryAadhaarFile && primaryAadhaarInputType === 'image') {
        const uploadedUrl = await uploadAadhaarImage(primaryAadhaarFile, tempBookingId, 'primary');
        if (uploadedUrl) {
          primaryImageUrl = uploadedUrl;
        } else {
          throw new Error('Failed to upload primary guest Aadhaar image');
        }
      }

      // Upload additional guests' Aadhaar images
      const updatedAdditionalGuests = await Promise.all(
        additionalGuests.map(async (guest, index) => {
          if (guest.aadhaarFile) {
            const uploadedUrl = await uploadAadhaarImage(guest.aadhaarFile, tempBookingId, index);
            if (uploadedUrl) {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { aadhaarFile, aadhaarInputType, ...guestData } = guest;
              return { ...guestData, aadhaarImageUrl: uploadedUrl };
            }
          }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { aadhaarFile, aadhaarInputType, ...guestData } = guest;
          return guestData;
        })
      );

      const url = editingBooking
        ? `/api/bookings/${editingBooking.id}`
        : '/api/bookings';

      const method = editingBooking ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        aadhaarImageUrl: primaryAadhaarInputType === 'image' ? primaryImageUrl : undefined,
        additionalGuests: updatedAdditionalGuests,
        customDailyRates: useCustomRates ? customDailyRates : undefined,
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save booking');
      }

      // Reset form if adding new booking
      if (!editingBooking) {
        setFormData({
          date: new Date().toISOString().split('T')[0],
          name: '',
          aadhaar: '',
          phone: '',
          ratePerNight: '',
          platform: 'Airbnb',
          roomId: ROOM_IDS[0],
          checkIn: '',
          checkOut: '',
        });
        setAdditionalGuests([]);
        setCustomDailyRates({});
        setUseCustomRates(false);
        setPrimaryAadhaarFile(null);
        setPrimaryAadhaarImageUrl('');
        setPrimaryAadhaarInputType('number');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save booking. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">
        {editingBooking ? 'Edit Booking' : 'Add New Booking'}
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded mb-4 text-sm sm:text-base">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Date */}
        <div>
          <label htmlFor="date" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            Date *
          </label>
          <input
            type="date"
            id="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          />
        </div>

        {/* Primary Guest Name */}
        <div>
          <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            Primary Guest Name *
          </label>
          <input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            placeholder="Enter primary guest name"
          />
        </div>

        {/* Primary Guest Aadhaar */}
        <div className="sm:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="aadhaar" className="block text-xs sm:text-sm font-medium text-gray-700">
              Aadhaar Card {primaryAadhaarInputType === 'number' ? 'Number' : 'Image'} *
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Enter Number</span>
              <button
                type="button"
                onClick={() => {
                  setPrimaryAadhaarInputType(prev => prev === 'number' ? 'image' : 'number');
                  setPrimaryAadhaarFile(null);
                }}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition ${
                  primaryAadhaarInputType === 'image' ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    primaryAadhaarInputType === 'image' ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-xs text-gray-600">Upload Image</span>
            </div>
          </div>

          {primaryAadhaarInputType === 'number' ? (
            <input
              type="text"
              id="aadhaar"
              required
              value={formData.aadhaar}
              onChange={(e) => setFormData({ ...formData, aadhaar: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              placeholder="XXXX-XXXX-XXXX"
            />
          ) : (
            <div>
              <input
                type="file"
                id="aadhaar-image"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setPrimaryAadhaarFile(file);
                    setFormData({ ...formData, aadhaar: file.name }); // Set some value for required field
                  }
                }}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
              {primaryAadhaarFile && (
                <p className="mt-1 text-xs text-green-600">✓ {primaryAadhaarFile.name}</p>
              )}
              {primaryAadhaarImageUrl && !primaryAadhaarFile && (
                <p className="mt-1 text-xs text-blue-600">✓ Image already uploaded</p>
              )}
            </div>
          )}
        </div>

        {/* Primary Guest Phone */}
        <div>
          <label htmlFor="phone" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            placeholder="+91 XXXXX XXXXX"
          />
        </div>
      </div>

      {/* Additional Guests Section */}
      <div className="mt-4 sm:mt-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-sm sm:text-base font-semibold text-gray-800">
            Additional Guests {additionalGuests.length > 0 && <span className="text-gray-500 text-sm font-normal">({additionalGuests.length})</span>}
          </h3>
          <button
            type="button"
            onClick={addGuest}
            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Guest
          </button>
        </div>

        {additionalGuests.length > 0 && (
          <div className="space-y-4">
            {additionalGuests.map((guest, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Guest {index + 2}</span>
                  <button
                    type="button"
                    onClick={() => removeGuest(index)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={guest.name}
                      onChange={(e) => updateGuest(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="Guest name"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700">
                        Aadhaar {guest.aadhaarInputType === 'image' ? 'Image' : 'Number'} *
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...additionalGuests];
                          const currentType = updated[index].aadhaarInputType || 'number';
                          updated[index] = {
                            ...updated[index],
                            aadhaarInputType: currentType === 'number' ? 'image' : 'number',
                            aadhaarFile: undefined
                          };
                          setAdditionalGuests(updated);
                        }}
                        className={`relative inline-flex h-4 w-8 items-center rounded-full transition ${
                          guest.aadhaarInputType === 'image' ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${
                            guest.aadhaarInputType === 'image' ? 'translate-x-4' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {guest.aadhaarInputType === 'image' ? (
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleGuestFileUpload(index, file);
                              updateGuest(index, 'aadhaar', file.name); // Set some value for required field
                            }
                          }}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
                        />
                        {guest.aadhaarFile && (
                          <p className="mt-1 text-xs text-green-600">✓ {guest.aadhaarFile.name}</p>
                        )}
                        {guest.aadhaarImageUrl && !guest.aadhaarFile && (
                          <p className="mt-1 text-xs text-blue-600">✓ Image uploaded</p>
                        )}
                      </div>
                    ) : (
                      <input
                        type="text"
                        required
                        value={guest.aadhaar}
                        onChange={(e) => updateGuest(index, 'aadhaar', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                        placeholder="XXXX-XXXX-XXXX"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={guest.phone}
                      onChange={(e) => updateGuest(index, 'phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
        {/* Platform */}
        <div>
          <label htmlFor="platform" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            Platform *
          </label>
          <select
            id="platform"
            required
            value={formData.platform}
            onChange={(e) => setFormData({ ...formData, platform: e.target.value as Booking['platform'] })}
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
          <label htmlFor="roomId" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            Room Number *
          </label>
          <select
            id="roomId"
            required
            value={formData.roomId}
            onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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

        {/* Rate Per Night */}
        {!useCustomRates && (
          <div className="sm:col-span-2">
            <label htmlFor="ratePerNight" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Rate Per Night * {totalNights > 0 && <span className="text-gray-500">({totalNights} {totalNights === 1 ? 'night' : 'nights'})</span>}
            </label>
            <input
              type="number"
              id="ratePerNight"
              required={!useCustomRates}
              value={formData.ratePerNight}
              onChange={(e) => setFormData({ ...formData, ratePerNight: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              placeholder="₹3000"
              min="0"
              step="1"
            />
          </div>
        )}
      </div>

      {/* Custom Daily Pricing Toggle */}
      {formData.checkIn && formData.checkOut && totalNights > 0 && (
        <div className="mt-4 sm:mt-6">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useCustomRates}
              onChange={(e) => setUseCustomRates(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-xs sm:text-sm font-medium text-gray-700">
              Use Custom Daily Pricing (for special events like New Year&apos;s Eve)
            </span>
          </label>
        </div>
      )}

      {/* Custom Daily Rates */}
      {useCustomRates && dateRange.length > 0 && (
        <div className="mt-4 sm:mt-6">
          <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-3">Daily Rates</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {dateRange.map((date) => (
              <div key={date} className="flex flex-col">
                <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </label>
                <input
                  type="number"
                  value={customDailyRates[date] || ''}
                  onChange={(e) => setCustomDailyRates({
                    ...customDailyRates,
                    [date]: parseFloat(e.target.value) || 0
                  })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="₹3000"
                  min="0"
                  step="1"
                  required
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Total Amount Display */}
      {totalNights > 0 && (formData.ratePerNight || (useCustomRates && Object.keys(customDailyRates).length > 0)) && (
        <div className="mt-4 sm:mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex justify-between items-center">
            <span className="text-sm sm:text-base font-medium text-gray-700">Total Amount:</span>
            <span className="text-lg sm:text-xl font-bold text-blue-600">
              ₹{totalAmount.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="mt-2 text-xs sm:text-sm text-gray-600">
            {totalNights} {totalNights === 1 ? 'night' : 'nights'}
            {!useCustomRates && formData.ratePerNight && ` × ₹${parseFloat(formData.ratePerNight).toLocaleString('en-IN')}/night`}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 sm:mt-6">
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-2 rounded-md hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base font-medium"
        >
          {loading ? 'Saving...' : editingBooking ? 'Update Booking' : 'Add Booking'}
        </button>

        {editingBooking && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto bg-gray-300 text-gray-700 px-4 sm:px-6 py-2.5 sm:py-2 rounded-md hover:bg-gray-400 transition text-sm sm:text-base font-medium"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
