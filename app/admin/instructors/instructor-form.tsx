"use client";

import { useActionState } from "react";

import { createInstructor } from "@/lib/instructors/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function InstructorForm() {
  const [state, formAction, pending] = useActionState(createInstructor, null);

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required minLength={2} maxLength={100} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" placeholder="e.g. Senior SOC Analyst" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" name="bio" rows={3} />
      </div>
      {state?.ok === false && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Adding…" : "Add instructor"}
      </Button>
    </form>
  );
}
