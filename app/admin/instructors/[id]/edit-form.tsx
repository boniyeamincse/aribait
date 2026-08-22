"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import { updateInstructorProfileAdmin } from "@/lib/instructors/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ProfileValues = {
  name: string;
  email: string | null;
  title: string | null;
  bio: string | null;
  company: string | null;
  phone: string | null;
  website: string | null;
  twitterUrl: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
};

export function InstructorAdminEditForm({
  instructorId,
  defaultValues,
}: {
  instructorId: string;
  defaultValues: ProfileValues;
}) {
  const updateWithId = updateInstructorProfileAdmin.bind(null, instructorId);
  const [state, formAction, pending] = useActionState(updateWithId, null);
  // Controlled, seeded once — see app/instructor/profile/profile-form.tsx for
  // why we don't re-sync defaultValues after mount (Base UI uncontrolled-field warning).
  const [values, setValues] = useState(defaultValues);

  useEffect(() => {
    if (state?.ok) toast.success("Instructor profile updated.");
  }, [state]);

  const field = (key: keyof ProfileValues) => ({
    value: values[key] ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues((v) => ({ ...v, [key]: e.target.value })),
  });

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required minLength={2} maxLength={100} {...field("name")} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" {...field("title")} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Public contact email</Label>
        <Input id="email" name="email" type="email" {...field("email")} />
        <p className="text-xs text-slate-500">
          Shown on the public instructor page — separate from their login email.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" name="bio" rows={4} {...field("bio")} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" {...field("phone")} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="company">Company</Label>
          <Input id="company" name="company" {...field("company")} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="website">Website URL</Label>
          <Input id="website" name="website" type="url" {...field("website")} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
          <Input id="linkedinUrl" name="linkedinUrl" type="url" {...field("linkedinUrl")} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="githubUrl">GitHub URL</Label>
          <Input id="githubUrl" name="githubUrl" type="url" {...field("githubUrl")} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="twitterUrl">Twitter/X URL</Label>
          <Input id="twitterUrl" name="twitterUrl" type="url" {...field("twitterUrl")} />
        </div>
      </div>

      {state?.ok === false && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
