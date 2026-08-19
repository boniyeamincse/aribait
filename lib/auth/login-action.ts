"use server";

import { AuthError } from "next-auth";

import { signIn } from "@/lib/auth";

type LoginResult = { ok: false; error: string } | undefined;

export async function login(
  _prevState: LoginResult,
  formData: FormData,
): Promise<LoginResult> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, error: "Invalid email or password." };
    }
    throw error;
  }
}
