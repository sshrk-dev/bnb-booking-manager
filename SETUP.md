# Rental Booking Manager - Setup Guide

This application manages your rental property bookings from Airbnb, Goibibo, MakeMyTrip, and Agoda using Google Sheets as the database.

## Prerequisites

- Node.js 18+ installed
- A Google account
- A Google Sheet for storing bookings

## Setup Steps

### 1. Google Cloud Console Setup

#### Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name it (e.g., "Rental Booking Manager")
4. Click "Create"

#### Enable Google Sheets API

1. In the left sidebar, go to "APIs & Services" → "Library"
2. Search for "Google Sheets API"
3. Click on it and press "Enable"

#### Create Service Account

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "Service Account"
3. Fill in the details:
   - Name: `rental-booking-service`
   - Click "Create and Continue"
4. Grant role: "Editor" (or "Basic" → "Editor")
5. Click "Continue" → "Done"

#### Generate Service Account Key

1. Click on the service account you just created
2. Go to "Keys" tab
3. Click "Add Key" → "Create new key"
4. Choose "JSON" format
5. Click "Create"
6. **Save the downloaded JSON file securely** - you'll need it later

### 2. Google Sheet Setup

#### Create Your Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it (e.g., "Rental Bookings")
4. Note the **Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit
   ```

#### Share Sheet with Service Account

1. Open your Google Sheet
2. Click "Share" button
3. Add the service account email (found in the JSON file as `client_email`)
   - It looks like: `rental-booking-service@project-name.iam.gserviceaccount.com`
4. Give it "Editor" permissions
5. Uncheck "Notify people"
6. Click "Share"

#### Set Up Sheet Headers (Optional - App will auto-create)

The app will automatically create headers, but you can manually add them:

Row 1 should contain:
```
ID | Date | Name | Aadhaar Card No | Payment | Platform | Property Name | Check-in | Check-out
```

### 3. Local Environment Setup

#### Install Dependencies

Already done if you cloned this project. If not:

```bash
npm install
```

#### Configure Environment Variables

1. Create a `.env.local` file in the project root:

```bash
# .env.local
GOOGLE_CREDENTIALS='paste-your-json-credentials-here'
GOOGLE_SHEET_ID=your-spreadsheet-id-here
```

2. Fill in the values:

**GOOGLE_CREDENTIALS**: Open the downloaded JSON file and copy its entire content as a single line string:

```json
{"type":"service_account","project_id":"your-project",...}
```

**GOOGLE_SHEET_ID**: The ID from your Google Sheet URL

**Example .env.local file:**

```bash
GOOGLE_CREDENTIALS='{"type":"service_account","project_id":"rental-booking-123","private_key_id":"abc123","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...","client_email":"rental-booking-service@rental-booking-123.iam.gserviceaccount.com","client_id":"123456789","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/..."}'

GOOGLE_SHEET_ID=1AbC123DeF456GhI789JkL012MnO345PqR678StU
```

### 4. Run the Application Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Deploy to Vercel

#### Install Vercel CLI (Optional)

```bash
npm i -g vercel
```

#### Deploy via Vercel Dashboard

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository
5. Configure environment variables:
   - Add `GOOGLE_CREDENTIALS` (paste the JSON as a single line)
   - Add `GOOGLE_SHEET_ID`
6. Click "Deploy"

#### Deploy via CLI

```bash
vercel
```

Follow the prompts and add environment variables when asked.

#### Add Environment Variables to Vercel

If you didn't add them during deployment:

1. Go to your project on Vercel
2. Settings → Environment Variables
3. Add:
   - `GOOGLE_CREDENTIALS`: Your service account JSON (as a string)
   - `GOOGLE_SHEET_ID`: Your spreadsheet ID
4. Redeploy the application

## Features

### Dashboard
- Total bookings count
- Total revenue
- Average booking value
- Platform breakdown with visual charts
- Recent bookings list

### Add Booking
- Date
- Guest name
- Aadhaar card number
- Payment amount
- Platform (Airbnb/Goibibo/MakeMyTrip/Agoda)
- Property name (optional)
- Check-in/Check-out dates (optional)

### Manage Bookings
- View all bookings in a table
- Search by name, Aadhaar, or payment
- Filter by platform
- Edit existing bookings
- Delete bookings (with confirmation)

## Troubleshooting

### "GOOGLE_CREDENTIALS environment variable is not set"

- Make sure `.env.local` exists in the root directory
- Check that the JSON is properly formatted (entire content in single quotes)
- Restart the development server

### "GOOGLE_SHEET_ID environment variable is not set"

- Verify the sheet ID in `.env.local`
- Make sure there are no extra spaces

### "Failed to fetch bookings"

- Confirm the service account email has editor access to the sheet
- Check that Google Sheets API is enabled in Google Cloud Console
- Verify the service account credentials are correct

### "The caller does not have permission"

- The service account email must be added as an editor to your Google Sheet
- Check the sharing settings of your sheet

### Changes not reflecting in Google Sheets

- Check the browser console for errors
- Verify API routes are working: visit `/api/bookings` directly
- Make sure the sheet name is "Sheet1" (or update the code to match your sheet name)

## Customization

### Change Sheet Name

Edit `lib/googleSheets.ts` and update all instances of `'Sheet1!A:I'` to your sheet name:

```typescript
range: 'YourSheetName!A:I'
```

### Add More Columns

1. Update the `Booking` interface in `types/index.ts`
2. Update `lib/googleSheets.ts` to include new columns
3. Update `components/BookingForm.tsx` to add form fields
4. Update `components/BookingsTable.tsx` to display new columns

### Styling

The app uses Tailwind CSS. Modify components in the `components/` folder to change styling.

## Security Notes

- **Never commit `.env.local` to Git** (it's already in `.gitignore`)
- Keep your service account JSON file secure
- Only give necessary permissions to the service account
- Use Vercel's environment variables for production secrets

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify all setup steps are completed
3. Check browser console and terminal for error messages

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Google Sheets API
- **Deployment**: Vercel
- **Authentication**: Google Service Account

## License

MIT
