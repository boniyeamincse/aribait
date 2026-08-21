import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-slate-950 font-sans text-slate-100 overflow-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-1/4 -left-1/4 h-[800px] w-[800px] rounded-full bg-indigo-600/20 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-1/4 -right-1/4 h-[800px] w-[800px] rounded-full bg-cyan-500/20 blur-[120px] mix-blend-screen" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6 py-12 flex flex-col items-center">
        {/* Logo */}
        <Link href="/" className="mb-8 flex justify-center">
          <Image
            src="/logo.png"
            alt="Ariba IT"
            width={140}
            height={42}
            className="h-10 w-auto object-contain brightness-0 invert transition-transform hover:scale-105"
            priority
          />
        </Link>

        {/* Auth Page Content */}
        <div className="w-full">
          {children}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 w-full p-6 text-center text-xs text-slate-500 z-10">
        © {new Date().getFullYear()} Ariba IT ·{" "}
        <Link href="/terms" className="hover:text-slate-300 transition-colors">
          Terms
        </Link>{" "}
        ·{" "}
        <Link href="/privacy" className="hover:text-slate-300 transition-colors">
          Privacy
        </Link>
      </div>
    </div>
  );
}
