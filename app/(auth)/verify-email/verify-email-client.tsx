"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { verifyEmail } from "@/lib/auth/actions";

type Status = "verifying" | "success" | "error";

export function VerifyEmailClient({
  email,
  token,
  callbackUrl,
}: {
  email: string;
  token: string;
  callbackUrl?: string;
}) {
  const loginHref = callbackUrl
    ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : "/login";
  const [status, setStatus] = useState<Status>("verifying");
  const [message, setMessage] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    verifyEmail(email, token).then((result) => {
      if (result.ok) {
        setStatus("success");
      } else {
        setStatus("error");
        setMessage(result.error);
      }
    });
  }, [email, token]);

  if (status === "verifying") {
    return <p className="text-sm text-muted-foreground">Verifying your email…</p>;
  }

  if (status === "success") {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm">Your email is verified. You can log in now.</p>
        <Link href={loginHref} className="text-sm underline underline-offset-4">
          Go to login
        </Link>
      </div>
    );
  }

  return <p className="text-sm text-destructive">{message}</p>;
}
