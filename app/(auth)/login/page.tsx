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
    <div className="flex flex-col gap-8 w-full max-w-sm mx-auto">
      {/* Card */}
      <div className="relative z-10 rounded-3xl border border-slate-800/80 bg-slate-900/60 p-8 sm:p-10 shadow-2xl backdrop-blur-xl ring-1 ring-white/5">
        {/* Header */}
        <div className="mb-8 text-center space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Welcome back
          </h1>
          <p className="text-sm font-medium text-slate-400">
            {callbackUrl ? "Sign in to continue your booking." : "Access your secure Ariba IT dashboard."}
          </p>
        </div>

        <LoginForm callbackUrl={callbackUrl} />
      </div>

      {/* Footer links */}
      <div className="flex flex-col items-center gap-3 text-sm text-slate-400">
        <Link
          href="/forgot-password"
          className="hover:text-white transition-colors duration-200"
        >
          Forgot password?
        </Link>
        <p className="text-slate-500">
          No account?{" "}
          <Link
            href={registerHref}
            className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline underline-offset-4 transition-all duration-200"
          >
            Register free
          </Link>
        </p>
      </div>
    </div>
  );
}
