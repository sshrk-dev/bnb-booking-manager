import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and service role key from environment variables
function getSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is not set');
  }
  return url;
}

function getSupabaseServiceRoleKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is not set');
  }
  return key;
}

// Create Supabase client with service role key for server-side operations
// This bypasses Row Level Security and should only be used in API routes
export function getSupabaseClient() {
  const supabaseUrl = getSupabaseUrl();
  const supabaseServiceRoleKey = getSupabaseServiceRoleKey();

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// Guest information interface
export interface GuestInfo {
  name: string;
  aadhaar: string;
  phone: string;
}

// Database types
export interface Booking {
  id: string;
  date: string;
  name: string; // Primary guest name
  aadhaar: string; // Primary guest aadhaar
  phone: string; // Primary guest phone
  additionalGuests?: GuestInfo[]; // Additional guests
  payment: string; // Total amount (calculated)
  ratePerNight?: string; // Standard nightly rate
  customDailyRates?: Record<string, number>; // Custom rates per date
  totalNights?: number; // Number of nights
  platform: 'Airbnb' | 'Goibibo' | 'MakeMyTrip' | 'Agoda' | 'Offline';
  roomId: string;
  checkIn: string;
  checkOut: string;
  createdAt?: string;
  updatedAt?: string;
}

// Database column mapping (snake_case in DB, camelCase in app)
export interface BookingRow {
  id: string;
  date: string;
  name: string;
  aadhaar: string;
  phone: string;
  additional_guests?: GuestInfo[];
  payment: number;
  rate_per_night?: number;
  custom_daily_rates?: Record<string, number>;
  total_nights?: number;
  platform: 'Airbnb' | 'Goibibo' | 'MakeMyTrip' | 'Agoda' | 'Offline';
  room_id: string;
  check_in: string;
  check_out: string;
  created_at?: string;
  updated_at?: string;
}

// Helper to convert DB row to app Booking
export function dbRowToBooking(row: BookingRow): Booking {
  return {
    id: row.id,
    date: row.date,
    name: row.name,
    aadhaar: row.aadhaar,
    phone: row.phone,
    additionalGuests: row.additional_guests || [],
    payment: row.payment.toString(),
    ratePerNight: row.rate_per_night?.toString(),
    customDailyRates: row.custom_daily_rates,
    totalNights: row.total_nights,
    platform: row.platform,
    roomId: row.room_id,
    checkIn: row.check_in,
    checkOut: row.check_out,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Helper to convert app Booking to DB row
export function bookingToDbRow(booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Partial<BookingRow> {
  return {
    ...(booking.id && { id: booking.id }),
    date: booking.date,
    name: booking.name,
    aadhaar: booking.aadhaar,
    phone: booking.phone,
    additional_guests: booking.additionalGuests,
    payment: parseFloat(booking.payment),
    rate_per_night: booking.ratePerNight ? parseFloat(booking.ratePerNight) : undefined,
    custom_daily_rates: booking.customDailyRates,
    total_nights: booking.totalNights,
    platform: booking.platform,
    room_id: booking.roomId,
    check_in: booking.checkIn,
    check_out: booking.checkOut,
  };
}

// Helper to calculate number of nights
export function calculateNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Helper to calculate total amount
export function calculateTotalAmount(
  checkIn: string,
  checkOut: string,
  ratePerNight?: number,
  customDailyRates?: Record<string, number>
): number {
  const nights = calculateNights(checkIn, checkOut);

  // If custom daily rates are provided, use them
  if (customDailyRates && Object.keys(customDailyRates).length > 0) {
    let total = 0;
    const start = new Date(checkIn);

    for (let i = 0; i < nights; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];

      // Use custom rate if available, otherwise use standard rate
      const rate = customDailyRates[dateStr] || ratePerNight || 0;
      total += rate;
    }

    return total;
  }

  // Otherwise use standard rate per night
  return (ratePerNight || 0) * nights;
}

// Helper to generate date range for custom pricing UI
export function getDateRange(checkIn: string, checkOut: string): string[] {
  const dates: string[] = [];
  const start = new Date(checkIn);
  const nights = calculateNights(checkIn, checkOut);

  for (let i = 0; i < nights; i++) {
    const currentDate = new Date(start);
    currentDate.setDate(start.getDate() + i);
    dates.push(currentDate.toISOString().split('T')[0]);
  }

  return dates;
}
