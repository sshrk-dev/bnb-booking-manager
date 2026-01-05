'use client';

import { useEffect, useState } from 'react';
import { BookingStats } from '@/types';

export default function Dashboard() {
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/bookings/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="mb-6 sm:mb-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        {/* Total Bookings */}
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Bookings</p>
              <p className="text-xl sm:text-3xl font-bold text-gray-900 truncate">{stats.totalBookings}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-2 sm:p-3 ml-2 flex-shrink-0">
              <svg className="w-5 h-5 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-lg sm:text-3xl font-bold text-gray-900 truncate">₹{stats.totalRevenue.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-green-100 rounded-full p-2 sm:p-3 ml-2 flex-shrink-0">
              <svg className="w-5 h-5 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Average Booking Value */}
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Avg. Booking</p>
              <p className="text-lg sm:text-3xl font-bold text-gray-900 truncate">
                ₹{stats.totalBookings > 0 ? Math.round(stats.totalRevenue / stats.totalBookings).toLocaleString('en-IN') : 0}
              </p>
            </div>
            <div className="bg-purple-100 rounded-full p-2 sm:p-3 ml-2 flex-shrink-0">
              <svg className="w-5 h-5 sm:w-8 sm:h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Platforms Count */}
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Active Platforms</p>
              <p className="text-xl sm:text-3xl font-bold text-gray-900 truncate">{stats.platformBreakdown.length}</p>
            </div>
            <div className="bg-orange-100 rounded-full p-2 sm:p-3 ml-2 flex-shrink-0">
              <svg className="w-5 h-5 sm:w-8 sm:h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Platform Breakdown</h3>
          <div className="space-y-3 sm:space-y-4">
            {stats.platformBreakdown.map((platform) => (
              <div key={platform.platform} className="border-b border-gray-200 pb-3 last:border-0">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-700 text-sm sm:text-base">{platform.platform}</span>
                  <span className="text-xs sm:text-sm text-gray-500">{platform.count} bookings</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex-1 mr-3 sm:mr-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          platform.platform === 'Airbnb' ? 'bg-red-500' :
                          platform.platform === 'Goibibo' ? 'bg-blue-500' :
                          platform.platform === 'MakeMyTrip' ? 'bg-orange-500' :
                          platform.platform === 'Agoda' ? 'bg-green-500' :
                          'bg-gray-500'
                        }`}
                        style={{ width: `${(platform.count / stats.totalBookings) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-900">
                    ₹{platform.revenue.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Recent Bookings</h3>
          <div className="space-y-3">
            {stats.recentBookings.length > 0 ? (
              stats.recentBookings.map((booking) => (
                <div key={booking.id} className="flex justify-between items-center border-b border-gray-200 pb-3 last:border-0 gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{booking.name}</p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {new Date(booking.date).toLocaleDateString('en-IN')} • {booking.platform}
                    </p>
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-900 flex-shrink-0">{booking.payment}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4 text-sm">No recent bookings</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
