# Quick Start Checklist

Follow this checklist to get your Rental Booking Manager up and running.

## ✅ Prerequisites

- [ ] Node.js 18+ installed
- [ ] Google account
- [ ] npm or yarn installed

## ✅ Google Cloud Setup (15 minutes)

- [ ] Go to [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Create new project
- [ ] Enable Google Sheets API
- [ ] Create service account
- [ ] Download service account JSON key
- [ ] Save the JSON file securely

## ✅ Google Sheet Setup (5 minutes)

- [ ] Create new Google Sheet
- [ ] Copy the Sheet ID from URL
- [ ] Share sheet with service account email (from JSON)
- [ ] Give "Editor" permission
- [ ] Sheet headers will be auto-created by the app

## ✅ Local Setup (5 minutes)

- [ ] Clone/download this project
- [ ] Run `npm install`
- [ ] Copy `.env.local.example` to `.env.local`
- [ ] Add `GOOGLE_CREDENTIALS` (paste JSON content)
- [ ] Add `GOOGLE_SHEET_ID` (from sheet URL)
- [ ] Run `npm run dev`
- [ ] Open http://localhost:3000
- [ ] Add a test booking

## ✅ Deployment to Vercel (10 minutes)

- [ ] Push code to GitHub
- [ ] Sign in to [Vercel](https://vercel.com)
- [ ] Import GitHub repository
- [ ] Add environment variables:
  - `GOOGLE_CREDENTIALS`
  - `GOOGLE_SHEET_ID`
- [ ] Deploy
- [ ] Test the live URL

## 🎉 Done!

Your Rental Booking Manager is now live!

## Need Help?

- **Detailed setup**: See [SETUP.md](./SETUP.md)
- **Deployment help**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Troubleshooting**: See [SETUP.md - Troubleshooting](./SETUP.md#troubleshooting)

## Environment Variables Format

### GOOGLE_CREDENTIALS
```json
{"type":"service_account","project_id":"your-project","private_key_id":"abc123"...}
```
*(Single line, no outer quotes in .env.local)*

### GOOGLE_SHEET_ID
```
1AbC123DeF456GhI789JkL012MnO345PqR678StU
```
*(From the sheet URL)*

## Testing Your Setup

1. **Local Test**:
   - Add a booking through the form
   - Check Google Sheet - should see new row
   - Delete the booking
   - Verify it's removed from sheet

2. **Deployment Test**:
   - Visit your Vercel URL
   - Repeat the above steps
   - Check dashboard analytics

## What You Get

- ✅ Add/Edit/Delete bookings
- ✅ Dashboard with analytics
- ✅ Search and filter
- ✅ Platform breakdown
- ✅ Mobile responsive
- ✅ Free hosting on Vercel
- ✅ Google Sheets as database (no DB setup!)

## Time Estimate

- **Total setup time**: ~35 minutes
- **One-time setup**: Yes
- **Monthly cost**: $0 (free!)

---

**Ready to start?** Begin with the [Google Cloud Setup](#-google-cloud-setup-15-minutes) section above!
