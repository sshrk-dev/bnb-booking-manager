import { NextResponse } from 'next/server';
import { getAllBookings, addBooking, initializeSheet } from '@/lib/googleSheets';

// GET all bookings
export async function GET() {
  try {
    // Initialize sheet with headers if needed
    await initializeSheet();

    const bookings = await getAllBookings();
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
    if (!body.date || !body.name || !body.aadhaar || !body.phone || !body.payment || !body.platform || !body.roomId || !body.checkIn || !body.checkOut) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await addBooking(body);

    return NextResponse.json(
      { message: 'Booking added successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding booking:', error);
    return NextResponse.json(
      { error: 'Failed to add booking' },
      { status: 500 }
    );
  }
}
