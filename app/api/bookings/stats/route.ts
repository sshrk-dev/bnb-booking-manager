import { NextResponse } from 'next/server';
import { getSupabaseClient, dbRowToBooking, type BookingRow } from '@/lib/supabase';
import { BookingStats } from '@/types';

export async function GET() {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Supabase error fetching bookings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch bookings', details: error.message },
        { status: 500 }
      );
    }

    const bookings = (data as BookingRow[]).map(dbRowToBooking);

    // Calculate total revenue (convert payment strings to numbers)
    const totalRevenue = bookings.reduce((sum, booking) => {
      const payment = parseFloat(booking.payment.replace(/[^0-9.-]+/g, '')) || 0;
      return sum + payment;
    }, 0);

    // Platform breakdown
    const platformMap = new Map<string, { count: number; revenue: number }>();

    bookings.forEach(booking => {
      const platform = booking.platform;
      const payment = parseFloat(booking.payment.replace(/[^0-9.-]+/g, '')) || 0;

      if (!platformMap.has(platform)) {
        platformMap.set(platform, { count: 0, revenue: 0 });
      }

      const current = platformMap.get(platform)!;
      current.count += 1;
      current.revenue += payment;
    });

    const platformBreakdown = Array.from(platformMap.entries()).map(([platform, data]) => ({
      platform,
      count: data.count,
      revenue: data.revenue,
    }));

    // Recent bookings (last 5)
    const recentBookings = bookings
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    const stats: BookingStats = {
      totalBookings: bookings.length,
      totalRevenue,
      platformBreakdown,
      recentBookings,
    };

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
