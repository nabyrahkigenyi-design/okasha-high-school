import Link from "next/link";
import { getTeacherAssignments } from "../queries";

type Rel<T> = T | T[] | null | undefined;

function one<T>(v: Rel<T>): T | null {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

function TrackBadge({ track }: { track?: string | null }) {
  const islamic = track === "islamic";

  return (
    <span className={`portal-badge ${islamic ? "portal-badge-islamic" : "portal-badge-secular"}`}>
      {islamic ? "Islamic Theology" : "Secular"}
    </span>
  );
}

export default async function TeacherClassesPage() {
  const assignments = await getTeacherAssignments();

  return (
    <div className="grid gap-6">
      <section className="portal-surface p-4 sm:p-5">
        <h1 className="portal-title">My Classes</h1>
        <p className="portal-subtitle">
          Select a class and subject to manage attendance, assignments, or grading.
        </p>
      </section>

      <section className="portal-surface p-4 sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Teaching assignments</h2>
          <span className="portal-badge">{assignments.length} total</span>
        </div>

        {assignments.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white/60 p-4 text-sm text-slate-600">
            No assignments yet. Ask admin to assign you to a class and subject.
          </div>
        ) : (
          <div className="mt-4 grid gap-3">
            {assignments.map((a: any) => {
              const cg = one(a.class_groups) as any;
              const subj = one(a.subjects) as any;

              return (
                <div
                  key={a.id}
                  className="rounded-2xl border border-slate-200 bg-white/80 p-4"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-base font-semibold text-slate-900">
                          {cg?.name ?? "Class"} • {subj?.name ?? "Subject"}
                        </div>
                        <TrackBadge track={subj?.track} />
                      </div>
                      <div className="mt-1 text-sm text-slate-600">
                        {cg?.level ?? ""}
                        {subj?.code ? ` • ${subj.code}` : ""}
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
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}