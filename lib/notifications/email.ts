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
  if (!process.env.EMAIL_API_KEY) {
    console.log(
      `[email:dev] to=${params.to} subject="${params.subject}"\n${params.text}`,
    );
    return;
  }

  throw new Error(
    "EMAIL_API_KEY is set but no live email provider is wired up yet.",
  );
}
