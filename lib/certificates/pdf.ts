import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";

export async function generateCertificatePdf(params: {
  studentName: string;
  eventTitle: string;
  certificateNumber: string;
  issuedAt: Date;
  verificationUrl: string;
}) {
  const doc = await PDFDocument.create();
  const page = doc.addPage([842, 595]); // A4 landscape
  const { width, height } = page.getSize();

  const serif = await doc.embedFont(StandardFonts.TimesRomanBold);
  const regular = await doc.embedFont(StandardFonts.Helvetica);

  const border = rgb(0.1, 0.15, 0.35);
  page.drawRectangle({
    x: 24,
    y: 24,
    width: width - 48,
    height: height - 48,
    borderColor: border,
    borderWidth: 3,
  });

  const centerText = (text: string, y: number, font: typeof serif, size: number) => {
    const textWidth = font.widthOfTextAtSize(text, size);
    page.drawText(text, { x: (width - textWidth) / 2, y, size, font, color: rgb(0.1, 0.1, 0.15) });
  };

  centerText("Ariba IT", height - 90, serif, 20);
  centerText("Certificate of Completion", height - 140, serif, 32);
  centerText("This certifies that", height - 190, regular, 14);
  centerText(params.studentName, height - 230, serif, 26);
  centerText("has successfully completed", height - 270, regular, 14);
  centerText(params.eventTitle, height - 305, serif, 20);
  centerText(
    `Issued ${params.issuedAt.toLocaleDateString("en-GB", { dateStyle: "long" })} · Certificate No. ${params.certificateNumber}`,
    height - 345,
    regular,
    12,
  );

  const qrPng = await QRCode.toBuffer(params.verificationUrl, { margin: 1, width: 140 });
  const qrImage = await doc.embedPng(qrPng);
  page.drawImage(qrImage, { x: width - 190, y: 50, width: 110, height: 110 });
  page.drawText("Scan to verify", {
    x: width - 190,
    y: 38,
    size: 9,
    font: regular,
    color: rgb(0.3, 0.3, 0.3),
  });

  return doc.save();
}
