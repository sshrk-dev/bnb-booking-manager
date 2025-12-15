import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import ejs from 'ejs';
import path from 'path';
import fs from 'fs';

// Format date to "DD-Mon-YYYY" format
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// Format number with Indian locale
function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num);
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    const requiredFields = [
      'invoiceNo',
      'invoiceDate',
      'bookingId',
      'guestName',
      'checkIn',
      'checkOut',
      'nights',
      'pricePerNight',
      'totalAmount',
    ];

    for (const field of requiredFields) {
      if (!data[field] && data[field] !== 0) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Convert images to base64 data URIs (file:// URLs don't work in headless browsers)
    const publicDir = path.join(process.cwd(), 'public', 'images');

    const logoFile = path.join(publicDir, 'logo.png');
    const signatureFile = path.join(publicDir, 'signature.png');
    const qrCodeFile = path.join(publicDir, 'qr-code.png');

    const logoBase64 = fs.existsSync(logoFile)
      ? `data:image/png;base64,${fs.readFileSync(logoFile).toString('base64')}`
      : '';
    const signatureBase64 = fs.existsSync(signatureFile)
      ? `data:image/png;base64,${fs.readFileSync(signatureFile).toString('base64')}`
      : '';
    const qrCodeBase64 = fs.existsSync(qrCodeFile)
      ? `data:image/png;base64,${fs.readFileSync(qrCodeFile).toString('base64')}`
      : '';

    // Format the data for the template
    const templateData = {
      invoiceNo: data.invoiceNo,
      invoiceDate: formatDate(data.invoiceDate),
      bookingId: data.bookingId,
      guestName: data.guestName,
      checkIn: formatDate(data.checkIn),
      checkOut: formatDate(data.checkOut),
      nights: data.nights,
      pricePerNight: formatNumber(data.pricePerNight),
      totalAmount: formatNumber(data.totalAmount),
      logoPath: logoBase64,
      signaturePath: signatureBase64,
      qrCodePath: qrCodeBase64,
    };

    // Read the EJS template
    const templatePath = path.join(process.cwd(), 'templates', 'invoice-template.ejs');
    const templateContent = fs.readFileSync(templatePath, 'utf-8');

    // Render the HTML
    const html = ejs.render(templateContent, templateData);

    // Launch Puppeteer and generate PDF
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1200, height: 800 },
      executablePath: await chromium.executablePath(),
      headless: true,
    });

    const page = await browser.newPage();

    // Set the HTML content
    await page.setContent(html, {
      waitUntil: 'networkidle0',
    });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0',
        right: '0',
        bottom: '0',
        left: '0',
      },
    });

    await browser.close();

    // Return the PDF
    const filename = `${data.invoiceNo}_${data.guestName.replace(/\s+/g, '_')}.pdf`;

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
