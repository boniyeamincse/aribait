import { SiteHeader } from "@/components/public/site-header";
import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col bg-slate-950">
      <SiteHeader />

      {/* Page body */}
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">{children}</div>
      </main>

      {/* Minimal footer */}
      <footer className="border-t border-slate-800 px-6 py-5 text-center text-xs text-slate-600">
        © {new Date().getFullYear()} Ariba IT.{" "}
        <Link href="/terms" className="hover:text-slate-400 transition-colors">
          Terms
        </Link>{" "}
        ·{" "}
        <Link
          href="/privacy"
          className="hover:text-slate-400 transition-colors"
        >
          Privacy
        </Link>
      </footer>
    </div>
  );
}
