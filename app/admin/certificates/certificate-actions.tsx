"use client";

import { useState, useTransition } from "react";

import {
  issueCertificate,
  reissueCertificate,
  revokeCertificate,
} from "@/lib/certificates/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function IssueCertificateButton({ registrationId }: { registrationId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        size="sm"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await issueCertificate(registrationId);
            setError(result.ok ? null : result.error);
          })
        }
      >
        {pending ? "Issuing…" : "Issue certificate"}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function RevokeCertificateButton({ certificateId }: { certificateId: string }) {
  const [pending, startTransition] = useTransition();
  const [reason, setReason] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!showInput) {
    return (
      <Button size="sm" variant="destructive" onClick={() => setShowInput(true)}>
        Revoke
      </Button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-1">
        <Input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason"
          className="h-8 w-40 text-xs"
        />
        <Button
          size="sm"
          variant="destructive"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await revokeCertificate(certificateId, reason);
              if (!result.ok) setError(result.error);
              else setShowInput(false);
            })
          }
        >
          Confirm
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function ReissueCertificateButton({ certificateId }: { certificateId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await reissueCertificate(certificateId);
        })
      }
    >
      {pending ? "Reissuing…" : "Reissue"}
    </Button>
  );
}
