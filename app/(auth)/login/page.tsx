import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Log In — Ariba IT",
  description: "Log in to access your Ariba IT student dashboard.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const callbackUrl = typeof params.callbackUrl === "string" ? params.callbackUrl : undefined;
  const registerHref = callbackUrl
    ? `/register?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : "/register";

  return (
    <div className="flex flex-col gap-6">
      {/* Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-black/30">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-600">
            {callbackUrl ? "Sign in to continue your booking." : "Access your Ariba IT dashboard."}
          </p>
        </div>

        <LoginForm callbackUrl={callbackUrl} />
      </div>

      {/* Footer links */}
      <div className="flex flex-col items-center gap-2 text-sm text-slate-500">
        <Link
          href="/forgot-password"
          className="hover:text-slate-700 transition-colors"
        >
          Forgot password?
        </Link>
        <p>
          No account?{" "}
          <Link
            href={registerHref}
            className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
          >
            Register free
          </Link>
        </p>
      </div>
    </div>
  );
}
