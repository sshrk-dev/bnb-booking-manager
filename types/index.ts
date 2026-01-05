export interface GuestInfo {
  name: string;
  aadhaar: string;
  aadhaarImageUrl?: string; // Optional: URL to uploaded Aadhaar card image
  phone: string;
}

export interface Booking {
  id: string;
  date: string;
  name: string; // Primary guest name
  aadhaar: string; // Primary guest aadhaar number
  aadhaarImageUrl?: string; // Primary guest aadhaar image URL (optional)
  phone: string; // Primary guest phone
  additionalGuests?: GuestInfo[]; // Additional guests staying in the same room
  payment: string; // Total amount (calculated)
  ratePerNight?: string; // Standard nightly rate
  customDailyRates?: Record<string, number>; // Custom rates per date
  totalNights?: number; // Number of nights
  platform: 'Airbnb' | 'Goibibo' | 'MakeMyTrip' | 'Agoda' | 'Offline';
  roomId: string;
  checkIn: string;
  checkOut: string;
}

export const ROOM_IDS = ['SS1020', 'SS1022', 'SS1124', 'SS1125', 'SS1003', 'SS715'] as const;

export interface BookingStats {
  totalBookings: number;
  totalRevenue: number;
  platformBreakdown: {
    platform: string;
    count: number;
    revenue: number;
  }[];
  recentBookings: Booking[];
}

export interface InvoiceData {
  invoiceNo: string;
  invoiceDate: string;
  bookingId: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  pricePerNight: number;
  totalAmount: number;
}
