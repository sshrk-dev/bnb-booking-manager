import { NextResponse } from 'next/server';
import { getSupabaseClient, bookingToDbRow, calculateNights, calculateTotalAmount } from '@/lib/supabase';

// PUT update booking
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;

    const supabase = getSupabaseClient();

    // If checkIn, checkOut, or rates are being updated, recalculate totals
    if (body.checkIn && body.checkOut) {
      const totalNights = calculateNights(body.checkIn, body.checkOut);
      const ratePerNight = body.ratePerNight ? parseFloat(body.ratePerNight) : undefined;
      const totalAmount = calculateTotalAmount(
        body.checkIn,
        body.checkOut,
        ratePerNight,
        body.customDailyRates
      );

      body.payment = totalAmount.toString();
      body.totalNights = totalNights;
    }

    // Convert body to database format (excluding id)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, ...updateData } = bookingToDbRow(body);

    const { error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Supabase error updating booking:', error);
      return NextResponse.json(
        { error: 'Failed to update booking', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Booking updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Failed to update booking', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE booking
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error deleting booking:', error);
      return NextResponse.json(
        { error: 'Failed to delete booking', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Booking deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { error: 'Failed to delete booking', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
