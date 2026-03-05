import { redirect } from "next/navigation";

export default async function LegacyAttendanceRedirect({
  params,
}: {
  params: { assignmentId: string };
}) {
  redirect(`/portal/teacher/attendance?assignmentId=${encodeURIComponent(params.assignmentId)}`);
}