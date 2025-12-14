import { NextRequest, NextResponse } from 'next/server';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    const requiredFields = ['invoiceNo', 'invoiceDate', 'bookingId', 'guestName', 'checkIn', 'checkOut', 'nights', 'pricePerNight', 'totalAmount'];
    for (const field of requiredFields) {
      if (!data[field] && data[field] !== 0) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Format the data
    const templateData = {
      invoiceNo: data.invoiceNo,
      invoiceDate: formatDate(data.invoiceDate),
      bookingId: data.bookingId,
      guestName: data.guestName,
      checkIn: formatDate(data.checkIn) + ' at 2:00 PM',
      checkOut: formatDate(data.checkOut) + ' at 11:00 AM',
      nights: data.nights.toString(),
      pricePerNight: formatNumber(data.pricePerNight),
      totalAmount: formatNumber(data.totalAmount),
    };

    // Load the template
    const templatePath = path.join(process.cwd(), 'templates', 'invoice-template.docx');

    if (!fs.existsSync(templatePath)) {
      return NextResponse.json({ error: 'Template file not found' }, { status: 500 });
    }

    const content = fs.readFileSync(templatePath, 'binary');
    const zip = new PizZip(content);

    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // Render the document with the data
    doc.render(templateData);

    // Generate the output
    const buffer = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });

    // Convert Buffer to Uint8Array for NextResponse
    const uint8Array = new Uint8Array(buffer);

    // Return the document as a download
    const filename = `${data.invoiceNo}_${data.guestName.replace(/\s+/g, '_')}.docx`;

    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error generating invoice:', error);
    return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 });
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num);
}
