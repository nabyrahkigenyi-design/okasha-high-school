import Link from "next/link";
import { listMyChildren } from "../queries";

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="portal-badge">{children}</span>;
}

export default async function ParentChildrenPage() {
  const children = await listMyChildren();

  return (
    <div className="grid gap-6">
      <section className="portal-surface p-5">
        <h1 className="portal-title">My Children</h1>
        <p className="portal-subtitle">
          View each child’s profile summary and quickly open attendance, grades, or dashboard details.
        </p>
      </section>

      <section className="portal-surface p-5">
        {children.length === 0 ? (
          <div className="text-sm portal-muted">
            No linked students found. Ask the school administrator to link your account to your child.
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {children.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-slate-200 bg-white/70 p-4"
              >
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                    {c.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.photo_url}
                        alt={c.full_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                        No photo
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="truncate text-base font-semibold text-[color:var(--ohs-charcoal)]">
                        {c.full_name}
                      </div>

                      {c.status ? <Pill>{c.status}</Pill> : null}
                      {c.school_level ? <Pill>{c.school_level}</Pill> : null}
                    </div>

                    <div className="mt-1 text-sm text-slate-600">
                      {c.student_no ? `Student ID: ${c.student_no}` : "Student ID not assigned"}
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      {c.class_level ? `Level: ${c.class_level}` : "Level not set"}
                      {c.stream ? ` • Stream ${c.stream}` : ""}
                      {c.track ? ` • Track: ${c.track}` : ""}
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      {c.relation ? `Relation: ${c.relation}` : ""}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link className="portal-btn" href={`/portal/parent/dashboard?studentId=${c.id}`}>
                    Dashboard
                  </Link>
                  <Link className="portal-btn" href={`/portal/parent/attendance?studentId=${c.id}`}>
                    Attendance
                  </Link>
                  <Link className="portal-btn" href={`/portal/parent/grades?studentId=${c.id}`}>
                    Grades
                  </Link>
                  <Link className="portal-btn" href={`/portal/parent/finance?studentId=${c.id}`}>
                    School Fees
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}