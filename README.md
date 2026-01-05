# Rental Booking Manager

A web application to manage rental property bookings from multiple platforms (Airbnb, Goibibo, MakeMyTrip, Agoda) using Supabase as a database.

## Features

✅ **Add/Edit/Delete Bookings** - Full CRUD operations
✅ **Dashboard Analytics** - Total bookings, revenue, platform breakdown
✅ **Search & Filter** - Find bookings quickly
✅ **Supabase Database** - Scalable PostgreSQL database with real-time capabilities
✅ **Free Hosting** - Deploy to Vercel at no cost
✅ **Mobile Responsive** - Works on all devices

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Your project is already set up: **sshrk** (ap-south-1)
3. Get your credentials from Supabase Dashboard:
   - Go to Project Settings > API
   - Copy the **Project URL**
   - Copy the **service_role** key (keep this secret!)

### 3. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your:
- Supabase Project URL (from step 2)
- Supabase Service Role Key (from step 2)
- Authentication credentials (username/password)
- JWT secret (generate with: `openssl rand -base64 32`)

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Deploy to Vercel

```bash
npm run build
vercel
```

Or connect your GitHub repo to Vercel for automatic deployments.

## Project Structure

```
├── app/
│   ├── api/
│   │   └── bookings/          # API routes for CRUD operations
│   ├── page.tsx               # Main page
│   └── layout.tsx             # Root layout
├── components/
│   ├── BookingForm.tsx        # Form to add/edit bookings
│   ├── BookingsTable.tsx      # Table to display bookings
│   └── Dashboard.tsx          # Analytics dashboard
├── lib/
│   └── googleSheets.ts        # Google Sheets API integration
├── types/
│   └── index.ts               # TypeScript types
├── .env.local.example         # Environment variables template
└── SETUP.md                   # Detailed setup instructions
```

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Supabase** - PostgreSQL database with real-time capabilities
- **Vercel** - Hosting

## Documentation

- [🔧 Environment Variables](./.env.local.example) - Configuration template
- [📊 Database Schema](./SUPABASE.md) - Database structure and migrations

## Screenshots

### Dashboard
View total bookings, revenue, and platform breakdown at a glance.

### Add/Edit Booking
Simple form to capture all booking details.

### Bookings Table
Searchable, filterable table with edit and delete actions.

## Support

For issues or questions, refer to the [Troubleshooting section in SETUP.md](./SETUP.md#troubleshooting).

## License

MIT
