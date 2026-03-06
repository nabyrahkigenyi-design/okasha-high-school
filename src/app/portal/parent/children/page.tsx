import Link from "next/link";
import { listMyChildren } from "../queries";

export default async function ParentChildrenPage() {
  const children = await listMyChildren();

  return (
    <div className="grid gap-6">
      <section className="portal-surface p-5">
        <h1 className="portal-title">Children</h1>
        <p className="portal-subtitle">Select a child to view attendance and grades.</p>
      </section>

      <section className="portal-surface p-5">
        {children.length === 0 ? (
          <div className="text-sm portal-muted">
            No linked students found. Ask admin to link your account to your child.
          </div>
        ) : (
          <div className="grid gap-3">
            {children.map((c) => (
              <div key={c.id} className="rounded-2xl border bg-white/70 p-4 flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate text-[color:var(--ohs-charcoal)]">{c.full_name}</div>
                  <div className="text-xs text-slate-500">
                    {c.admission_no ? `Adm: ${c.admission_no}` : ""}{" "}
                    {c.class_level ? `• Level: ${c.class_level}` : ""}{" "}
                    {c.track ? `• Track: ${c.track}` : ""}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link className="portal-btn" href={`/portal/parent/attendance?studentId=${c.id}`}>
                    Attendance
                  </Link>
                  <Link className="portal-btn" href={`/portal/parent/grades?studentId=${c.id}`}>
                    Grades
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