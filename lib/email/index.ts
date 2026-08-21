import nodemailer from "nodemailer";
import { prisma } from "@/lib/db/client";

export async function sendMail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}) {
  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  if (!settings) {
    throw new Error("Settings not found");
  }

  if (!settings.smtpHost || !settings.smtpUser || !settings.smtpPassword) {
    throw new Error("SMTP settings are incomplete. Please configure them in the admin dashboard.");
  }

  const transporter = nodemailer.createTransport({
    host: settings.smtpHost,
    port: settings.smtpPort || 465,
    secure: (settings.smtpPort || 465) === 465,
    family: 4, // force IPv4
    auth: {
      user: settings.smtpUser,
      pass: settings.smtpPassword,
    },
  });

  const from = settings.emailFromName
    ? `"${settings.emailFromName}" <${settings.emailFromAddress || settings.smtpUser}>`
    : settings.emailFromAddress || settings.smtpUser;

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    html: html || text,
    text,
  });

  return info;
}
