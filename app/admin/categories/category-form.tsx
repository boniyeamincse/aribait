"use client";

import { useActionState } from "react";

import { createCategory } from "@/lib/categories/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CategoryForm() {
  const [state, formAction, pending] = useActionState(createCategory, null);

  return (
    <form action={formAction} className="flex items-end gap-3">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">New category</Label>
        <Input id="name" name="name" required minLength={2} maxLength={80} />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Adding…" : "Add category"}
      </Button>
      {state?.ok === false && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
    </form>
  );
}
