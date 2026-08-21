import "dotenv/config";
import { sendMail } from "./lib/email";

async function main() {
  try {
    console.log("Sending test email to akijjuteltd@gmail.com...");
    const info = await sendMail({
      to: "akijjuteltd@gmail.com",
      subject: "[TEST] Ariba IT SMTP Configuration Test",
      text: "Hello! If you are seeing this, your SMTP configuration for Ariba IT is working perfectly.\n\nBest regards,\nAriba IT Team",
      html: "<p>Hello! If you are seeing this, your <strong>SMTP configuration</strong> for Ariba IT is working perfectly.</p><br/><p>Best regards,<br/>Ariba IT Team</p>",
    });
    console.log("Success! Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}

main();
