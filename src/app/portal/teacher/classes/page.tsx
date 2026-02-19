import Link from "next/link";
import { listMyAssignments } from "./queries";

export default async function TeacherClassesPage() {
  const assignments = await listMyAssignments();

  return (
    <div className="rounded-2xl border bg-white p-5">
      <h1 className="text-xl font-semibold">My classes</h1>
      <p className="mt-1 text-sm text-slate-600">
        Select a class/subject to mark attendance.
      </p>

      <div className="mt-4 divide-y">
        {assignments.map((a: any) => (
          <Link
            key={a.id}
            href={`/portal/teacher/attendance?assignmentId=${a.id}`}
            className="block py-3 px-2 rounded-lg hover:bg-[color:var(--ohs-surface)]"
          >
            <div className="font-medium text-[color:var(--ohs-charcoal)]">
              {a.class_groups.name} • {a.subjects.name}
            </div>
            <div className="text-xs text-slate-500">
              {a.class_groups.level} • {a.subjects.track_key}
            </div>
          </Link>
        ))}
        {assignments.length === 0 ? (
          <div className="py-6 text-sm text-slate-600">
            No assignments yet. Ask admin to assign you to a class and subject.
          </div>
        ) : null}
      </div>
    </div>
  );
}
