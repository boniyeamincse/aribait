"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Pencil } from "lucide-react";

import { updateSessionMeeting } from "@/lib/admin/session-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function EditMeetingModal({
  sessionId,
  currentUrl,
  currentId,
  currentPasscode,
}: {
  sessionId: string;
  currentUrl?: string | null;
  currentId?: string | null;
  currentPasscode?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateSessionMeeting(sessionId, formData);
      if (result.ok) {
        toast.success("Meeting details updated successfully.");
        setOpen(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 transition-colors hover:bg-slate-50 hover:text-indigo-600"
        title="Edit Meeting Link"
      >
        <Pencil size={14} />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Meeting Details</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="meetingUrl">Meeting URL (Join Link)</Label>
            <Input
              id="meetingUrl"
              name="meetingUrl"
              type="url"
              defaultValue={currentUrl ?? ""}
              placeholder="https://zoom.us/j/..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="meetingId">Meeting ID</Label>
              <Input
                id="meetingId"
                name="meetingId"
                defaultValue={currentId ?? ""}
                placeholder="e.g. 123 456 7890"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="meetingPasscode">Passcode</Label>
              <Input
                id="meetingPasscode"
                name="meetingPasscode"
                defaultValue={currentPasscode ?? ""}
                placeholder="e.g. 123456"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save details"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
