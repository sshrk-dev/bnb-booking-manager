# Supabase Database Schema

This document describes the database structure for the Rental Booking Manager.

## Project Information

- **Project Name**: sshrk
- **Region**: ap-south-1 (Mumbai)
- **Project URL**: https://ulqvwbtftigdbtlcjrot.supabase.co

## Tables

### bookings

Main table for storing rental booking information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PRIMARY KEY | Booking ID (format: BK0001, BK0002, etc.) |
| date | DATE | NOT NULL | Booking date |
| name | TEXT | NOT NULL | Primary guest name |
| aadhaar | TEXT | NOT NULL | Primary guest Aadhaar card number |
| phone | TEXT | NOT NULL | Primary guest phone number |
| additional_guests | JSONB | DEFAULT '[]'::jsonb | Array of additional guest objects (name, aadhaar, phone) |
| payment | NUMERIC | NOT NULL | Total amount in INR (auto-calculated) |
| rate_per_night | NUMERIC | NULL | Standard nightly rate in INR |
| custom_daily_rates | JSONB | NULL | Custom rates per date for special events (format: {"YYYY-MM-DD": amount}) |
| total_nights | INTEGER | NULL | Calculated number of nights between check-in and check-out |
| platform | TEXT | NOT NULL, CHECK | Booking platform (Airbnb, Goibibo, MakeMyTrip, Agoda, Offline) |
| room_id | TEXT | NOT NULL | Room number |
| check_in | DATE | NOT NULL | Check-in date |
| check_out | DATE | NOT NULL | Check-out date |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Record update timestamp |

### Indexes

The following indexes are created for better query performance:

- `idx_bookings_date` - On `date` column (descending)
- `idx_bookings_check_in` - On `check_in` column
- `idx_bookings_check_out` - On `check_out` column
- `idx_bookings_platform` - On `platform` column
- `idx_bookings_room_id` - On `room_id` column
- `idx_bookings_guest_count` - On `jsonb_array_length(additional_guests)` for guest count queries

### Triggers

- `update_bookings_updated_at` - Automatically updates the `updated_at` timestamp on row updates

## Row Level Security (RLS)

RLS is enabled on the bookings table with the following policies:

1. **Allow full access to service role** - Authenticated users (service role) have full access
2. **Restrict anonymous access** - Anonymous users have no access

Since this is an admin-only application with JWT authentication, all database operations are performed using the service role key from API routes.

## Migrations

### 1. Initial Schema (create_bookings_table)

Creates the bookings table with basic columns, indexes, and triggers.

### 2. RLS Policies (setup_rls_policies)

Enables Row Level Security and creates access policies.

### 3. Pricing Fields (add_pricing_fields)

Adds columns for per-night pricing and custom daily rates:
- `rate_per_night` - Standard nightly rate
- `custom_daily_rates` - JSONB column for custom rates per date
- `total_nights` - Calculated number of nights

This migration enables automatic calculation of total amounts based on check-in/check-out dates and supports special event pricing (e.g., different rates for New Year's Eve).

### 4. Multi-Guest Support (add_additional_guests)

Adds the `additional_guests` JSONB column to store multiple guests per booking. Each guest has:
- name (string)
- aadhaar (string)
- phone (string)

Also adds a functional index on `jsonb_array_length(additional_guests)` for efficient guest count queries.

## Environment Variables

Required environment variables for Supabase:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://ulqvwbtftigdbtlcjrot.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## Getting Service Role Key

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: **sshrk**
3. Go to **Project Settings** > **API**
4. Copy the **service_role** key (under "Project API keys")
5. Add it to your `.env.local` file

**IMPORTANT**: Never commit the service role key to git. It should only be used on the server-side (API routes).

## Data Migration from Google Sheets

If you have existing data in Google Sheets, you can export it and import to Supabase:

1. Export your Google Sheet as CSV
2. Go to Supabase Dashboard > Table Editor > bookings
3. Click "Insert" > "Import data from CSV"
4. Map the columns correctly:
   - Booking id → id
   - Booking date → date
   - Guest name → name (primary guest)
   - Adhar card → aadhaar (primary guest)
   - Phone number → phone (primary guest)
   - Amount inr → payment (total amount)
   - Platform → platform
   - Room number → room_id
   - Check in date → check_in
   - Check out date → check_out

**Note**: Existing records imported from Google Sheets will need `rate_per_night` populated manually or via SQL update, as the old system stored total amounts only. You can calculate it as:

```sql
UPDATE bookings
SET rate_per_night = payment / GREATEST(EXTRACT(DAY FROM check_out - check_in), 1),
    total_nights = EXTRACT(DAY FROM check_out - check_in)
WHERE rate_per_night IS NULL;
```

## API Routes

The application uses the following API routes that interact with Supabase:

- `GET /api/bookings` - Fetch all bookings
- `POST /api/bookings` - Create a new booking (auto-calculates total amount)
- `PUT /api/bookings/[id]` - Update a booking (recalculates total if dates/rates change)
- `DELETE /api/bookings/[id]` - Delete a booking
- `GET /api/bookings/stats` - Get booking statistics
- `GET /api/analytics` - Get detailed analytics

All routes use the `getSupabaseClient()` function from `lib/supabase.ts` which creates a Supabase client with the service role key.

## Features

### Automatic Pricing Calculation

The application automatically calculates total amounts based on:
1. **Standard Pricing**: User enters rate per night, system calculates total = nights × rate
2. **Custom Daily Pricing**: User can override rates for specific dates (e.g., New Year's Eve at ₹5,000 vs normal ₹3,000)

**Utility functions** (from `lib/supabase.ts`):
- `calculateNights(checkIn, checkOut)` - Returns number of nights
- `calculateTotalAmount(checkIn, checkOut, ratePerNight, customDailyRates)` - Returns total amount
- `getDateRange(checkIn, checkOut)` - Returns array of dates for custom pricing UI

**Example custom_daily_rates JSONB**:
```json
{
  "2025-12-29": 3000,
  "2025-12-30": 3000,
  "2025-12-31": 5000,
  "2026-01-01": 4000,
  "2026-01-02": 3000
}
```
Total for above: ₹18,000 (automatically calculated)

### Multi-Guest Support

Each booking can have multiple guests:
- **Primary guest**: Stored in `name`, `aadhaar`, `phone` columns (required)
- **Additional guests**: Stored in `additional_guests` JSONB array (optional)

**Example additional_guests JSONB**:
```json
[
  {
    "name": "Mrs. Priya Gupta",
    "aadhaar": "9876-5432-1098",
    "phone": "+91 98765 43210"
  },
  {
    "name": "Master Aryan Gupta",
    "aadhaar": "5555-6666-7777",
    "phone": "+91 98765 43211"
  }
]
```

**Guest count query**:
```sql
SELECT
  id,
  name,
  1 + jsonb_array_length(additional_guests) as total_guests
FROM bookings;
```

## Data Types Reference

### GuestInfo Interface
```typescript
interface GuestInfo {
  name: string;
  aadhaar: string;
  phone: string;
}
```

### Booking Interface
```typescript
interface Booking {
  id: string;
  date: string;
  name: string; // Primary guest
  aadhaar: string;
  phone: string;
  additionalGuests?: GuestInfo[];
  payment: string; // Total (calculated)
  ratePerNight?: string;
  customDailyRates?: Record<string, number>;
  totalNights?: number;
  platform: 'Airbnb' | 'Goibibo' | 'MakeMyTrip' | 'Agoda' | 'Offline';
  roomId: string;
  checkIn: string;
  checkOut: string;
  createdAt?: string;
  updatedAt?: string;
}
```
