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
}) {
  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  const fromName = settings?.emailFromName ?? "Ariba IT";
  const fromAddress = settings?.emailFromAddress ?? "no-reply@aribait.local";

  if (!process.env.EMAIL_API_KEY) {
    console.log(
      `[email:dev] from="${fromName} <${fromAddress}>" to=${params.to} subject="${params.subject}"\n${params.text}`,
    );
    return;
  }

  throw new Error(
    "EMAIL_API_KEY is set but no live email provider is wired up yet.",
  );
}
