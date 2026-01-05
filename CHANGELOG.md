# Changelog

All notable changes to the Rental Booking Manager project are documented here.

## [2.0.0] - 2026-01-05

### Major Changes

This release includes a complete migration from Google Sheets to Supabase, along with significant feature enhancements for pricing and multi-guest support.

---

## 🔄 Database Migration: Google Sheets → Supabase

### Why the Change?
- **Scalability**: Supabase can handle millions of records efficiently
- **Performance**: Faster queries with proper indexing
- **Real-time**: Built-in real-time capabilities
- **Security**: Row Level Security (RLS) policies
- **Free Tier**: Generous free tier for growing applications

### What Changed

#### Before (Google Sheets)
- Data stored in Google Sheets
- API calls for every operation
- Limited query capabilities
- Service account credentials required

#### After (Supabase)
- PostgreSQL database with real-time capabilities
- Fast indexed queries
- Advanced filtering and analytics
- Service role key for server-side operations

### Migration Steps Completed

1. **Created Supabase Project**: `sshrk` (ap-south-1 - Mumbai region)
2. **Database Schema**: Created `bookings` table with proper types and constraints
3. **Indexes**: Added performance indexes on frequently queried columns
4. **RLS Policies**: Enabled Row Level Security for data protection
5. **Code Updates**: Replaced all Google Sheets API calls with Supabase client

### Files Changed
- **Removed**: `lib/googleSheets.ts` (replaced)
- **Added**: `lib/supabase.ts` (new Supabase client and utilities)
- **Updated**: All API routes (`app/api/bookings/*`)
- **Updated**: `.env.local.example` with Supabase credentials

---

## 💰 Feature: Per-Night Pricing with Automatic Calculation

### Problem Solved
Previously, users had to manually calculate total amounts:
- 4 nights × ₹3,000 = ₹12,000 (calculated manually)
- Error-prone and time-consuming

### Solution
Automatic calculation based on per-night rate:
- User enters: **Rate per night** = ₹3,000
- System calculates: **4 nights** (from check-in/check-out dates)
- System shows: **Total = ₹12,000** (auto-calculated)

### How It Works

#### Database Schema
```sql
ALTER TABLE bookings ADD COLUMN rate_per_night NUMERIC;
ALTER TABLE bookings ADD COLUMN total_nights INTEGER;
ALTER TABLE bookings ADD COLUMN custom_daily_rates JSONB;
```

#### Form Changes
1. **Rate Per Night** input field (replaces manual total amount)
2. **Automatic night calculation** from check-in/check-out dates
3. **Real-time total preview** showing calculation

#### Display
- Bookings table shows: `₹12,000` with breakdown `4 nights @ ₹3,000`
- Clear visibility of pricing structure

### Files Changed
- `lib/supabase.ts` - Added calculation helpers
- `components/BookingForm.tsx` - Updated form with rate per night
- `components/BookingsTable.tsx` - Shows pricing breakdown
- `app/api/bookings/route.ts` - Calculates totals on save
- `app/api/bookings/[id]/route.ts` - Recalculates on update

---

## 🎉 Feature: Custom Daily Pricing for Special Events

### Problem Solved
Some nights have different rates (e.g., New Year's Eve):
- Dec 29-30: ₹3,000/night (normal)
- Dec 31: ₹5,000/night (New Year's Eve - premium)
- Jan 1-4: ₹3,000/night (normal)
- **Total**: ₹23,000

Previously, this required manual calculation and couldn't be tracked properly.

### Solution
Custom pricing per date with automatic total calculation.

### How It Works

#### UI Flow
1. Enter check-in/check-out dates
2. Check ☑ **"Use Custom Daily Pricing"**
3. System generates individual inputs for each night
4. Enter custom rate for special dates
5. System calculates total automatically

#### Example
```
📅 Dec 29, 2025: ₹3,000
📅 Dec 30, 2025: ₹3,000
📅 Dec 31, 2025: ₹5,000 🎉 (New Year's Eve)
📅 Jan 1, 2026:  ₹4,000
📅 Jan 2, 2026:  ₹3,000
───────────────────────
Total: ₹18,000 (auto-calculated)
```

#### Database Storage
Stored as JSONB for flexible querying:
```json
{
  "custom_daily_rates": {
    "2025-12-29": 3000,
    "2025-12-30": 3000,
    "2025-12-31": 5000,
    "2026-01-01": 4000,
    "2026-01-02": 3000
  }
}
```

### Features
- ✅ Unlimited date ranges
- ✅ Mix of standard and custom rates
- ✅ Automatic total calculation
- ✅ Visual indicator (*) in bookings table
- ✅ Fallback to standard rate if custom rate not set

### Files Changed
- `lib/supabase.ts` - Added `calculateTotalAmount()` helper
- `components/BookingForm.tsx` - Added custom pricing UI
- Database migration: `add_pricing_fields`

---

## 👥 Feature: Multi-Guest Support

### Problem Solved
Hotel rooms often have multiple guests:
- Need to track all guest details (name, Aadhaar, phone)
- Compliance and identification requirements
- Previously could only store one guest per booking

### Solution
Support for unlimited guests per booking with primary + additional guests model.

### How It Works

#### Data Model
- **Primary Guest**: Stored in main columns (always required)
  - Name, Aadhaar, Phone
  - Main contact person

- **Additional Guests**: Stored in JSONB array
  - Each with Name, Aadhaar, Phone
  - Can add/remove dynamically

#### UI Features
1. **Primary Guest Section** (always visible)
   - Labeled as "Primary Guest Name"
   - Required fields

2. **Additional Guests Section**
   - **"Add Guest" button** (green with + icon)
   - Each guest in a card with:
     - Guest number (Guest 2, Guest 3...)
     - Name, Aadhaar, Phone inputs
     - Remove button
   - Collapsible/expandable cards
   - Responsive 3-column grid

3. **Bookings Table Display**
   - Guest count badge: `3 guests`
   - Blue badge styling
   - Shows total count (primary + additional)

#### Example
```
Primary Guest:
  - Name: Mr. Sudhanshu Gupta
  - Aadhaar: 1234-5678-9012
  - Phone: +91 94579 86899

Additional Guests:
  Guest 2:
    - Name: Mrs. Priya Gupta
    - Aadhaar: 9876-5432-1098
    - Phone: +91 98765 43210

  Guest 3:
    - Name: Master Aryan Gupta
    - Aadhaar: 5555-6666-7777
    - Phone: +91 98765 43211

Total: 3 guests
```

#### Database Schema
```sql
ALTER TABLE bookings ADD COLUMN additional_guests JSONB DEFAULT '[]'::jsonb;
CREATE INDEX idx_bookings_guest_count ON bookings ((jsonb_array_length(additional_guests)));
```

#### Storage Format
```json
{
  "name": "Mr. Sudhanshu Gupta",
  "aadhaar": "1234-5678-9012",
  "phone": "+91 94579 86899",
  "additional_guests": [
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
}
```

### Features
- ✅ Unlimited guests per booking
- ✅ Required validation on all fields
- ✅ Easy add/remove UI
- ✅ Guest count indicator
- ✅ Fully responsive design
- ✅ Performance indexed queries

### Files Changed
- `types/index.ts` - Added `GuestInfo` interface
- `lib/supabase.ts` - Updated types and helpers
- `components/BookingForm.tsx` - Added multi-guest UI
- `components/BookingsTable.tsx` - Shows guest count badge
- Database migration: `add_additional_guests`

---

## 📊 Database Schema Changes

### New Columns Added

| Column | Type | Description |
|--------|------|-------------|
| `rate_per_night` | NUMERIC | Standard nightly rate in INR |
| `custom_daily_rates` | JSONB | Custom rates per date for special events |
| `total_nights` | INTEGER | Calculated number of nights |
| `additional_guests` | JSONB | Array of additional guest objects |

### Indexes Added

```sql
-- Pricing indexes
CREATE INDEX idx_bookings_date ON bookings(date DESC);
CREATE INDEX idx_bookings_check_in ON bookings(check_in);
CREATE INDEX idx_bookings_check_out ON bookings(check_out);
CREATE INDEX idx_bookings_platform ON bookings(platform);
CREATE INDEX idx_bookings_room_id ON bookings(room_id);

-- Guest count index
CREATE INDEX idx_bookings_guest_count ON bookings ((jsonb_array_length(additional_guests)));
```

### Migrations Applied

1. **create_bookings_table** - Initial schema
2. **setup_rls_policies** - Row Level Security
3. **add_pricing_fields** - Per-night and custom pricing
4. **add_additional_guests** - Multi-guest support

---

## 🔧 Technical Implementation

### New Utility Functions

**lib/supabase.ts**
```typescript
// Calculate number of nights between dates
calculateNights(checkIn: string, checkOut: string): number

// Calculate total amount (handles both standard and custom rates)
calculateTotalAmount(
  checkIn: string,
  checkOut: string,
  ratePerNight?: number,
  customDailyRates?: Record<string, number>
): number

// Generate date range for custom pricing UI
getDateRange(checkIn: string, checkOut: string): string[]

// Convert between DB and app formats
dbRowToBooking(row: BookingRow): Booking
bookingToDbRow(booking: Booking): Partial<BookingRow>
```

### API Route Updates

**app/api/bookings/route.ts** (POST)
- Validates rate per night or custom rates
- Calculates total nights automatically
- Computes total amount
- Generates sequential booking IDs

**app/api/bookings/[id]/route.ts** (PUT)
- Recalculates totals when dates or rates change
- Updates guest information
- Preserves custom pricing data

---

## 📱 UI/UX Improvements

### Booking Form Enhancements

1. **Progressive Disclosure**
   - Standard pricing shown by default
   - Custom pricing revealed via checkbox
   - Additional guests expandable section

2. **Real-time Feedback**
   - Night count updates automatically
   - Total amount preview
   - Guest count indicator

3. **Responsive Design**
   - Mobile: Single column layout
   - Tablet: 2-column grid
   - Desktop: 3-column grid for guests

4. **Visual Hierarchy**
   - Primary guest clearly labeled
   - Guest cards with gray background
   - Blue total amount box
   - Green "Add Guest" button

### Bookings Table Improvements

1. **Condensed Information**
   - Guest name + Aadhaar in one column
   - Guest count badge
   - Pricing breakdown below total

2. **Visual Indicators**
   - Blue badge for guest count
   - Asterisk (*) for custom pricing
   - Platform color badges unchanged

3. **Mobile Optimization**
   - Card view for small screens
   - Desktop table for large screens

---

## 🔐 Security & Data Migration

### Row Level Security (RLS)

```sql
-- Authenticated users (service role) have full access
CREATE POLICY "Allow full access to service role"
  ON bookings FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Anonymous users blocked
CREATE POLICY "Restrict anonymous access"
  ON bookings FOR ALL TO anon
  USING (false) WITH CHECK (false);
```

### Data Migration from Google Sheets

If you have existing data in Google Sheets:

1. Export Google Sheet as CSV
2. Go to Supabase Dashboard > Table Editor > bookings
3. Click "Insert" > "Import data from CSV"
4. Map columns:
   - Booking id → id
   - Booking date → date
   - Guest name → name
   - Adhar card → aadhaar
   - Phone number → phone
   - Amount inr → payment (will need manual rate_per_night entry)
   - Platform → platform
   - Room number → room_id
   - Check in date → check_in
   - Check out date → check_out

**Note**: Existing records will need `rate_per_night` populated manually or via SQL update.

---

## ⚙️ Environment Variables

### Updated .env.local

**Old (Google Sheets)**
```bash
GOOGLE_CREDENTIALS='{"type":"service_account"...}'
GOOGLE_SHEET_ID=your-spreadsheet-id
AUTH_USERNAME=admin
AUTH_PASSWORD=your-password
JWT_SECRET=your-jwt-secret
```

**New (Supabase)**
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ulqvwbtftigdbtlcjrot.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Authentication (unchanged)
AUTH_USERNAME=admin
AUTH_PASSWORD=your-password
JWT_SECRET=your-jwt-secret
```

### Getting Supabase Credentials

1. Go to https://supabase.com/dashboard
2. Select project: **sshrk**
3. Project Settings > API
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

**⚠️ Important**: Never commit `SUPABASE_SERVICE_ROLE_KEY` to git!

---

## 🚀 Deployment Updates

### Vercel Environment Variables

Add these to your Vercel project:

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add AUTH_USERNAME
vercel env add AUTH_PASSWORD
vercel env add JWT_SECRET
```

Or via Vercel Dashboard:
1. Go to Project Settings > Environment Variables
2. Add each variable for Production, Preview, and Development
3. Redeploy your application

---

## 📦 Dependencies Added

```json
{
  "@supabase/supabase-js": "latest"
}
```

**Removed**: Google APIs client libraries are no longer needed.

---

## 🧪 Testing Checklist

### Per-Night Pricing
- [ ] Create booking with check-in/check-out dates
- [ ] Enter rate per night
- [ ] Verify automatic calculation displays correctly
- [ ] Verify total saves to database
- [ ] Edit booking and verify recalculation

### Custom Daily Pricing
- [ ] Enable custom pricing checkbox
- [ ] Enter different rates for different dates
- [ ] Verify total calculation includes all custom rates
- [ ] Verify asterisk (*) shows in bookings table
- [ ] Save and reload to verify persistence

### Multi-Guest Support
- [ ] Add booking with just primary guest
- [ ] Click "Add Guest" and add 2nd guest
- [ ] Add 3rd guest
- [ ] Remove 2nd guest
- [ ] Verify guest count badge shows "2 guests"
- [ ] Save and reload to verify all guests persist
- [ ] Edit booking and modify guest information

### General
- [ ] All form validations working
- [ ] Mobile responsive layout
- [ ] Analytics page calculations correct
- [ ] Invoice generation works
- [ ] Search and filters functional

---

## 🐛 Known Issues & Limitations

None currently identified. Report issues at: [GitHub Issues](https://github.com/your-repo/issues)

---

## 📚 Documentation Updates

### New Files
- `CHANGELOG.md` (this file)
- `SUPABASE.md` - Updated with new schema

### Updated Files
- `README.md` - Changed from Google Sheets to Supabase
- `.env.local.example` - Supabase credentials template

---

## 💡 Future Enhancements

Potential features for next release:
- [ ] Bulk import from CSV
- [ ] Export bookings to PDF report
- [ ] Calendar view of bookings
- [ ] Guest history across bookings
- [ ] Automated pricing rules (weekends, holidays)
- [ ] Email notifications
- [ ] Payment tracking and receipts
- [ ] Room availability calendar

---

## 👥 Contributors

- Migration and feature development by Claude Code
- Original concept and requirements by development team

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🔗 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Project README](./README.md)
- [Database Schema](./SUPABASE.md)
