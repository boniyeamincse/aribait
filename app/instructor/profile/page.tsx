import { requireInstructor } from "@/lib/permissions";
import { isEligibleToCreateEvents } from "@/lib/instructors/eligibility";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

import { InstructorProfileForm } from "./profile-form";

export default async function InstructorProfilePage() {
  const { user, instructor } = await requireInstructor();
  const eligible = isEligibleToCreateEvents(user, instructor);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Instructor Profile"
        description="This is your public profile, shown on your Events and instructor page."
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
          avatarUrl: instructor.avatarUrl,
          company: instructor.company,
          phone: instructor.phone,
          website: instructor.website,
          twitterUrl: instructor.twitterUrl,
          linkedinUrl: instructor.linkedinUrl,
          githubUrl: instructor.githubUrl,
        }}
      />
    </div>
  );
}
