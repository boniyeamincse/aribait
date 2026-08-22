"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

import { InstructorForm } from "./instructor-form";

export function AddInstructorDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
            <Plus className="h-4 w-4" /> Add New Instructor
          </Button>
        }
      />
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto sm:rounded-2xl p-0 border-0 shadow-2xl">
        <div className="px-6 py-5 border-b border-slate-100 bg-white sticky top-0 z-10">
          <DialogHeader>
            <DialogTitle className="text-xl">Create Instructor Profile</DialogTitle>
            <DialogDescription>
              This will create a new instructor login account and their public-facing directory profile simultaneously.
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="p-6 pt-2">
          <InstructorForm onSuccess={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
