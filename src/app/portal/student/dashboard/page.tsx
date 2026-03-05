import { requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getActiveTermOrNull, getMyEnrollmentOrNull, getStudentOrThrow, one } from "../queries";

type Status = "present" | "absent" | "late" | "excused";

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border bg-white/70 p-4">
      <div className="text-xs font-semibold tracking-widest text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-bold text-[color:var(--ohs-charcoal)]">{value}</div>
    </div>
  );
}

export default async function StudentDashboard() {
  const me: any = await requireRole(["student"]);
  const student = await getStudentOrThrow();
  const term = await getActiveTermOrNull();

  const sb = supabaseAdmin();

  let className = "Not enrolled";
  let classId: number | null = null;

  if (term?.id) {
    const enrollment = await getMyEnrollmentOrNull(term.id);
    const cg: any = one(enrollment?.class_groups);
    className = cg?.name ?? "Not enrolled";
    classId = enrollment?.class_id ?? null;
  }

  // New attendance system: sessions (by teacher_assignments) + marks (by student_id)
  let recent: { date: string; status: Status }[] = [];
  let total = 0,
    present = 0,
    absent = 0,
    late = 0,
    excused = 0;

  if (term?.id && classId) {
    // Get teacher assignments for this term/class
    const { data: tas, error: taErr } = await sb
      .from("teacher_assignments")
      .select("id")
      .eq("term_id", term.id)
      .eq("class_id", classId);

    if (taErr) throw new Error(taErr.message);

    const assignmentIds = (tas ?? []).map((x: any) => x.id);

    if (assignmentIds.length > 0) {
      const { data: sessions, error: sessErr } = await sb
        .from("attendance_sessions")
        .select("id, session_date, assignment_id")
        .in("assignment_id", assignmentIds)
        .order("session_date", { ascending: false })
        .limit(60);

      if (sessErr) throw new Error(sessErr.message);

      const sessionIds = (sessions ?? []).map((s: any) => s.id);
      const dateBySession = new Map<number, string>();
      (sessions ?? []).forEach((s: any) => dateBySession.set(s.id, s.session_date));

      if (sessionIds.length > 0) {
        const { data: marks, error: marksErr } = await sb
          .from("attendance_marks")
          .select("session_id, status")
          .eq("student_id", student.id)
          .in("session_id", sessionIds);

        if (marksErr) throw new Error(marksErr.message);

        const rows = (marks ?? [])
          .map((m: any) => ({
            date: dateBySession.get(m.session_id) ?? "",
            status: m.status as Status,
          }))
          .filter((r) => r.date);

        rows.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

        total = rows.length;
        present = rows.filter((r) => r.status === "present").length;
        absent = rows.filter((r) => r.status === "absent").length;
        late = rows.filter((r) => r.status === "late").length;
        excused = rows.filter((r) => r.status === "excused").length;

        recent = rows.slice(0, 7);
      }
    }
  }

  const rate = total > 0 ? Math.round((present / total) * 100) : 0;

  return (
    <div className="grid gap-6">
      <section className="portal-surface p-5">
        <h1 className="portal-title">Dashboard</h1>
        <p className="portal-subtitle">
          Welcome, {me.full_name}. {term ? `Active term: ${term.name}.` : "No active term set yet."}
        </p>

        <div className="mt-4 rounded-xl border bg-white/70 p-4">
          <div className="text-xs font-semibold tracking-widest text-slate-500">CURRENT CLASS</div>
          <div className="mt-2 text-lg font-semibold text-[color:var(--ohs-charcoal)]">{className}</div>
          <div className="mt-1 text-sm text-slate-600">
            Admission: {student.admission_no ?? "—"} • Track: {student.track ?? "—"} • Level: {student.class_level ?? "—"}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Attendance rate" value={`${rate}%`} />
        <Stat label="Present" value={present} />
        <Stat label="Absent" value={absent} />
        <Stat label="Total marks" value={total} />
      </section>

      <section className="portal-surface p-5">
        <h2 className="text-lg font-semibold">Recent attendance</h2>
        <p className="mt-1 text-sm portal-muted">Latest attendance marks recorded by teachers.</p>

        {recent.length === 0 ? (
          <div className="mt-4 text-sm portal-muted">No attendance marks yet.</div>
        ) : (
          <div className="mt-4 grid gap-2">
            {recent.map((r, idx) => (
              <div key={idx} className="rounded-xl border bg-white/70 p-3 flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-medium text-[color:var(--ohs-charcoal)]">{r.date}</div>
                <span className="portal-badge">{r.status}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}