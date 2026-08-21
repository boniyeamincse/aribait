"use client";

import { useActionState, useRef } from "react";

type ActionResult = { ok: true } | { ok: false; error: string };

export function AvatarUploadForm({
  action,
  currentImage,
  fallbackText,
}: {
  action: (prevState: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  currentImage: string | null;
  fallbackText: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col items-center gap-2">
      <label
        htmlFor="photo"
        className="group relative flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-green-600 text-2xl font-bold text-slate-900 shadow-lg shadow-blue-500/20"
        title="Change photo"
      >
        {currentImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={currentImage} alt="" className="h-full w-full object-cover" />
        ) : (
          fallbackText
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
          {pending ? "Uploading…" : "Change"}
        </span>
      </label>
      <input
        id="photo"
        name="photo"
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="sr-only"
        disabled={pending}
        onChange={() => formRef.current?.requestSubmit()}
      />
      {state?.ok === false && <p className="text-xs text-destructive">{state.error}</p>}
    </form>
  );
}
