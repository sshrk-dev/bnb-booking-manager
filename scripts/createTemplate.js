const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  ShadingType,
  VerticalAlign,
  HeadingLevel,
} = require('docx');
const fs = require('fs');

// Colors
const GOLD = 'C3A564';
const DARK_GREEN = '00554B';
const DARK_TEXT = '232323';
const LIGHT_BG = 'F8F6F0';
const CREAM_BG = 'FFFCF5';

async function createTemplate() {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Outer decorative border using a table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 24, color: GOLD },
                      bottom: { style: BorderStyle.SINGLE, size: 24, color: GOLD },
                      left: { style: BorderStyle.SINGLE, size: 24, color: GOLD },
                      right: { style: BorderStyle.SINGLE, size: 24, color: GOLD },
                    },
                    shading: { fill: CREAM_BG, type: ShadingType.CLEAR },
                    children: [
                      // Top decorative line
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 300, after: 100 },
                        children: [
                          new TextRun({
                            text: '══════════════════════════════════════════════════',
                            color: GOLD,
                            size: 20,
                          }),
                        ],
                      }),
                      // Symbols
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 0, after: 100 },
                        children: [
                          new TextRun({
                            text: '❧ ✦ ❧',
                            color: GOLD,
                            size: 28,
                          }),
                        ],
                      }),
                      // Brand Name
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 0, after: 0 },
                        children: [
                          new TextRun({
                            text: 'House of Ridhima Kaur',
                            bold: true,
                            color: DARK_GREEN,
                            size: 56,
                            font: 'Georgia',
                          }),
                        ],
                      }),
                      // Divider
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 40, after: 60 },
                        children: [
                          new TextRun({
                            text: '─────────── ✦ ───────────',
                            color: GOLD,
                            size: 24,
                          }),
                        ],
                      }),
                      // Tagline
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 0, after: 160 },
                        children: [
                          new TextRun({
                            text: 'L U X U R Y   V A C A T I O N   R E N T A L S',
                            italics: true,
                            color: 'A08246',
                            size: 18,
                            font: 'Georgia',
                          }),
                        ],
                      }),
                      // Invoice Title Box
                      new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        alignment: AlignmentType.CENTER,
                        rows: [
                          new TableRow({
                            children: [
                              new TableCell({
                                borders: {
                                  top: { style: BorderStyle.SINGLE, size: 18, color: GOLD },
                                  bottom: { style: BorderStyle.SINGLE, size: 18, color: GOLD },
                                  left: { style: BorderStyle.SINGLE, size: 18, color: GOLD },
                                  right: { style: BorderStyle.SINGLE, size: 18, color: GOLD },
                                },
                                shading: { fill: DARK_GREEN, type: ShadingType.CLEAR },
                                children: [
                                  new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    spacing: { before: 200, after: 200 },
                                    children: [
                                      new TextRun({ text: '✦  ', color: GOLD, size: 28 }),
                                      new TextRun({
                                        text: 'I N V O I C E',
                                        bold: true,
                                        color: 'FFFFFF',
                                        size: 44,
                                        font: 'Georgia',
                                      }),
                                      new TextRun({ text: '  ✦', color: GOLD, size: 28 }),
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                      // Spacer
                      new Paragraph({ spacing: { before: 200, after: 100 } }),
                      // Invoice Details Row
                      new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        alignment: AlignmentType.CENTER,
                        rows: [
                          new TableRow({
                            children: [
                              // Invoice No
                              new TableCell({
                                borders: {
                                  top: { style: BorderStyle.NIL },
                                  bottom: { style: BorderStyle.NIL },
                                  left: { style: BorderStyle.NIL },
                                  right: { style: BorderStyle.NIL },
                                },
                                verticalAlign: VerticalAlign.CENTER,
                                children: [
                                  new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    spacing: { before: 60, after: 0 },
                                    children: [
                                      new TextRun({
                                        text: 'Invoice No.',
                                        bold: true,
                                        color: 'A08246',
                                        size: 16,
                                        font: 'Georgia',
                                      }),
                                    ],
                                  }),
                                  new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    spacing: { before: 0, after: 60 },
                                    children: [
                                      new TextRun({
                                        text: '{invoiceNo}',
                                        color: DARK_TEXT,
                                        size: 20,
                                        font: 'Georgia',
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                              // Date
                              new TableCell({
                                borders: {
                                  top: { style: BorderStyle.NIL },
                                  bottom: { style: BorderStyle.NIL },
                                  left: { style: BorderStyle.NIL },
                                  right: { style: BorderStyle.NIL },
                                },
                                verticalAlign: VerticalAlign.CENTER,
                                children: [
                                  new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    spacing: { before: 60, after: 0 },
                                    children: [
                                      new TextRun({
                                        text: 'Date',
                                        bold: true,
                                        color: 'A08246',
                                        size: 16,
                                        font: 'Georgia',
                                      }),
                                    ],
                                  }),
                                  new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    spacing: { before: 0, after: 60 },
                                    children: [
                                      new TextRun({
                                        text: '{invoiceDate}',
                                        color: DARK_TEXT,
                                        size: 20,
                                        font: 'Georgia',
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                              // Booking ID
                              new TableCell({
                                borders: {
                                  top: { style: BorderStyle.NIL },
                                  bottom: { style: BorderStyle.NIL },
                                  left: { style: BorderStyle.NIL },
                                  right: { style: BorderStyle.NIL },
                                },
                                verticalAlign: VerticalAlign.CENTER,
                                children: [
                                  new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    spacing: { before: 60, after: 0 },
                                    children: [
                                      new TextRun({
                                        text: 'Booking ID',
                                        bold: true,
                                        color: 'A08246',
                                        size: 16,
                                        font: 'Georgia',
                                      }),
                                    ],
                                  }),
                                  new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    spacing: { before: 0, after: 60 },
                                    children: [
                                      new TextRun({
                                        text: '{bookingId}',
                                        color: DARK_TEXT,
                                        size: 20,
                                        font: 'Georgia',
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                      // Separator
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 160, after: 160 },
                        children: [
                          new TextRun({
                            text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                            color: GOLD,
                            size: 16,
                          }),
                        ],
                      }),
                      // Guest Details Section
                      new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        alignment: AlignmentType.CENTER,
                        rows: [
                          new TableRow({
                            children: [
                              new TableCell({
                                borders: {
                                  top: { style: BorderStyle.SINGLE, size: 8, color: DARK_GREEN },
                                  bottom: { style: BorderStyle.SINGLE, size: 8, color: DARK_GREEN },
                                  left: { style: BorderStyle.SINGLE, size: 8, color: DARK_GREEN },
                                  right: { style: BorderStyle.SINGLE, size: 8, color: DARK_GREEN },
                                },
                                shading: { fill: LIGHT_BG, type: ShadingType.CLEAR },
                                children: [
                                  new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    spacing: { before: 160, after: 120 },
                                    children: [
                                      new TextRun({ text: '┌─── ', color: GOLD, size: 20 }),
                                      new TextRun({
                                        text: 'GUEST DETAILS',
                                        bold: true,
                                        color: DARK_GREEN,
                                        size: 20,
                                        font: 'Georgia',
                                      }),
                                      new TextRun({ text: ' ───┐', color: GOLD, size: 20 }),
                                    ],
                                  }),
                                  new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    spacing: { before: 40, after: 120 },
                                    children: [
                                      new TextRun({
                                        text: '{guestName}',
                                        bold: true,
                                        color: DARK_TEXT,
                                        size: 24,
                                        font: 'Georgia',
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                      // Spacer
                      new Paragraph({ spacing: { before: 200 } }),
                      // Stay Details Header
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 120 },
                        children: [
                          new TextRun({ text: '─────────────────── ', color: GOLD, size: 20 }),
                          new TextRun({
                            text: 'STAY DETAILS',
                            bold: true,
                            color: DARK_GREEN,
                            size: 22,
                            font: 'Georgia',
                          }),
                          new TextRun({ text: ' ───────────────────', color: GOLD, size: 20 }),
                        ],
                      }),
                      // Stay Details Table
                      new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        alignment: AlignmentType.CENTER,
                        rows: [
                          // Header Row
                          new TableRow({
                            children: [
                              new TableCell({
                                borders: {
                                  top: { style: BorderStyle.SINGLE, size: 6, color: GOLD },
                                  bottom: { style: BorderStyle.SINGLE, size: 6, color: GOLD },
                                  left: { style: BorderStyle.SINGLE, size: 6, color: GOLD },
                                  right: { style: BorderStyle.SINGLE, size: 6, color: GOLD },
                                },
                                shading: { fill: DARK_GREEN, type: ShadingType.CLEAR },
                                children: [
                                  new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    spacing: { before: 120, after: 120 },
                                    children: [
                                      new TextRun({
                                        text: 'Description',
                                        bold: true,
                                        color: 'FFFFFF',
                                        size: 18,
                                        font: 'Georgia',
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                              new TableCell({
                                borders: {
                                  top: { style: BorderStyle.SINGLE, size: 6, color: GOLD },
                                  bottom: { style: BorderStyle.SINGLE, size: 6, color: GOLD },
                                  left: { style: BorderStyle.SINGLE, size: 6, color: GOLD },
                                  right: { style: BorderStyle.SINGLE, size: 6, color: GOLD },
                                },
                                shading: { fill: DARK_GREEN, type: ShadingType.CLEAR },
                                children: [
                                  new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    spacing: { before: 120, after: 120 },
                                    children: [
                                      new TextRun({
                                        text: 'Details',
                                        bold: true,
                                        color: 'FFFFFF',
                                        size: 18,
                                        font: 'Georgia',
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          }),
                          // Check-In Row
                          createStayRow('Check-In', '{checkIn}', LIGHT_BG),
                          // Check-Out Row
                          createStayRow('Check-Out', '{checkOut}', 'FFFFFF'),
                          // Duration Row
                          createStayRow('Duration', '{nights} Night(s)', LIGHT_BG),
                          // Rate per Night Row
                          createStayRow('Rate per Night', '₹{pricePerNight}', 'FFFFFF'),
                        ],
                      }),
                      // Grand Total Row
                      new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        alignment: AlignmentType.CENTER,
                        rows: [
                          new TableRow({
                            children: [
                              new TableCell({
                                borders: {
                                  top: { style: BorderStyle.SINGLE, size: 8, color: GOLD },
                                  bottom: { style: BorderStyle.SINGLE, size: 8, color: GOLD },
                                  left: { style: BorderStyle.SINGLE, size: 8, color: GOLD },
                                  right: { style: BorderStyle.SINGLE, size: 8, color: GOLD },
                                },
                                shading: { fill: DARK_GREEN, type: ShadingType.CLEAR },
                                children: [
                                  new Paragraph({
                                    alignment: AlignmentType.LEFT,
                                    spacing: { before: 140, after: 140 },
                                    children: [
                                      new TextRun({
                                        text: '    GRAND TOTAL',
                                        bold: true,
                                        color: 'FFFFFF',
                                        size: 24,
                                        font: 'Georgia',
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                              new TableCell({
                                borders: {
                                  top: { style: BorderStyle.SINGLE, size: 8, color: GOLD },
                                  bottom: { style: BorderStyle.SINGLE, size: 8, color: GOLD },
                                  left: { style: BorderStyle.SINGLE, size: 8, color: GOLD },
                                  right: { style: BorderStyle.SINGLE, size: 8, color: GOLD },
                                },
                                shading: { fill: DARK_GREEN, type: ShadingType.CLEAR },
                                children: [
                                  new Paragraph({
                                    alignment: AlignmentType.RIGHT,
                                    spacing: { before: 140, after: 140 },
                                    children: [
                                      new TextRun({
                                        text: '₹{totalAmount}    ',
                                        bold: true,
                                        color: GOLD,
                                        size: 28,
                                        font: 'Georgia',
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                      // Spacer
                      new Paragraph({ spacing: { before: 200 } }),
                      // Bank Details
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 160, after: 160 },
                        children: [
                          new TextRun({
                            text: '✦ ═══════════════════════════════════════════════════════ ✦',
                            color: GOLD,
                            size: 16,
                          }),
                        ],
                      }),
                      // Bank Details Section
                      new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        alignment: AlignmentType.CENTER,
                        rows: [
                          new TableRow({
                            children: [
                              new TableCell({
                                borders: {
                                  top: { style: BorderStyle.SINGLE, size: 6, color: DARK_GREEN },
                                  bottom: { style: BorderStyle.SINGLE, size: 6, color: DARK_GREEN },
                                  left: { style: BorderStyle.SINGLE, size: 6, color: DARK_GREEN },
                                  right: { style: BorderStyle.SINGLE, size: 6, color: DARK_GREEN },
                                },
                                shading: { fill: LIGHT_BG, type: ShadingType.CLEAR },
                                children: [
                                  new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    spacing: { before: 160, after: 120 },
                                    children: [
                                      new TextRun({
                                        text: '◈ BANK DETAILS ◈',
                                        bold: true,
                                        color: DARK_GREEN,
                                        size: 20,
                                        font: 'Georgia',
                                      }),
                                    ],
                                  }),
                                  createBankLine('Account Name:', 'HOUSE OF RIDHIMA KAUR'),
                                  createBankLine('Account No.:', '81830713139'),
                                  createBankLine('IFSC Code:', 'IDFB0021012'),
                                  createBankLine('Bank:', 'IDFC FIRST'),
                                  createBankLine('Branch:', 'GURGAON SUSHANT LOK-I'),
                                  new Paragraph({ spacing: { after: 120 } }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                      // Terms & Conditions
                      new Paragraph({
                        spacing: { before: 200, after: 80 },
                        children: [
                          new TextRun({
                            text: 'Terms & Conditions:',
                            bold: true,
                            color: DARK_GREEN,
                            size: 16,
                            font: 'Georgia',
                          }),
                        ],
                      }),
                      createTermLine('• Check-in: 2:00 PM | Check-out: 11:00 AM'),
                      createTermLine('• Valid government ID mandatory at check-in'),
                      createTermLine('• No refunds for early checkout or no-shows'),
                      createTermLine('• Damages to property will be charged separately'),
                      // Signature
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        spacing: { before: 300, after: 40 },
                        children: [
                          new TextRun({
                            text: '_______________________________',
                            color: DARK_TEXT,
                            size: 18,
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        spacing: { before: 0, after: 0 },
                        children: [
                          new TextRun({
                            text: 'Authorized Signature',
                            italics: true,
                            color: '666666',
                            size: 16,
                            font: 'Georgia',
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        spacing: { before: 0, after: 0 },
                        children: [
                          new TextRun({
                            text: 'House of Ridhima Kaur',
                            bold: true,
                            color: DARK_GREEN,
                            size: 18,
                            font: 'Georgia',
                          }),
                        ],
                      }),
                      // Footer
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 200, after: 100 },
                        children: [
                          new TextRun({
                            text: '─────────── ✦ ❖ ✦ ───────────',
                            color: GOLD,
                            size: 20,
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 0, after: 40 },
                        children: [
                          new TextRun({
                            text: 'Thank You for Staying With Us!',
                            bold: true,
                            color: DARK_GREEN,
                            size: 22,
                            font: 'Georgia',
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 0, after: 100 },
                        children: [
                          new TextRun({
                            text: 'We hope to host you again soon.',
                            italics: true,
                            color: '666666',
                            size: 18,
                            font: 'Georgia',
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 0, after: 200 },
                        children: [
                          new TextRun({
                            text: '❧ ✦ ❧',
                            color: GOLD,
                            size: 28,
                          }),
                        ],
                      }),
                      // Bottom decorative line
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 0, after: 300 },
                        children: [
                          new TextRun({
                            text: '══════════════════════════════════════════════════',
                            color: GOLD,
                            size: 20,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync('/Volumes/mac_external/projects/bnb-booking-manager/templates/invoice-template.docx', buffer);
  console.log('Template created successfully!');
}

function createStayRow(label, value, bgColor) {
  return new TableRow({
    children: [
      new TableCell({
        borders: {
          top: { style: BorderStyle.SINGLE, size: 4, color: 'E0DDD5' },
          bottom: { style: BorderStyle.SINGLE, size: 4, color: 'E0DDD5' },
          left: { style: BorderStyle.SINGLE, size: 4, color: 'E0DDD5' },
          right: { style: BorderStyle.SINGLE, size: 4, color: 'E0DDD5' },
        },
        shading: { fill: bgColor, type: ShadingType.CLEAR },
        children: [
          new Paragraph({
            spacing: { before: 100, after: 100 },
            children: [
              new TextRun({
                text: '    ' + label,
                bold: true,
                color: '00554B',
                size: 18,
                font: 'Georgia',
              }),
            ],
          }),
        ],
      }),
      new TableCell({
        borders: {
          top: { style: BorderStyle.SINGLE, size: 4, color: 'E0DDD5' },
          bottom: { style: BorderStyle.SINGLE, size: 4, color: 'E0DDD5' },
          left: { style: BorderStyle.SINGLE, size: 4, color: 'E0DDD5' },
          right: { style: BorderStyle.SINGLE, size: 4, color: 'E0DDD5' },
        },
        shading: { fill: bgColor, type: ShadingType.CLEAR },
        children: [
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { before: 100, after: 100 },
            children: [
              new TextRun({
                text: value + '    ',
                color: '232323',
                size: 18,
                font: 'Georgia',
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function createBankLine(label, value) {
  return new Paragraph({
    spacing: { before: 40, after: 40 },
    children: [
      new TextRun({
        text: '    ' + label + ' ',
        bold: true,
        color: '00554B',
        size: 18,
        font: 'Georgia',
      }),
      new TextRun({
        text: value,
        color: '232323',
        size: 18,
        font: 'Georgia',
      }),
    ],
  });
}

function createTermLine(text) {
  return new Paragraph({
    spacing: { before: 20, after: 20 },
    children: [
      new TextRun({
        text: '    ' + text,
        color: '666666',
        size: 16,
        font: 'Georgia',
      }),
    ],
  });
}

createTemplate().catch(console.error);
