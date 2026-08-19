"use client";

import { useState } from "react";
import Link from "next/link";

interface MobileMenuProps {
  isLoggedIn: boolean;
  isAdmin: boolean;
}

export function MobileMenu({ isLoggedIn, isAdmin }: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger toggle */}
      <button
        id="mobile-menu-toggle"
        aria-label="Toggle navigation menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:hidden"
      >
        {open ? (
          /* X icon */
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          /* Hamburger icon */
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Dropdown menu */}
      {open && (
        <div
          className="absolute left-0 right-0 top-full z-50 border-b border-slate-200 bg-slate-50 px-4 pb-4 pt-2 shadow-xl sm:hidden"
          onClick={() => setOpen(false)}
        >
          <nav className="flex flex-col gap-1">
            {[
              { href: "/", label: "Home" },
              { href: "/events", label: "Events" },
              { href: "/training", label: "Training" },
              { href: "/schedule", label: "Schedule" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                {item.label}
              </Link>
            ))}

            <div className="my-2 h-px bg-slate-100" />

            {isLoggedIn ? (
              <>
                <Link
                  href={isAdmin ? "/admin" : "/dashboard"}
                  className="rounded-lg px-3 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                >
                  Dashboard
                </Link>
                <form action="/api/auth/signout" method="POST">
                  <button
                    type="submit"
                    className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                  >
                    Log out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-lg px-3 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="mt-1 inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-green-600 px-4 py-2.5 text-sm font-semibold text-slate-900 transition-all hover:from-blue-400 hover:to-green-500"
                >
                  Register Free
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </>
  );
}
