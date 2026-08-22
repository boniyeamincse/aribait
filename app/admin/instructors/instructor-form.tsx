"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";

import { createInstructor } from "@/lib/instructors/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function InstructorForm({ onSuccess }: { onSuccess?: () => void } = {}) {
  const [state, formAction, pending] = useActionState(createInstructor, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      toast.success("Instructor created.");
      formRef.current?.reset();
      onSuccess?.();
    }
  }, [state, onSuccess]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-6 w-full">
      {/* Basic Profile */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name" className="text-slate-700 font-medium">Full Name <span className="text-red-500">*</span></Label>
          <Input id="name" name="name" required minLength={2} maxLength={100} className="focus-visible:ring-indigo-500" placeholder="e.g. John Doe" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="title" className="text-slate-700 font-medium">Professional Title</Label>
          <Input id="title" name="title" placeholder="e.g. Senior SOC Analyst" className="focus-visible:ring-indigo-500" />
        </div>
      </div>
      
      {/* Login Credentials Highlight Box */}
      <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-5 shadow-sm">
        <p className="mb-4 text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          Account Login Credentials
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="text-slate-700 font-medium">Email Address <span className="text-red-500">*</span></Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="instructor@example.com"
              className="bg-white focus-visible:ring-indigo-500 border-indigo-100"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password" className="text-slate-700 font-medium">Password <span className="text-red-500">*</span></Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              maxLength={72}
              placeholder="Minimum 8 characters"
              className="bg-white focus-visible:ring-indigo-500 border-indigo-100"
            />
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="phone" className="text-slate-700 font-medium">Phone Number</Label>
          <Input id="phone" name="phone" placeholder="+880 1..." className="focus-visible:ring-indigo-500" />
        </div>
        <div className="flex flex-col gap-2 lg:col-span-2">
          <Label htmlFor="company" className="text-slate-700 font-medium">Company / Organization</Label>
          <Input id="company" name="company" placeholder="Where do they work?" className="focus-visible:ring-indigo-500" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="bio" className="text-slate-700 font-medium">Instructor Biography</Label>
        <Textarea id="bio" name="bio" rows={3} placeholder="Brief background, experience, and achievements..." className="focus-visible:ring-indigo-500 resize-none" />
      </div>

      {/* Social Links */}
      <div className="rounded-xl border border-slate-200 p-5 bg-slate-50/30">
        <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
          Web & Social Links
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="website" className="text-slate-700 text-xs">Personal Website</Label>
            <Input id="website" name="website" type="url" placeholder="https://..." className="focus-visible:ring-indigo-500 text-sm" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="linkedinUrl" className="text-slate-700 text-xs">LinkedIn URL</Label>
            <Input id="linkedinUrl" name="linkedinUrl" type="url" placeholder="https://linkedin.com/in/..." className="focus-visible:ring-indigo-500 text-sm" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="githubUrl" className="text-slate-700 text-xs">GitHub URL</Label>
            <Input id="githubUrl" name="githubUrl" type="url" placeholder="https://github.com/..." className="focus-visible:ring-indigo-500 text-sm" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="twitterUrl" className="text-slate-700 text-xs">Twitter/X URL</Label>
            <Input id="twitterUrl" name="twitterUrl" type="url" placeholder="https://twitter.com/..." className="focus-visible:ring-indigo-500 text-sm" />
          </div>
        </div>
      </div>

      {state?.ok === false && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100 flex items-start gap-2">
          <svg className="mt-0.5 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <p>{state.error}</p>
        </div>
      )}

      <div className="flex justify-end mt-2 pt-4 border-t border-slate-100">
        <Button 
          type="submit" 
          disabled={pending} 
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 shadow-sm"
        >
          {pending ? "Creating Profile..." : "Create Instructor Account"}
        </Button>
      </div>
    </form>
  );
}
