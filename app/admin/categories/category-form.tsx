"use client";

import { useActionState } from "react";

import { createCategory } from "@/lib/categories/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CategoryForm() {
  const [state, formAction, pending] = useActionState(createCategory, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name" className="text-slate-700">Category Name</Label>
        <Input 
          id="name" 
          name="name" 
          placeholder="e.g. Web Development"
          required 
          minLength={2} 
          maxLength={80} 
          className="focus-visible:ring-indigo-500"
        />
      </div>
      <Button type="submit" disabled={pending} className="w-full bg-slate-900 hover:bg-slate-800 text-white">
        {pending ? "Adding…" : "Add Category"}
      </Button>
      {state?.ok === false && (
        <p className="text-sm text-red-500 bg-red-50 p-2 rounded border border-red-100">{state.error}</p>
      )}
    </form>
  );
}
