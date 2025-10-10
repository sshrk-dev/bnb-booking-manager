import { NextResponse } from 'next/server';
import { getAllBookings, Booking } from '@/lib/googleSheets';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const roomId = searchParams.get('roomId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let bookings = await getAllBookings();

    // Apply filters
    if (platform && platform !== 'All') {
      bookings = bookings.filter(b => b.platform === platform);
    }

    if (roomId && roomId !== 'All') {
      bookings = bookings.filter(b => b.roomId === roomId);
    }

    if (startDate) {
      bookings = bookings.filter(b => new Date(b.checkIn) >= new Date(startDate));
    }

    if (endDate) {
      bookings = bookings.filter(b => new Date(b.checkOut) <= new Date(endDate));
    }

    // Monthly room performance
    const monthlyRoomPerformance = calculateMonthlyRoomPerformance(bookings);

    // Platform share
    const platformShare = calculatePlatformShare(bookings);

    // Room occupancy rate
    const roomOccupancy = calculateRoomOccupancy(bookings);

    // Revenue trends
    const revenueTrends = calculateRevenueTrends(bookings);

    // Top performing rooms
    const topRooms = calculateTopRooms(bookings);

    const analytics = {
      totalBookings: bookings.length,
      totalRevenue: bookings.reduce((sum, b) => sum + parseFloat(b.payment.replace(/[^0-9.-]+/g, '') || '0'), 0),
      monthlyRoomPerformance,
      platformShare,
      roomOccupancy,
      revenueTrends,
      topRooms,
    };

    return NextResponse.json(analytics, { status: 200 });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function calculateMonthlyRoomPerformance(bookings: Booking[]) {
  const performance: Record<string, Record<string, { count: number; revenue: number }>> = {};

  bookings.forEach(booking => {
    const month = new Date(booking.checkIn).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    const room = booking.roomId;
    const revenue = parseFloat(booking.payment.replace(/[^0-9.-]+/g, '') || '0');

    if (!performance[month]) {
      performance[month] = {};
    }

    if (!performance[month][room]) {
      performance[month][room] = { count: 0, revenue: 0 };
    }

    performance[month][room].count += 1;
    performance[month][room].revenue += revenue;
  });

  return performance;
}

function calculatePlatformShare(bookings: Booking[]) {
  const platformCount: Record<string, { count: number; revenue: number }> = {};

  bookings.forEach(booking => {
    const platform = booking.platform;
    const revenue = parseFloat(booking.payment.replace(/[^0-9.-]+/g, '') || '0');

    if (!platformCount[platform]) {
      platformCount[platform] = { count: 0, revenue: 0 };
    }

    platformCount[platform].count += 1;
    platformCount[platform].revenue += revenue;
  });

  return Object.entries(platformCount).map(([platform, data]) => ({
    platform,
    count: data.count,
    revenue: data.revenue,
    percentage: bookings.length > 0 ? (data.count / bookings.length) * 100 : 0,
  }));
}

function calculateRoomOccupancy(bookings: Booking[]) {
  const roomStats: Record<string, { bookings: number; totalDays: number; revenue: number }> = {};

  bookings.forEach(booking => {
    const room = booking.roomId;
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const revenue = parseFloat(booking.payment.replace(/[^0-9.-]+/g, '') || '0');

    if (!roomStats[room]) {
      roomStats[room] = { bookings: 0, totalDays: 0, revenue: 0 };
    }

    roomStats[room].bookings += 1;
    roomStats[room].totalDays += days;
    roomStats[room].revenue += revenue;
  });

  return Object.entries(roomStats).map(([room, stats]) => ({
    room,
    bookings: stats.bookings,
    totalDays: stats.totalDays,
    revenue: stats.revenue,
    avgStayDuration: stats.bookings > 0 ? stats.totalDays / stats.bookings : 0,
  }));
}

function calculateRevenueTrends(bookings: Booking[]) {
  const trends: Record<string, number> = {};

  bookings.forEach(booking => {
    const month = new Date(booking.checkIn).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    const revenue = parseFloat(booking.payment.replace(/[^0-9.-]+/g, '') || '0');

    if (!trends[month]) {
      trends[month] = 0;
    }

    trends[month] += revenue;
  });

  return Object.entries(trends)
    .map(([month, revenue]) => ({ month, revenue }))
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
}

function calculateTopRooms(bookings: Booking[]) {
  const roomStats: Record<string, { bookings: number; revenue: number }> = {};

  bookings.forEach(booking => {
    const room = booking.roomId;
    const revenue = parseFloat(booking.payment.replace(/[^0-9.-]+/g, '') || '0');

    if (!roomStats[room]) {
      roomStats[room] = { bookings: 0, revenue: 0 };
    }

    roomStats[room].bookings += 1;
    roomStats[room].revenue += revenue;
  });

  return Object.entries(roomStats)
    .map(([room, stats]) => ({
      room,
      bookings: stats.bookings,
      revenue: stats.revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}
