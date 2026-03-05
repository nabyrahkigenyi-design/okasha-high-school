import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { getActiveTerm, getTeacherAssignments } from "../queries";

function StatCard({
  label,
  value,
  href,
}: {
  label: string;
  value: string | number;
  href?: string;
}) {
  const content = (
    <div className="portal-surface p-5">
      <div className="text-xs font-semibold tracking-widest portal-muted">{label}</div>
      <div className="mt-2 text-2xl font-bold text-[color:var(--ohs-charcoal)]">{value}</div>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

export default async function TeacherDashboardPage() {
  const me = await requireRole(["teacher"]);
  const activeTerm = await getActiveTerm();
  const assignments = await getTeacherAssignments();

  const uniqueClasses = new Set(assignments.map((a: any) => a.class_id)).size;

  return (
    <div className="grid gap-6">
      <section className="portal-surface p-5">
        <div className="text-xs font-semibold tracking-widest portal-muted">DASHBOARD</div>
        <h1 className="portal-title mt-2">Welcome, {me.full_name}</h1>
        <p className="portal-subtitle">
          {activeTerm ? `Active term: ${activeTerm.name}` : "No active term has been set by admin yet."}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Assigned subjects" value={assignments.length} href="/portal/teacher/classes" />
        <StatCard label="Classes" value={uniqueClasses} href="/portal/teacher/classes" />
        <StatCard label="Active term" value={activeTerm?.name ?? "None"} />
      </section>

      <section className="portal-surface p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">My teaching load</h2>
            <p className="text-sm portal-muted">Your class and subject assignments for the active term.</p>
          </div>
          <Link className="portal-btn" href="/portal/teacher/classes">
            Open My Classes
          </Link>
        </div>

        <div className="mt-4 divide-y rounded-xl border bg-white/70">
          {assignments.map((a: any) => (
            <div key={a.id} className="px-4 py-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-medium">
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
              No teaching assignments yet. Ask admin to assign you to a class and subject.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}