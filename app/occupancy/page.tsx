'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Booking, ROOM_IDS } from '@/types';

// Room color mapping
const ROOM_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'SS1020': { bg: 'bg-blue-500', text: 'text-white', border: 'border-blue-600' },
  'SS1022': { bg: 'bg-purple-500', text: 'text-white', border: 'border-purple-600' },
  'SS1124': { bg: 'bg-green-500', text: 'text-white', border: 'border-green-600' },
  'SS1125': { bg: 'bg-orange-500', text: 'text-white', border: 'border-orange-600' },
  'SS1003': { bg: 'bg-pink-500', text: 'text-white', border: 'border-pink-600' },
  'SS715': { bg: 'bg-teal-500', text: 'text-white', border: 'border-teal-600' },
};

interface BookingBar {
  booking: Booking;
  startCol: number; // Which column (day) it starts on (1-7)
  span: number; // How many days it spans
  row: number; // Which week row (0-5)
}

export default function RoomOccupancy() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bookings');
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Generate calendar dates for current month view (show 42 days - 6 weeks)
  const generateCalendarDates = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    const startDay = firstDay.getDay(); // 0 = Sunday

    // Calculate start date (might be from previous month)
    const calendarStart = new Date(firstDay);
    calendarStart.setDate(calendarStart.getDate() - startDay);

    // Generate 42 days (6 weeks)
    const dates: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(calendarStart);
      date.setDate(calendarStart.getDate() + i);
      dates.push(date);
    }

    return dates;
  };

  // Calculate booking bars for horizontal display
  const calculateBookingBars = (calendarDates: Date[]): BookingBar[] => {
    const bars: BookingBar[] = [];

    bookings.forEach(booking => {
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);

      // Find where this booking appears in the calendar
      calendarDates.forEach((date, index) => {
        const dateStr = date.toISOString().split('T')[0];
        const currentDateObj = new Date(dateStr);

        // Check if this is the first day of the booking visible in calendar
        if (currentDateObj.getTime() === checkIn.getTime() ||
            (index === 0 && currentDateObj < checkIn && checkIn < calendarDates[calendarDates.length - 1])) {

          // Calculate how many days this booking spans in the visible calendar
          let span = 0;
          let startIndex = index;

          // If booking started before calendar, find real start
          if (currentDateObj < checkIn) {
            startIndex = calendarDates.findIndex(d => d.toISOString().split('T')[0] === booking.checkIn);
            if (startIndex === -1) return; // Booking not in this month view
          }

          // Calculate span
          for (let i = startIndex; i < calendarDates.length; i++) {
            const d = calendarDates[i];
            if (d >= checkIn && d < checkOut) {
              span++;
            } else if (d >= checkOut) {
              break;
            }
          }

          if (span > 0) {
            const row = Math.floor(startIndex / 7);
            const col = startIndex % 7;

            bars.push({
              booking,
              startCol: col + 1, // CSS grid is 1-indexed
              span: Math.min(span, 7 - col), // Don't span past end of week
              row
            });

            // If booking spans into next week(s), create additional bars
            let remainingSpan = span - (7 - col);
            let currentRow = row + 1;

            while (remainingSpan > 0 && currentRow < 6) {
              bars.push({
                booking,
                startCol: 1,
                span: Math.min(remainingSpan, 7),
                row: currentRow
              });
              remainingSpan -= 7;
              currentRow++;
            }
          }
        }
      });
    });

    return bars;
  };

  // Navigate to previous month
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Navigate to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const calendarDates = generateCalendarDates();
  const bookingBars = calculateBookingBars(calendarDates);
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                Room Occupancy Calendar
              </h1>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">
                View room availability and bookings
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/"
                className="flex-1 sm:flex-none bg-gray-600 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-md hover:bg-gray-700 transition flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="hidden sm:inline">Back</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex-1 sm:flex-none bg-red-600 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-md hover:bg-red-700 transition flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading occupancy data...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Calendar Controls */}
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <button
                  onClick={previousMonth}
                  className="p-2 hover:bg-gray-100 rounded-md transition"
                  title="Previous Month"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{monthName}</h2>
                  <button
                    onClick={goToToday}
                    className="mt-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Go to Today
                  </button>
                </div>

                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-gray-100 rounded-md transition"
                  title="Next Month"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Legend */}
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Room Colors</h3>
              <div className="flex flex-wrap gap-4 text-xs sm:text-sm">
                {ROOM_IDS.map(roomId => (
                  <div key={roomId} className="flex items-center gap-2">
                    <div className={`w-8 h-4 ${ROOM_COLORS[roomId].bg} rounded`}></div>
                    <span className="text-gray-600 font-medium">{roomId}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Unified Calendar Grid */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <div className="min-w-[700px]">
                  {/* Day headers */}
                  <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                      <div key={day} className="px-2 py-3 text-xs sm:text-sm font-semibold text-gray-700 text-center border-r last:border-r-0 border-gray-200">
                        <span className="hidden sm:inline">{day}</span>
                        <span className="sm:hidden">{day.slice(0, 3)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Calendar grid with bookings */}
                  <div className="relative">
                    {/* Base calendar grid - 6 weeks */}
                    <div className="grid grid-cols-7">
                      {calendarDates.map((date, index) => {
                        const dateStr = date.toISOString().split('T')[0];
                        const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                        const isToday = dateStr === today;
                        const isPast = date < new Date(today);

                        let cellClass = 'min-h-[80px] p-2 border-r border-b border-gray-200 ';

                        if (!isCurrentMonth) {
                          cellClass += 'bg-gray-50 ';
                        } else if (isPast) {
                          cellClass += 'bg-gray-100 ';
                        } else {
                          cellClass += 'bg-white ';
                        }

                        return (
                          <div key={index} className={cellClass}>
                            {/* Date number */}
                            <div className={`text-sm font-semibold ${isToday ? 'bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                              {date.getDate()}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Booking bars overlay */}
                    <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
                      <div className="grid grid-cols-7 h-full">
                        {/* Create grid cells for positioning */}
                        {calendarDates.map((_, index) => (
                          <div key={index} className="relative h-[80px]">
                            {/* Booking bars for this cell */}
                            {bookingBars
                              .filter(bar => {
                                const barRow = bar.row;
                                const barStartCol = bar.startCol - 1;
                                const cellRow = Math.floor(index / 7);
                                const cellCol = index % 7;
                                return barRow === cellRow && cellCol === barStartCol;
                              })
                              .map((bar, barIndex) => {
                                const roomColor = ROOM_COLORS[bar.booking.roomId];
                                const additionalGuestsCount = bar.booking.additionalGuests?.length || 0;

                                return (
                                  <div
                                    key={barIndex}
                                    className={`absolute ${roomColor.bg} ${roomColor.text} rounded-md px-2 py-1 text-xs font-medium shadow-sm hover:shadow-md transition cursor-pointer pointer-events-auto`}
                                    style={{
                                      width: `calc(${bar.span * 100}% - 4px)`,
                                      top: `${30 + barIndex * 22}px`,
                                      left: '2px',
                                      zIndex: 10
                                    }}
                                    onClick={() => setSelectedBooking(bar.booking)}
                                    title={`${bar.booking.name} - ${bar.booking.platform}\nRoom: ${bar.booking.roomId}\n${bar.booking.checkIn} to ${bar.booking.checkOut}`}
                                  >
                                    <div className="truncate">
                                      <span className="font-bold">{bar.booking.roomId}</span> - {bar.booking.name.split(' ')[0]}
                                      {additionalGuestsCount > 0 && ` +${additionalGuestsCount}`}
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Occupancy Summary</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {ROOM_IDS.map((roomId) => {
                  const roomBookings = bookings.filter(b => b.roomId === roomId);
                  const roomColor = ROOM_COLORS[roomId];
                  return (
                    <div key={roomId} className="text-center p-3 bg-gray-50 rounded-lg border-2" style={{ borderColor: roomColor.bg.replace('bg-', '') }}>
                      <div className={`text-sm font-semibold ${roomColor.bg} ${roomColor.text} py-1 px-2 rounded mb-2`}>{roomId}</div>
                      <div className="text-2xl font-bold text-gray-800">{roomBookings.length}</div>
                      <div className="text-xs text-gray-500 mt-1">bookings</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedBooking(null)}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-gray-500 hover:text-gray-700 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Booking ID</p>
                      <p className="text-base font-medium text-gray-900">{selectedBooking.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Booking Date</p>
                      <p className="text-base font-medium text-gray-900">{selectedBooking.date}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Platform</p>
                      <p className="text-base font-medium text-gray-900">{selectedBooking.platform}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Room Number</p>
                      <p className={`text-base font-bold ${ROOM_COLORS[selectedBooking.roomId].bg} ${ROOM_COLORS[selectedBooking.roomId].text} inline-block px-3 py-1 rounded`}>
                        {selectedBooking.roomId}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stay Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Stay Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Check-in</p>
                      <p className="text-base font-medium text-gray-900">{selectedBooking.checkIn}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Check-out</p>
                      <p className="text-base font-medium text-gray-900">{selectedBooking.checkOut}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Nights</p>
                      <p className="text-base font-medium text-gray-900">{selectedBooking.totalNights || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Primary Guest */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Primary Guest</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="text-base font-medium text-gray-900">{selectedBooking.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-base font-medium text-gray-900">{selectedBooking.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Aadhaar Number</p>
                      <p className="text-base font-medium text-gray-900">{selectedBooking.aadhaar}</p>
                    </div>
                  </div>
                </div>

                {/* Additional Guests */}
                {selectedBooking.additionalGuests && selectedBooking.additionalGuests.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Additional Guests ({selectedBooking.additionalGuests.length})
                    </h3>
                    <div className="space-y-4">
                      {selectedBooking.additionalGuests.map((guest, index) => (
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
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Payment Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Payment Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="text-2xl font-bold text-green-600">₹{selectedBooking.payment}</p>
                    </div>
                    {selectedBooking.ratePerNight && (
                      <div>
                        <p className="text-sm text-gray-500">Rate per Night</p>
                        <p className="text-base font-medium text-gray-900">₹{selectedBooking.ratePerNight}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
