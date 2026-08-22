import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { prisma } from "@/lib/db/client";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

import { VerificationCell, AccountStatusCell } from "../status-cells";
import { InstructorAdminEditForm } from "./edit-form";

export default async function AdminInstructorDetailPage(
  props: PageProps<"/admin/instructors/[id]">,
) {
  const { id } = await props.params;

  const instructor = await prisma.instructor.findUnique({
    where: { id },
    include: {
      _count: { select: { events: true } },
      user: { select: { id: true, email: true, status: true } },
    },
  });
  if (!instructor) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/instructors"
        className="flex w-fit items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft size={14} /> Back to Instructors
      </Link>

      <AdminPageHeader
        title={instructor.name}
        description={instructor.title ?? undefined}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-1">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Login Account</p>
            {instructor.user ? (
              <p className="mt-1 text-sm text-slate-700">{instructor.user.email}</p>
            ) : (
              <p className="mt-1 text-sm text-slate-400 italic">No login account</p>
            )}
          </div>

          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-slate-500">Account Status</p>
            <AccountStatusCell userId={instructor.userId} status={instructor.user?.status ?? null} />
          </div>

          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-slate-500">Event Eligibility</p>
            <VerificationCell
              instructorId={instructor.id}
              verificationStatus={instructor.verificationStatus}
              hasLogin={!!instructor.user}
            />
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Events</p>
            <p className="mt-1 text-sm text-slate-700">
              {instructor._count.events} Event{instructor._count.events === 1 ? "" : "s"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Public Profile</p>
            <a
              href={`/instructors/${instructor.slug}`}
              target="_blank"
              rel="noreferrer"
              className="mt-1 block text-sm text-indigo-600 hover:underline"
            >
              /instructors/{instructor.slug}
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Edit Profile</h2>
          <InstructorAdminEditForm
            instructorId={instructor.id}
            defaultValues={{
              name: instructor.name,
              email: instructor.email,
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
        </div>
      </div>
    </div>
  );
}
