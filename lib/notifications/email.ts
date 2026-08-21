import nodemailer from "nodemailer";

import { prisma } from "@/lib/db/client";

/**
 * Email adapter — swap this implementation for a real transactional
 * provider (Resend, Postmark, SES, ...) behind EMAIL_API_KEY. Until that
 * provider is wired up, sends are logged to the server console so the
 * verification/reset flow is testable end to end without one.
 */
export async function sendEmail(params: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  const fromName = settings?.emailFromName ?? "Ariba IT";
  const fromAddress = settings?.emailFromAddress ?? "no-reply@aribait.local";

  const host = settings?.smtpHost;
  const port = settings?.smtpPort;
  const user = settings?.smtpUser;
  const pass = settings?.smtpPassword;

  // Fallback to console logging if SMTP is not fully configured
  if (!host || !port || !user || !pass) {
    console.log(
      `[email:dev] from="${fromName} <${fromAddress}>" to=${params.to} subject="${params.subject}"\n${params.text}`,
    );
    console.log("[email:dev] Note: SMTP settings are incomplete in the admin dashboard.");
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports (like 587)
    auth: {
      user,
      pass,
    },
  });

  await transporter.sendMail({
    from: `"${fromName}" <${fromAddress}>`,
    to: params.to,
    subject: params.subject,
    text: params.text,
    html: params.html,
  });
}
