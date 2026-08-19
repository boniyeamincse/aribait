import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Create Account — Ariba IT",
  description:
    "Register as a student to browse, enroll, and join live IT and cybersecurity training events.",
};

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl shadow-black/30">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-600 text-xl shadow-lg shadow-cyan-500/20">
            🎓
          </div>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="mt-1 text-sm text-slate-400">
            Register as a student to browse and join Events.
          </p>
        </div>

        <RegisterForm />
      </div>

      {/* Footer link */}
      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
