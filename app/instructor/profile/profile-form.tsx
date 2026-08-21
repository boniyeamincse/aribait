"use client";

import { useActionState, useState } from "react";

import { updateOwnInstructorProfile } from "@/lib/instructors/profile-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ProfileValues = {
  name: string;
  title: string | null;
  bio: string | null;
  company: string | null;
  phone: string | null;
  website: string | null;
  twitterUrl: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
};

export function InstructorProfileForm({ defaultValues }: { defaultValues: ProfileValues }) {
  const [state, formAction, pending] = useActionState(updateOwnInstructorProfile, null);
  // Controlled fields, seeded once from server data on mount — a later
  // revalidatePath() re-render (e.g. after this same save) passes updated
  // defaultValues down, but we intentionally don't re-sync from props here:
  // doing so via `defaultValue` on an already-mounted input is what Base UI
  // warns against ("changing the default value state of an uncontrolled
  // FieldControl after being initialized").
  const [values, setValues] = useState(defaultValues);

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
      {state?.ok === true && <p className="text-sm text-emerald-600">Profile saved.</p>}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}
