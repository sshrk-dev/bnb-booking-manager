export interface Booking {
  id: string;
  date: string;
  name: string;
  aadhaar: string;
  phone: string;
  payment: string;
  platform: 'Airbnb' | 'Goibibo' | 'MakeMyTrip' | 'Agoda';
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
