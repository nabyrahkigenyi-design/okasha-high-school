import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getActiveTermOrNull, getEnrollmentOrNull, listMyChildren, one } from "../queries";

type Status = "present" | "absent" | "late" | "excused";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border bg-white/70 p-4">
      <div className="text-xs font-semibold tracking-widest text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-bold text-[color:var(--ohs-charcoal)]">{value}</div>
    </div>
  );
}

export default async function ParentDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ studentId?: string }>;
}) {
  const params = await searchParams;
  const sb = supabaseAdmin();

  const children = await listMyChildren();
  const term = await getActiveTermOrNull();

  const studentId = params.studentId ?? (children[0]?.id ?? "");
  const child = children.find((c) => c.id === studentId) ?? null;

  if (children.length === 0) {
    return (
      <div className="grid gap-6">
        <section className="portal-surface p-5">
          <h1 className="portal-title">Dashboard</h1>
          <p className="portal-subtitle">No linked students found.</p>
        </section>
        <section className="portal-surface p-5 text-sm portal-muted">
          Ask admin to link your parent account to your child (parent_students).
        </section>
      </div>
    );
  }

  // Term context (we use active term for dashboard)
  const termId = term?.id ?? null;

  // Enrollment (class) for selected child in active term
  const enrollment = termId ? await getEnrollmentOrNull(termId, studentId) : null;
  const cg: any = one(enrollment?.class_groups);
  const classId = enrollment?.class_id ?? null;

  // Attendance summary (new system)
  let total = 0,
    present = 0,
    absent = 0,
    late = 0,
    excused = 0;

  let recentAttendance: { date: string; status: Status }[] = [];

  if (termId && classId) {
    const { data: tas } = await sb
      .from("teacher_assignments")
      .select("id")
      .eq("term_id", termId)
      .eq("class_id", classId);

    const assignmentIds = (tas ?? []).map((x: any) => x.id);

    if (assignmentIds.length > 0) {
      const { data: sessions } = await sb
        .from("attendance_sessions")
        .select("id, session_date")
        .in("assignment_id", assignmentIds)
        .order("session_date", { ascending: false })
        .limit(80);

      const dateBySession = new Map<number, string>();
      (sessions ?? []).forEach((s: any) => dateBySession.set(s.id, s.session_date));
      const sessionIds = (sessions ?? []).map((s: any) => s.id);

      if (sessionIds.length > 0) {
        const { data: marks } = await sb
          .from("attendance_marks")
          .select("session_id, status")
          .eq("student_id", studentId)
          .in("session_id", sessionIds);

        const rows = (marks ?? [])
          .map((m: any) => ({
            date: dateBySession.get(m.session_id) ?? "",
            status: m.status as Status,
          }))
          .filter((r) => r.date)
          .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

        total = rows.length;
        present = rows.filter((r) => r.status === "present").length;
        absent = rows.filter((r) => r.status === "absent").length;
        late = rows.filter((r) => r.status === "late").length;
        excused = rows.filter((r) => r.status === "excused").length;

        recentAttendance = rows.slice(0, 5);
      }
    }
  }

  const rate = total > 0 ? Math.round((present / total) * 100) : 0;

  // Grades summary (latest few)
  const { data: grades } = termId
    ? await sb
        .from("grades")
        .select("id, assessment, score, max_score, updated_at, subjects:subject_id ( name )")
        .eq("student_id", studentId)
        .eq("term_id", termId)
        .order("updated_at", { ascending: false })
        .limit(6)
    : { data: [] as any[] };

  const gradeCount = grades?.length ?? 0;

  return (
    <div className="grid gap-6">
      <section className="portal-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="portal-title">Dashboard</h1>
            <p className="portal-subtitle">
              {term ? `Active term: ${term.name}.` : "No active term set yet."}
            </p>
          </div>

          <form method="get" className="flex flex-wrap items-end gap-2">
            <label className="grid gap-1">
              <span className="text-sm">Child</span>
              <select className="portal-select" name="studentId" defaultValue={studentId}>
                {children.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name}
                  </option>
                ))}
              </select>
            </label>
            <button className="portal-btn portal-btn-primary" type="submit">
              View
            </button>
          </form>
        </div>

        {child ? (
          <div className="mt-4 rounded-xl border bg-white/70 p-4">
            <div className="font-medium text-[color:var(--ohs-charcoal)]">{child.full_name}</div>
            <div className="mt-1 text-xs text-slate-500">
              {child.admission_no ? `Adm: ${child.admission_no}` : ""}
              {child.class_level ? ` • Level: ${child.class_level}` : ""}
              {child.track ? ` • Track: ${child.track}` : ""}
              {classId ? ` • Class: ${cg?.name ?? classId}` : " • Not enrolled this term"}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <Link className="portal-btn" href={`/portal/parent/attendance?studentId=${studentId}`}>
                Attendance
              </Link>
              <Link className="portal-btn" href={`/portal/parent/grades?studentId=${studentId}`}>
                Grades
              </Link>
              <Link className="portal-btn" href="/portal/parent/children">
                Children list
              </Link>
            </div>
          </div>
        ) : null}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Attendance rate" value={`${rate}%`} />
        <StatCard label="Present" value={present} />
        <StatCard label="Absent" value={absent} />
        <StatCard label="Grades (recent)" value={gradeCount} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="portal-surface p-5">
          <h2 className="text-lg font-semibold">Recent attendance</h2>
          <p className="mt-1 text-sm portal-muted">Latest attendance marks.</p>

          {recentAttendance.length === 0 ? (
            <div className="mt-4 text-sm portal-muted">No attendance marks yet.</div>
          ) : (
            <div className="mt-4 grid gap-2">
              {recentAttendance.map((r, idx) => (
                <div key={idx} className="rounded-xl border bg-white/70 p-3 flex items-center justify-between gap-2">
                  <div className="text-sm font-medium">{r.date}</div>
                  <span className="portal-badge">{r.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="portal-surface p-5">
          <h2 className="text-lg font-semibold">Latest grades</h2>
          <p className="mt-1 text-sm portal-muted">Most recently updated grades.</p>

          {(grades ?? []).length === 0 ? (
            <div className="mt-4 text-sm portal-muted">No grades yet.</div>
          ) : (
            <div className="mt-4 grid gap-2">
              {(grades ?? []).map((g: any) => {
                const subjectName = (g.subjects as any)?.name ?? "Subject";
                return (
                  <div key={g.id} className="rounded-xl border bg-white/70 p-3">
                    <div className="text-sm font-semibold truncate">
                      {subjectName} • {g.assessment}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {g.updated_at ? new Date(g.updated_at).toLocaleString() : ""}
                    </div>
                    <div className="mt-2 flex gap-2">
                      <span className="portal-badge">
                        {g.score ?? "—"} / {g.max_score ?? "—"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}