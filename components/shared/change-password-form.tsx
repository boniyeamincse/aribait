"use client";

import { useActionState, useEffect, useRef } from "react";

import { changeOwnPassword } from "@/lib/dashboard/profile-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changeOwnPassword, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="currentPassword" className="text-xs">
          Current password
        </Label>
        <Input id="currentPassword" name="currentPassword" type="password" required autoComplete="current-password" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="newPassword" className="text-xs">
          New password
        </Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          minLength={8}
          maxLength={72}
          autoComplete="new-password"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirmPassword" className="text-xs">
          Confirm new password
        </Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          maxLength={72}
          autoComplete="new-password"
        />
      </div>
      {state?.ok === false && <p className="text-xs text-destructive">{state.error}</p>}
      {state?.ok === true && <p className="text-xs text-emerald-600">Password changed.</p>}
      <Button type="submit" size="sm" disabled={pending} className="self-start">
        {pending ? "Changing…" : "Change password"}
      </Button>
    </form>
  );
}
