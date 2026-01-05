import { NextResponse } from 'next/server';
import { getSupabaseClient, dbRowToBooking, bookingToDbRow, calculateNights, calculateTotalAmount, type BookingRow } from '@/lib/supabase';

// GET all bookings
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
    console.log('Fetched bookings:', bookings.length);
    return NextResponse.json({ bookings }, { status: 200 });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST new booking
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.date || !body.name || !body.aadhaar || !body.phone || !body.platform || !body.roomId || !body.checkIn || !body.checkOut) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate that either ratePerNight or customDailyRates is provided
    if (!body.ratePerNight && !body.customDailyRates) {
      return NextResponse.json(
        { error: 'Either rate per night or custom daily rates must be provided' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Calculate total nights
    const totalNights = calculateNights(body.checkIn, body.checkOut);

    // Calculate total amount
    const ratePerNight = body.ratePerNight ? parseFloat(body.ratePerNight) : undefined;
    const totalAmount = calculateTotalAmount(
      body.checkIn,
      body.checkOut,
      ratePerNight,
      body.customDailyRates
    );

    // Get current max ID to generate next ID
    const { data: existingBookings } = await supabase
      .from('bookings')
      .select('id')
      .order('id', { ascending: false })
      .limit(1);

    let newId = 'BK0001';
    if (existingBookings && existingBookings.length > 0) {
      const lastId = existingBookings[0].id;
      const lastNum = parseInt(lastId.replace('BK', ''));
      newId = `BK${String(lastNum + 1).padStart(4, '0')}`;
    }

    // Prepare booking data with calculated values
    const bookingData = {
      ...body,
      id: newId,
      payment: totalAmount.toString(),
      totalNights,
    };

    const bookingRow = bookingToDbRow(bookingData);

    const { error } = await supabase
      .from('bookings')
      .insert([bookingRow]);

    if (error) {
      console.error('Supabase error adding booking:', error);
      return NextResponse.json(
        { error: 'Failed to add booking', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Booking added successfully', id: newId, totalAmount, totalNights },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding booking:', error);
    return NextResponse.json(
      { error: 'Failed to add booking', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
