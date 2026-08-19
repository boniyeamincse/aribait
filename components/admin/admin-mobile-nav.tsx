"use client";

import { useState } from "react";
import { AdminNav } from "./admin-nav";
import { Menu, X } from "lucide-react";

export function AdminMobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
      >
        <Menu size={18} />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm md:hidden"
            onClick={() => setOpen(false)}
          />
          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-950 shadow-2xl border-r border-slate-800 md:hidden">
            <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800">
              <span className="font-semibold text-white tracking-tight">Menu</span>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-white"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <AdminNav onNavigate={() => setOpen(false)} />
            </div>
          </div>
        </>
      )}
    </>
  );
}
