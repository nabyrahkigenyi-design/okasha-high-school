import Link from "next/link";
import { getTeacherAssignments } from "../queries";

export default async function TeacherClassesPage() {
  const assignments = await getTeacherAssignments();

  return (
    <div className="portal-surface p-5">
      <h1 className="portal-title">My Classes</h1>
      <p className="portal-subtitle">
        Select a class and subject to manage attendance, assignments, or grading.
      </p>

      <div className="mt-4 divide-y rounded-xl border bg-white/70">
        {assignments.map((a: any) => (
          <div key={a.id} className="px-4 py-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-medium text-[color:var(--ohs-charcoal)]">
                {a.class_groups?.name} • {a.subjects?.name}
              </div>
              <div className="text-xs text-slate-500">
                {a.class_groups?.level} • {a.subjects?.track === "islamic" ? "Islamic Theology" : "Secular"}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link className="portal-btn" href={`/portal/teacher/attendance?assignmentId=${a.id}`}>
                Attendance
              </Link>
              <Link className="portal-btn" href={`/portal/teacher/assignments?assignmentId=${a.id}`}>
                Assignments
              </Link>
              <Link className="portal-btn" href={`/portal/teacher/grading?assignmentId=${a.id}`}>
                Grading
              </Link>
            </div>
          </div>
        ))}

        {assignments.length === 0 ? (
          <div className="px-4 py-6 text-sm portal-muted">
            No assignments yet. Ask admin to assign you to a class and subject.
          </div>
        ) : null}
      </div>
    </div>
  );
}