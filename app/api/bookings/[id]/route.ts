import { NextResponse } from 'next/server';
import { getSupabaseClient, bookingToDbRow, calculateNights, calculateTotalAmount, dbRowToBooking, BookingRow } from '@/lib/supabase';

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

    // First, fetch the booking to get image URLs
    const { data: bookingData, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching booking for deletion:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch booking', details: fetchError.message },
        { status: 500 }
      );
    }

    if (!bookingData) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    const booking = dbRowToBooking(bookingData as BookingRow);

    // Helper to extract path from URL or return path as-is
    const extractPath = (urlOrPath: string): string => {
      // If it's already a path (doesn't contain http), return as is
      if (!urlOrPath.includes('http')) {
        return urlOrPath;
      }
      // Extract path from public URL (for old records)
      const urlParts = urlOrPath.split('/storage/v1/object/public/aadhaar-cards/');
      return urlParts.length > 1 ? urlParts[1] : urlOrPath;
    };

    // Delete all Aadhaar images from storage
    const imagesToDelete: string[] = [];

    // Add primary guest image if exists
    if (booking.aadhaarImageUrl) {
      const path = extractPath(booking.aadhaarImageUrl);
      imagesToDelete.push(path);
    }

    // Add additional guests images if exist
    if (booking.additionalGuests) {
      booking.additionalGuests.forEach((guest) => {
        if (guest.aadhaarImageUrl) {
          const path = extractPath(guest.aadhaarImageUrl);
          imagesToDelete.push(path);
        }
      });
    }

    // Delete images from storage
    if (imagesToDelete.length > 0) {
      const { error: storageError } = await supabase.storage
        .from('aadhaar-cards')
        .remove(imagesToDelete);

      if (storageError) {
        console.error('Error deleting images from storage:', storageError);
        // Continue with booking deletion even if image deletion fails
      }
    }

    // Delete the booking from database
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
      { message: 'Booking and associated images deleted successfully' },
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
