import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Get credentials from environment variable
function getCredentials() {
  const credsJson = process.env.GOOGLE_CREDENTIALS;
  if (!credsJson) {
    throw new Error('GOOGLE_CREDENTIALS environment variable is not set');
  }
  return JSON.parse(credsJson);
}

// Initialize Google Sheets API client
export async function getSheetsClient() {
  const credentials = getCredentials();

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
  });

  const authClient = await auth.getClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sheets = google.sheets({ version: 'v4', auth: authClient as any });

  return sheets;
}

// Get spreadsheet ID from environment variable
export function getSpreadsheetId() {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!spreadsheetId) {
    throw new Error('GOOGLE_SHEET_ID environment variable is not set');
  }
  return spreadsheetId;
}

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

// Get all bookings from the sheet
export async function getAllBookings(): Promise<Booking[]> {
  const sheets = await getSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:J', // Columns A-J for all 10 fields
  });

  const rows = response.data.values || [];
  console.log('Raw rows from sheet:', rows.length, rows);

  if (rows.length === 0) {
    console.log('No rows found in sheet');
    return [];
  }

  // Skip header row
  // Column mapping: Booking id, Booking date, Guest name, Adhar card, Phone number, Amount inr, Platform, Room number, Check in date, Check out date
  const bookings = rows.slice(1).map((row, index) => ({
    id: row[0] || `BK${String(index + 1).padStart(4, '0')}`,
    date: row[1] || '',
    name: row[2] || '',
    aadhaar: row[3] || '',
    phone: row[4] || '',
    payment: row[5] || '',
    platform: (row[6] || 'Airbnb') as Booking['platform'],
    roomId: row[7] || '',
    checkIn: row[8] || '',
    checkOut: row[9] || '',
  }));

  console.log('Processed bookings:', bookings);
  return bookings;
}

// Add a new booking
export async function addBooking(booking: Omit<Booking, 'id'>): Promise<void> {
  const sheets = await getSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  // Get current row count to generate ID
  const existingBookings = await getAllBookings();
  const newId = `BK${String(existingBookings.length + 1).padStart(4, '0')}`;

  // Column order: Booking id, Booking date, Guest name, Adhar card, Phone number, Amount inr, Platform, Room number, Check in date, Check out date
  const values = [[
    newId,
    booking.date,
    booking.name,
    booking.aadhaar,
    booking.phone,
    booking.payment,
    booking.platform,
    booking.roomId,
    booking.checkIn,
    booking.checkOut,
  ]];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Sheet1!A:J',
    valueInputOption: 'RAW',
    requestBody: {
      values,
    },
  });
}

// Update an existing booking
export async function updateBooking(id: string, booking: Partial<Booking>): Promise<void> {
  const sheets = await getSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  // Find the row number for this booking
  const allBookings = await getAllBookings();
  const rowIndex = allBookings.findIndex(b => b.id === id);

  if (rowIndex === -1) {
    throw new Error(`Booking with ID ${id} not found`);
  }

  // Row number in sheet (add 2: 1 for header, 1 for 0-indexing)
  const rowNumber = rowIndex + 2;

  const existingBooking = allBookings[rowIndex];
  const updatedBooking = { ...existingBooking, ...booking };

  // Column order: Booking id, Booking date, Guest name, Adhar card, Phone number, Amount inr, Platform, Room number, Check in date, Check out date
  const values = [[
    updatedBooking.id,
    updatedBooking.date,
    updatedBooking.name,
    updatedBooking.aadhaar,
    updatedBooking.phone,
    updatedBooking.payment,
    updatedBooking.platform,
    updatedBooking.roomId,
    updatedBooking.checkIn,
    updatedBooking.checkOut,
  ]];

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `Sheet1!A${rowNumber}:J${rowNumber}`,
    valueInputOption: 'RAW',
    requestBody: {
      values,
    },
  });
}

// Delete a booking
export async function deleteBooking(id: string): Promise<void> {
  const sheets = await getSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  // Find the row number for this booking
  const allBookings = await getAllBookings();
  const rowIndex = allBookings.findIndex(b => b.id === id);

  if (rowIndex === -1) {
    throw new Error(`Booking with ID ${id} not found`);
  }

  // Row number in sheet (add 1 for header, sheet uses 0-indexing for delete)
  const rowNumber = rowIndex + 1;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: 0, // First sheet
              dimension: 'ROWS',
              startIndex: rowNumber,
              endIndex: rowNumber + 1,
            },
          },
        },
      ],
    },
  });
}

// Initialize the sheet with headers if it's empty
export async function initializeSheet(): Promise<void> {
  const sheets = await getSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A1:J1',
    });

    // If there's no data, add headers
    if (!response.data.values || response.data.values.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Sheet1!A1:J1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [[
            'Booking id',
            'Booking date',
            'Guest name',
            'Adhar card',
            'Phone number',
            'Amount inr',
            'Platform',
            'Room number',
            'Check in date',
            'Check out date',
          ]],
        },
      });
    }
  } catch (error) {
    console.error('Error initializing sheet:', error);
    throw error;
  }
}
