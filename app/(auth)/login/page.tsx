import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Log In — Ariba IT",
  description: "Log in to access your Ariba IT student dashboard.",
};

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl shadow-black/30">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-600 text-xl shadow-lg shadow-violet-500/20">
            🔐
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-400">
            Access your Ariba IT dashboard.
          </p>
        </div>

        <LoginForm />
      </div>

      {/* Footer links */}
      <div className="flex flex-col items-center gap-2 text-sm text-slate-500">
        <Link
          href="/forgot-password"
          className="hover:text-slate-300 transition-colors"
        >
          Forgot password?
        </Link>
        <p>
          No account?{" "}
          <Link
            href="/register"
            className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Register free
          </Link>
        </p>
      </div>
    </div>
  );
}
