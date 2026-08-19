import { notFound } from "next/navigation";

import { TabBar } from "@/components/admin/tab-bar";
import { getStudentProfile } from "@/lib/admin/student-detail";

import { ProfileTab } from "./tabs/profile-tab";
import { RegistrationsTab } from "./tabs/registrations-tab";
import { UpcomingSessionsTab } from "./tabs/upcoming-sessions-tab";
import { PaymentsTab } from "./tabs/payments-tab";
import { AttendanceTab } from "./tabs/attendance-tab";
import { CertificatesTab } from "./tabs/certificates-tab";
import { ActivityTab } from "./tabs/activity-tab";

import {
  User,
  ClipboardList,
  Clock,
  CreditCard,
  CheckSquare,
  Award,
  Activity,
} from "lucide-react";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "registrations", label: "Registrations", icon: ClipboardList },
  { id: "sessions", label: "Upcoming Sessions", icon: Clock },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "attendance", label: "Attendance", icon: CheckSquare },
  { id: "certificates", label: "Certificates", icon: Award },
  { id: "activity", label: "Activity", icon: Activity },
];

export default async function AdminStudentDetailPage(
  props: PageProps<"/admin/students/[studentId]">,
) {
  const { studentId } = await props.params;
  const searchParams = await props.searchParams;
  const tab = typeof searchParams.tab === "string" ? searchParams.tab : "profile";

  const student = await getStudentProfile(studentId);
  if (!student) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{student.name ?? student.email}</h1>
        <p className="text-sm text-slate-400">{student.email}</p>
      </div>

      <TabBar tabs={TABS} active={tab} baseHref={`/admin/students/${studentId}`} />

      {tab === "profile" && <ProfileTab student={student} />}
      {tab === "registrations" && <RegistrationsTab userId={studentId} />}
      {tab === "sessions" && <UpcomingSessionsTab userId={studentId} />}
      {tab === "payments" && <PaymentsTab userId={studentId} />}
      {tab === "attendance" && <AttendanceTab userId={studentId} />}
      {tab === "certificates" && <CertificatesTab userId={studentId} />}
      {tab === "activity" && <ActivityTab userId={studentId} />}
    </div>
  );
}
