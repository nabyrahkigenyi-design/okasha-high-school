import { supabaseAdmin } from "@/lib/supabase/admin";
import { getActiveTermOrNull, getEnrollmentOrNull, getParentOrThrow, listMyChildren, one } from "@/app/portal/parent/queries";

type Status = "present" | "absent" | "late" | "excused";

function Badge({ text }: { text: string }) {
  return <span className="portal-badge">{text}</span>;
}

export default async function ParentAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ studentId?: string; termId?: string }>;
}) {
  const params = await searchParams;
  const sb = supabaseAdmin();

  const parent = await getParentOrThrow();
  const children = await listMyChildren();

  const studentId = params.studentId ?? (children[0]?.id ?? "");
  const student = children.find((c) => c.id === studentId) ?? null;

  const { data: terms, error: termErr } = await sb
    .from("academic_terms")
    .select("id, name, is_active")
    .order("id", { ascending: false })
    .limit(50);

  if (termErr) throw new Error(termErr.message);

  const activeTerm = await getActiveTermOrNull();
  const termId = params.termId ? Number(params.termId) : activeTerm?.id ?? terms?.[0]?.id ?? null;

  if (!studentId || !student) {
    return (
      <div className="grid gap-6">
        <section className="portal-surface p-5">
          <h1 className="portal-title">Attendance</h1>
          <p className="portal-subtitle">No linked students found.</p>
        </section>
        <section className="portal-surface p-5 text-sm portal-muted">
          Ask admin to link your parent account to your child (parent_students).
        </section>
      </div>
    );
  }

  if (!termId) {
    return (
      <div className="portal-surface p-5">
        <h1 className="portal-title">Attendance</h1>
        <p className="portal-subtitle">No academic terms found.</p>
      </div>
    );
  }

  // Enrollment for this student in this term
  const enrollment = await getEnrollmentOrNull(termId, studentId);
  const cg: any = one(enrollment?.class_groups);
  const classId = enrollment?.class_id ?? null;

  // Get attendance marks using new system:
  let rows: { date: string; status: Status }[] = [];

  if (classId) {
    const { data: tas, error: taErr } = await sb
      .from("teacher_assignments")
      .select("id")
      .eq("term_id", termId)
      .eq("class_id", classId);

    if (taErr) throw new Error(taErr.message);

    const assignmentIds = (tas ?? []).map((x: any) => x.id);

    if (assignmentIds.length > 0) {
      const { data: sessions, error: sessErr } = await sb
        .from("attendance_sessions")
        .select("id, session_date, assignment_id")
        .in("assignment_id", assignmentIds)
        .order("session_date", { ascending: false })
        .limit(300);

      if (sessErr) throw new Error(sessErr.message);

      const dateBySession = new Map<number, string>();
      (sessions ?? []).forEach((s: any) => dateBySession.set(s.id, s.session_date));

      const sessionIds = (sessions ?? []).map((s: any) => s.id);

      if (sessionIds.length > 0) {
        const { data: marks, error: marksErr } = await sb
          .from("attendance_marks")
          .select("session_id, status")
          .eq("student_id", studentId)
          .in("session_id", sessionIds);

        if (marksErr) throw new Error(marksErr.message);

        rows = (marks ?? [])
          .map((m: any) => ({
            date: dateBySession.get(m.session_id) ?? "",
            status: m.status as Status,
          }))
          .filter((r) => r.date);

        rows.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
      }
    }
  }

  const total = rows.length;
  const present = rows.filter((r) => r.status === "present").length;
  const absent = rows.filter((r) => r.status === "absent").length;
  const late = rows.filter((r) => r.status === "late").length;
  const excused = rows.filter((r) => r.status === "excused").length;
  const rate = total > 0 ? Math.round((present / total) * 100) : 0;

  const termName = terms?.find((t: any) => t.id === termId)?.name ?? `Term ${termId}`;

  return (
    <div className="grid gap-6">
      <section className="portal-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="portal-title">Attendance</h1>
            <p className="portal-subtitle">
              Child: <span className="font-medium">{student.full_name}</span> • Term:{" "}
              <span className="font-medium">{termName}</span>
              {classId ? (
                <>
                  {" • "}Class: <span className="font-medium">{cg?.name ?? classId}</span>
                </>
              ) : (
                <> • Not enrolled for this term</>
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <a className="portal-btn" href={`/portal/parent/attendance/export?studentId=${studentId}&termId=${termId}`}>
              Download CSV
            </a>
          </div>
        </div>

        <form method="get" className="mt-4 grid gap-3 md:grid-cols-[1fr_220px_auto]">
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

          <label className="grid gap-1">
            <span className="text-sm">Term</span>
            <select className="portal-select" name="termId" defaultValue={String(termId)}>
              {(terms ?? []).map((t: any) => (
                <option key={t.id} value={t.id}>
                  {t.name} {t.is_active ? "(active)" : ""}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-end">
            <button className="portal-btn portal-btn-primary" type="submit">
              Apply
            </button>
          </div>
        </form>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="portal-surface p-4">
          <div className="text-xs font-semibold tracking-widest portal-muted">RATE</div>
          <div className="mt-2 text-2xl font-bold">{rate}%</div>
        </div>
        <div className="portal-surface p-4">
          <div className="text-xs font-semibold tracking-widest portal-muted">PRESENT</div>
          <div className="mt-2 text-2xl font-bold">{present}</div>
        </div>
        <div className="portal-surface p-4">
          <div className="text-xs font-semibold tracking-widest portal-muted">ABSENT</div>
          <div className="mt-2 text-2xl font-bold">{absent}</div>
        </div>
        <div className="portal-surface p-4">
          <div className="text-xs font-semibold tracking-widest portal-muted">TOTAL</div>
          <div className="mt-2 text-2xl font-bold">{total}</div>
        </div>
      </section>

      <section className="portal-surface p-5">
        <h2 className="text-lg font-semibold">History</h2>
        <p className="mt-1 text-sm portal-muted">Attendance marks recorded by teachers.</p>

        {!classId ? (
          <div className="mt-4 text-sm portal-muted">No enrollment found for this term.</div>
        ) : rows.length === 0 ? (
          <div className="mt-4 text-sm portal-muted">No attendance marks yet.</div>
        ) : (
          <div className="mt-4 grid gap-2">
            {rows.slice(0, 200).map((r, idx) => (
              <div key={idx} className="rounded-xl border bg-white/70 p-3 flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-medium text-[color:var(--ohs-charcoal)]">{r.date}</div>
                <Badge text={r.status} />
              </div>
            ))}
          </div>
        )}

        {rows.length > 200 ? (
          <div className="mt-4 text-xs portal-muted">
            Showing latest 200 records. Use CSV export for full list.
          </div>
        ) : null}
      </section>
    </div>
  );
}