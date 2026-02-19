import { requireRole } from "@/lib/auth/require-role";
import Link from "next/link";

export default async function TeacherAssignmentsPage() {
  await requireRole(["teacher"]);

  return (
    <div className="rounded-2xl border bg-white p-6">
      <div className="text-xs font-semibold tracking-widest text-slate-500">
        ASSIGNMENTS
      </div>
      <h1 className="mt-2 text-xl font-bold text-[color:var(--ohs-charcoal)]">
        Manage Assignments
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Placeholder page. This will allow you to create assignments, attach files,
        and review submissions.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/portal/teacher/classes"
          className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold hover:bg-[color:var(--ohs-surface)]"
        >
          View My Classes
        </Link>
        <Link
          href="/portal/teacher/attendance"
          className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold hover:bg-[color:var(--ohs-surface)]"
        >
          Mark Attendance
        </Link>
      </div>
    </div>
  );
}
