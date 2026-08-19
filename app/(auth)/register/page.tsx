import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Create Account — Ariba IT",
  description:
    "Register as a student to browse, enroll, and join live IT and cybersecurity training events.",
};

export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
  const params = await searchParams;
  const callbackUrl = typeof params.callbackUrl === "string" ? params.callbackUrl : undefined;
  const loginHref = callbackUrl
    ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : "/login";

  return (
    <div className="flex flex-col gap-6">
      {/* Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-black/30">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-green-600 text-xl shadow-lg shadow-blue-500/20">
            🎓
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="mt-1 text-sm text-slate-600">
            {callbackUrl
              ? "Create an account to continue your booking."
              : "Register as a student to browse and join Events."}
          </p>
        </div>

        <RegisterForm callbackUrl={callbackUrl} />
      </div>

      {/* Footer link */}
      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          href={loginHref}
          className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
