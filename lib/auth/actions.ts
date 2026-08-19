"use server";

import { randomBytes } from "crypto";

import { prisma } from "@/lib/db/client";
import { sendEmail } from "@/lib/notifications/email";
import { hashPassword } from "@/lib/security/password";
import { loginSchema, passwordSchema, registerSchema } from "@/lib/validations/auth";
import { safeRedirectPath } from "@/lib/utils";

const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

type ActionResult = { ok: true } | { ok: false; error: string };

function verifyIdentifier(email: string) {
  return `verify:${email}`;
}

function resetIdentifier(email: string) {
  return `reset:${email}`;
}

async function issueToken(identifier: string, ttlMs: number) {
  const token = randomBytes(32).toString("hex");
  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({
    data: { identifier, token, expires: new Date(Date.now() + ttlMs) },
  });
  return token;
}

export async function registerStudent(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  if (formData.get("acceptTerms") !== "on") {
    return { ok: false, error: "You must accept the Terms and Privacy Policy to continue." };
  }

  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Please check the form for errors.",
    };
  }
  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "An account with this email already exists." };
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.create({
    data: { name, email, passwordHash, role: "STUDENT", status: "PENDING" },
  });

  const token = await issueToken(verifyIdentifier(email), VERIFY_TOKEN_TTL_MS);
  const callbackUrl = safeRedirectPath(formData.get("callbackUrl") as string | null, "");
  const callbackParam = callbackUrl ? `&callbackUrl=${encodeURIComponent(callbackUrl)}` : "";
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/verify-email?email=${encodeURIComponent(email)}&token=${token}${callbackParam}`;

  await sendEmail({
    to: email,
    subject: "Verify your Ariba IT account",
    text: `Welcome to Ariba IT. Verify your email: ${verifyUrl}`,
  });

  return { ok: true };
}

export async function verifyEmail(
  email: string,
  token: string,
): Promise<ActionResult> {
  const identifier = verifyIdentifier(email);
  const record = await prisma.verificationToken.findUnique({
    where: { identifier_token: { identifier, token } },
  });
  if (!record || record.expires < new Date()) {
    return { ok: false, error: "This verification link is invalid or expired." };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { email },
      data: { status: "ACTIVE", emailVerified: new Date() },
    }),
    prisma.verificationToken.delete({
      where: { identifier_token: { identifier, token } },
    }),
  ]);

  return { ok: true };
}

export async function requestPasswordReset(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = loginSchema.pick({ email: true }).safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { ok: false, error: "Enter a valid email address." };
  }
  const { email } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  // Always report success — do not reveal whether an account exists.
  if (user) {
    const token = await issueToken(resetIdentifier(email), RESET_TOKEN_TTL_MS);
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/reset-password?email=${encodeURIComponent(email)}&token=${token}`;
    await sendEmail({
      to: email,
      subject: "Reset your Ariba IT password",
      text: `Reset your password: ${resetUrl}`,
    });
  }

  return { ok: true };
}

export async function resetPassword(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "");
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");

  const parsed = passwordSchema.safeParse({ password });
  if (!parsed.success) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }

  const identifier = resetIdentifier(email);
  const record = await prisma.verificationToken.findUnique({
    where: { identifier_token: { identifier, token } },
  });
  if (!record || record.expires < new Date()) {
    return { ok: false, error: "This reset link is invalid or expired." };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await prisma.$transaction([
    prisma.user.update({ where: { email }, data: { passwordHash } }),
    prisma.verificationToken.delete({
      where: { identifier_token: { identifier, token } },
    }),
  ]);

  return { ok: true };
}
