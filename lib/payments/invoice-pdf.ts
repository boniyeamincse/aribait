import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function generateInvoicePdf(params: {
  invoiceNumber: string;
  registrationId: string;
  trxId: string;
  studentName: string;
  studentEmail: string;
  eventTitle: string;
  originalPriceBdt: number;
  couponCode: string | null;
  discountBdt: number;
  finalAmountBdt: number;
  paymentMethod: string;
  paymentDate: Date;
}) {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]); // A4 portrait
  const { width, height } = page.getSize();

  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const dark = rgb(0.1, 0.1, 0.15);
  const muted = rgb(0.45, 0.45, 0.5);

  let y = height - 60;
  page.drawText("Ariba IT", { x: 48, y, size: 22, font: bold, color: dark });
  page.drawText("Live class, training and event registration platform", {
    x: 48,
    y: y - 18,
    size: 9,
    font: regular,
    color: muted,
  });

  page.drawText("INVOICE", { x: width - 180, y, size: 22, font: bold, color: dark });
  page.drawText(`Invoice #: ${params.invoiceNumber}`, {
    x: width - 180,
    y: y - 18,
    size: 9,
    font: regular,
    color: muted,
  });
  page.drawText(`Date: ${params.paymentDate.toLocaleDateString("en-GB", { dateStyle: "medium" })}`, {
    x: width - 180,
    y: y - 32,
    size: 9,
    font: regular,
    color: muted,
  });

  y -= 80;
  page.drawLine({ start: { x: 48, y }, end: { x: width - 48, y }, thickness: 1, color: rgb(0.85, 0.85, 0.87) });

  y -= 30;
  page.drawText("Billed to", { x: 48, y, size: 10, font: bold, color: dark });
  y -= 16;
  page.drawText(params.studentName, { x: 48, y, size: 11, font: regular, color: dark });
  y -= 15;
  page.drawText(params.studentEmail, { x: 48, y, size: 10, font: regular, color: muted });

  y -= 40;
  const rows: [string, string][] = [
    ["Registration ID", params.registrationId],
    ["Transaction ID", params.trxId],
    ["Payment method", params.paymentMethod],
    ["Payment status", "PAID"],
  ];
  for (const [label, value] of rows) {
    page.drawText(label, { x: 48, y, size: 10, font: regular, color: muted });
    page.drawText(value, { x: 220, y, size: 10, font: regular, color: dark });
    y -= 18;
  }

  y -= 20;
  page.drawLine({ start: { x: 48, y }, end: { x: width - 48, y }, thickness: 1, color: rgb(0.85, 0.85, 0.87) });
  y -= 30;

  page.drawText("Description", { x: 48, y, size: 10, font: bold, color: dark });
  page.drawText("Amount (BDT)", { x: width - 150, y, size: 10, font: bold, color: dark });
  y -= 20;

  page.drawText(params.eventTitle, { x: 48, y, size: 10, font: regular, color: dark });
  page.drawText(params.originalPriceBdt.toLocaleString("en-BD"), {
    x: width - 150,
    y,
    size: 10,
    font: regular,
    color: dark,
  });
  y -= 20;

  if (params.discountBdt > 0) {
    page.drawText(
      params.couponCode ? `Coupon discount (${params.couponCode})` : "Discount",
      { x: 48, y, size: 10, font: regular, color: dark },
    );
    page.drawText(`-${params.discountBdt.toLocaleString("en-BD")}`, {
      x: width - 150,
      y,
      size: 10,
      font: regular,
      color: dark,
    });
    y -= 20;
  }

  y -= 10;
  page.drawLine({ start: { x: 48, y }, end: { x: width - 48, y }, thickness: 1, color: rgb(0.85, 0.85, 0.87) });
  y -= 26;

  page.drawText("Total Paid (BDT)", { x: 48, y, size: 12, font: bold, color: dark });
  page.drawText(params.finalAmountBdt.toLocaleString("en-BD"), {
    x: width - 150,
    y,
    size: 12,
    font: bold,
    color: dark,
  });

  page.drawText("This is a system-generated invoice for a manually verified bKash/Nagad payment.", {
    x: 48,
    y: 60,
    size: 8,
    font: regular,
    color: muted,
  });

  return doc.save();
}

export async function generateEnrollmentConfirmationPdf(params: {
  confirmationNumber: string;
  registrationId: string;
  studentName: string;
  studentEmail: string;
  eventTitle: string;
  registeredAt: Date;
}) {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]); // A4 portrait
  const { width, height } = page.getSize();

  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const dark = rgb(0.1, 0.1, 0.15);
  const muted = rgb(0.45, 0.45, 0.5);

  let y = height - 60;
  page.drawText("Ariba IT", { x: 48, y, size: 22, font: bold, color: dark });
  page.drawText("Live class, training and event registration platform", {
    x: 48,
    y: y - 18,
    size: 9,
    font: regular,
    color: muted,
  });

  page.drawText("ENROLLMENT CONFIRMATION", { x: width - 300, y, size: 18, font: bold, color: dark });
  page.drawText(`Confirmation #: ${params.confirmationNumber}`, {
    x: width - 300,
    y: y - 18,
    size: 9,
    font: regular,
    color: muted,
  });
  page.drawText(
    `Date: ${params.registeredAt.toLocaleDateString("en-GB", { dateStyle: "medium" })}`,
    { x: width - 300, y: y - 32, size: 9, font: regular, color: muted },
  );

  y -= 80;
  page.drawLine({ start: { x: 48, y }, end: { x: width - 48, y }, thickness: 1, color: rgb(0.85, 0.85, 0.87) });

  y -= 30;
  page.drawText("Enrolled student", { x: 48, y, size: 10, font: bold, color: dark });
  y -= 16;
  page.drawText(params.studentName, { x: 48, y, size: 11, font: regular, color: dark });
  y -= 15;
  page.drawText(params.studentEmail, { x: 48, y, size: 10, font: regular, color: muted });

  y -= 40;
  const rows: [string, string][] = [
    ["Registration ID", params.registrationId],
    ["Event", params.eventTitle],
    ["Amount", "৳0"],
    ["Payment", "Not Required"],
    ["Registration status", "Confirmed"],
  ];
  for (const [label, value] of rows) {
    page.drawText(label, { x: 48, y, size: 10, font: regular, color: muted });
    page.drawText(value, { x: 220, y, size: 10, font: regular, color: dark });
    y -= 18;
  }

  page.drawText("This confirms free enrollment — no payment was required for this Event.", {
    x: 48,
    y: 60,
    size: 8,
    font: regular,
    color: muted,
  });

  return doc.save();
}
