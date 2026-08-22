import { Shield } from "lucide-react";

import { requireInstructor } from "@/lib/permissions";
import { isEligibleToCreateEvents } from "@/lib/instructors/eligibility";
import { updateOwnInstructorPhoto } from "@/lib/instructors/profile-actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AvatarUploadForm } from "@/components/shared/avatar-upload-form";
import { ChangePasswordForm } from "@/components/shared/change-password-form";

import { InstructorProfileForm } from "./profile-form";

export default async function InstructorProfilePage() {
  const { user, instructor } = await requireInstructor();
  const eligible = isEligibleToCreateEvents(user, instructor);
  const initials = instructor.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Instructor Profile"
        description="This is your public profile, shown on your Events and instructor page."
      />

      <AvatarUploadForm
        action={updateOwnInstructorPhoto}
        currentImage={instructor.avatarUrl}
        fallbackText={initials}
      />

      <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
        <p>
          Login email: <span className="font-medium text-slate-900">{user.email}</span> (contact an admin to
          change it)
        </p>
        <p>
          Event eligibility:{" "}
          <span className={eligible ? "font-medium text-emerald-600" : "font-medium text-amber-600"}>
            {eligible ? "Verified — you can create Events" : `${instructor.verificationStatus} — complete your profile and ask an admin to verify you`}
          </span>
        </p>
      </div>

      <InstructorProfileForm
        defaultValues={{
          name: instructor.name,
          title: instructor.title,
          bio: instructor.bio,
          company: instructor.company,
          phone: instructor.phone,
          website: instructor.website,
          twitterUrl: instructor.twitterUrl,
          linkedinUrl: instructor.linkedinUrl,
          githubUrl: instructor.githubUrl,
        }}
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-emerald-600">
          <Shield size={16} /> Security
        </h3>
        <div className="flex flex-col gap-4">
          <ChangePasswordForm />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-600">Two-Factor Auth</span>
            <span className="text-sm text-slate-500">Not enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
}
