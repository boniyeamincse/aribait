"use client";

import Link from "next/link";
import { useActionState } from "react";

import { login } from "@/lib/auth/login-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {callbackUrl && <input type="hidden" name="callbackUrl" value={callbackUrl} />}
      <div className="flex flex-col gap-2.5">
        <Label htmlFor="email" className="text-slate-700 font-medium">Email Address</Label>
        <Input 
          id="email" 
          name="email" 
          type="email" 
          className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-500 focus-visible:border-blue-500 h-11 transition-all"
          placeholder="name@example.com"
          required 
        />
      </div>
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
          <Link href="/forgot-password" className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
            Recover password
          </Link>
        </div>
        <Input 
          id="password" 
          name="password" 
          type="password" 
          className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-500 focus-visible:border-blue-500 h-11 transition-all"
          placeholder="••••••••"
          required 
        />
      </div>
      {state?.ok === false && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
          <p className="text-sm font-medium text-red-400 text-center">{state.error}</p>
        </div>
      )}
      <Button 
        type="submit" 
        disabled={pending}
        className="w-full h-11 mt-2 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-semibold shadow-lg shadow-indigo-500/25 transition-all duration-300 ease-out hover:shadow-indigo-500/40 hover:-translate-y-0.5"
      >
        {pending ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Authenticating...
          </span>
        ) : "Sign in to Dashboard"}
      </Button>
    </form>
  );
}
