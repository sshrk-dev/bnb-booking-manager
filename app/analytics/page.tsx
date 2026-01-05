'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ROOM_IDS } from '@/types';
import Link from 'next/link';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

interface AnalyticsData {
  totalBookings: number;
  totalRevenue: number;
  monthlyRoomPerformance: Record<string, Record<string, { count: number; revenue: number }>>;
  platformShare: Array<{ platform: string; count: number; revenue: number; percentage: number }>;
  roomOccupancy: Array<{ room: string; bookings: number; totalDays: number; revenue: number; avgStayDuration: number }>;
  revenueTrends: Array<{ month: string; revenue: number }>;
  topRooms: Array<{ room: string; bookings: number; revenue: number }>;
}

const PLATFORM_COLORS: Record<string, string> = {
  Airbnb: '#FF5A5F',
  Goibibo: '#2196F3',
  MakeMyTrip: '#FF9800',
  Agoda: '#4CAF50',
  Offline: '#9E9E9E',
};

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Filters
  const [platform, setPlatform] = useState('All');
  const [roomId, setRoomId] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (platform !== 'All') params.append('platform', platform);
      if (roomId !== 'All') params.append('roomId', roomId);

      // If month and year are selected, create start and end dates
      if (selectedMonth && selectedYear) {
        const monthNum = parseInt(selectedMonth);
        const yearNum = parseInt(selectedYear);
        const startDate = new Date(yearNum, monthNum - 1, 1);
        const endDate = new Date(yearNum, monthNum, 0); // Last day of month

        params.append('startDate', startDate.toISOString().split('T')[0]);
        params.append('endDate', endDate.toISOString().split('T')[0]);
      }

      const response = await fetch(`/api/analytics?${params.toString()}`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [platform, roomId, selectedMonth, selectedYear]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const resetFilters = () => {
    setPlatform('All');
    setRoomId('All');
    setSelectedMonth('');
    setSelectedYear('');
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

  // Generate years for dropdown (current year and 2 years back)
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2];
  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center text-red-600">
          Failed to load analytics. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="mt-1 text-xs sm:text-sm text-gray-600">
                Insights into your rental property performance
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/"
                className="flex-1 sm:flex-none bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-gray-700 transition text-sm text-center"
              >
                <span className="hidden sm:inline">← Back to Bookings</span>
                <span className="sm:hidden">← Back</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex-1 sm:flex-none bg-red-600 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-md hover:bg-red-700 transition flex items-center justify-center gap-1 sm:gap-2 text-sm"
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Filters</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* Platform Filter */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-2 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="All">All Platforms</option>
                <option value="Airbnb">Airbnb</option>
                <option value="Goibibo">Goibibo</option>
                <option value="MakeMyTrip">MakeMyTrip</option>
                <option value="Agoda">Agoda</option>
                <option value="Offline">Offline</option>
              </select>
            </div>

            {/* Room Filter */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Room</label>
              <select
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full px-2 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="All">All Rooms</option>
                {ROOM_IDS.map((room) => (
                  <option key={room} value={room}>
                    {room}
                  </option>
                ))}
              </select>
            </div>

            {/* Month Filter */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-2 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">All Months</option>
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-2 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">All Years</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Button */}
            <div className="col-span-2 lg:col-span-1 flex items-end">
              <button
                onClick={resetFilters}
                className="w-full bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-gray-700 transition text-sm"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {(selectedMonth && selectedYear) && (
            <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-xs sm:text-sm text-blue-800">
                <strong>Viewing:</strong> {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
              </p>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-4 sm:mb-8">
          <div className="bg-white rounded-lg shadow-md p-3 sm:p-6">
            <h3 className="text-sm sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2">Total Bookings</h3>
            <p className="text-2xl sm:text-4xl font-bold text-blue-600">{analytics.totalBookings}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-3 sm:p-6">
            <h3 className="text-sm sm:text-lg font-semibold text-gray-700 mb-1 sm:mb-2">Total Revenue</h3>
            <p className="text-xl sm:text-4xl font-bold text-green-600">₹{analytics.totalRevenue.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-8">
          {/* Platform Share Pie Chart */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Platform Share</h2>
            {analytics.platformShare.length > 0 ? (
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.platformShare}
                      dataKey="count"
                      nameKey="platform"
                      cx="50%"
                      cy="50%"
                      outerRadius={typeof window !== 'undefined' && window.innerWidth < 640 ? 70 : 100}
                      label
                    >
                      {analytics.platformShare.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PLATFORM_COLORS[entry.platform] || '#666'} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value} bookings`, 'Count']}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8 text-sm">No data available</p>
            )}
          </div>

          {/* Revenue Time Series */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Monthly Revenue Trend</h2>
            {analytics.revenueTrends.length > 0 ? (
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.revenueTrends} margin={{ left: -10, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      interval={0}
                    />
                    <YAxis
                      tick={{ fontSize: 10 }}
                      tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                      width={45}
                    />
                    <Tooltip
                      formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#4CAF50"
                      strokeWidth={2}
                      dot={{ fill: '#4CAF50', r: 3 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8 text-sm">No data available</p>
            )}
          </div>
        </div>

        {/* Platform Details Table */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-8">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Platform Performance Details</h2>

          {/* Mobile Card View */}
          <div className="block sm:hidden space-y-3">
            {analytics.platformShare.map((platform) => (
              <div key={platform.platform} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: PLATFORM_COLORS[platform.platform] }}
                    ></div>
                    <span className="font-medium text-gray-900">{platform.platform}</span>
                  </div>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">{platform.percentage.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{platform.count} bookings</span>
                  <span className="font-medium text-gray-900">₹{platform.revenue.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Platform</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bookings</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Share %</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.platformShare.map((platform) => (
                  <tr key={platform.platform} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: PLATFORM_COLORS[platform.platform] }}
                        ></div>
                        <span className="font-medium text-gray-900">{platform.platform}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {platform.count}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {platform.percentage.toFixed(1)}%
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      ₹{platform.revenue.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Performing Rooms */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-8">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Top Performing Rooms</h2>

          {/* Mobile Card View */}
          <div className="block sm:hidden space-y-3">
            {analytics.topRooms.map((room, index) => (
              <div key={room.room} className="border border-gray-200 rounded-lg p-3 flex items-center gap-3">
                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                  index === 0 ? 'bg-yellow-100 text-yellow-800' :
                  index === 1 ? 'bg-gray-100 text-gray-800' :
                  index === 2 ? 'bg-orange-100 text-orange-800' :
                  'bg-blue-50 text-blue-800'
                } font-bold text-sm flex-shrink-0`}>
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{room.room}</p>
                  <p className="text-xs text-gray-500">{room.bookings} bookings</p>
                </div>
                <span className="font-medium text-gray-900 text-sm">₹{room.revenue.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bookings</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.topRooms.map((room, index) => (
                  <tr key={room.room} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-50 text-blue-800'
                      } font-bold`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">
                      {room.room}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {room.bookings}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      ₹{room.revenue.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Room Occupancy */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-8">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Room Occupancy Statistics</h2>

          {/* Mobile Card View */}
          <div className="block sm:hidden space-y-3">
            {analytics.roomOccupancy.map((room) => (
              <div key={room.room} className="border border-gray-200 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-900">{room.room}</span>
                  <span className="font-medium text-gray-900">₹{room.revenue.toLocaleString('en-IN')}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-gray-500">Bookings</p>
                    <p className="text-gray-900 font-medium">{room.bookings}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total Days</p>
                    <p className="text-gray-900 font-medium">{room.totalDays}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Avg Stay</p>
                    <p className="text-gray-900 font-medium">{room.avgStayDuration.toFixed(1)} days</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bookings</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Days</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Stay</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.roomOccupancy.map((room) => (
                  <tr key={room.room} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {room.room}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {room.bookings}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {room.totalDays} days
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {room.avgStayDuration.toFixed(1)} days
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      ₹{room.revenue.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Room Performance */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Monthly Room Performance</h2>
          <p className="text-xs text-gray-500 mb-3 sm:hidden">Scroll horizontally to see all rooms →</p>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase sticky left-0 bg-gray-50 z-10">
                    Month
                  </th>
                  {ROOM_IDS.map((room) => (
                    <th key={room} className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      {room}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(analytics.monthlyRoomPerformance).map(([month, rooms]) => (
                  <tr key={month} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 sticky left-0 bg-white z-10">
                      {month}
                    </td>
                    {ROOM_IDS.map((roomId) => {
                      const roomData = rooms[roomId];
                      return (
                        <td key={roomId} className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-center">
                          {roomData ? (
                            <div>
                              <div className="text-gray-900 font-semibold">{roomData.count}</div>
                              <div className="text-gray-500 text-xs">₹{roomData.revenue.toLocaleString('en-IN')}</div>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
