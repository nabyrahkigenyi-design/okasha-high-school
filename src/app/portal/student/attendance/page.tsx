import { supabaseAdmin } from "@/lib/supabase/admin";
import { getActiveTermOrNull, getMyEnrollmentOrNull, getStudentOrThrow, one } from "../queries";

type Status = "present" | "absent" | "late" | "excused";

function Badge({ text }: { text: string }) {
  return <span className="portal-badge">{text}</span>;
}

export default async function StudentAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ termId?: string }>;
}) {
  const params = await searchParams;
  const student = await getStudentOrThrow();

  const sb = supabaseAdmin();

  const { data: terms, error: termErr } = await sb
    .from("academic_terms")
    .select("id, name, is_active")
    .order("id", { ascending: false })
    .limit(50);

  if (termErr) throw new Error(termErr.message);

  const activeTerm = await getActiveTermOrNull();
  const selectedTermId = params.termId ? Number(params.termId) : activeTerm?.id ?? terms?.[0]?.id ?? null;

  if (!selectedTermId) {
    return (
      <div className="portal-surface p-5">
        <h1 className="portal-title">Attendance</h1>
        <p className="portal-subtitle">No academic terms found yet.</p>
      </div>
    );
  }

  const enrollment = await getMyEnrollmentOrNull(selectedTermId);
  const cg: any = one(enrollment?.class_groups);

  // If not enrolled, show message
  if (!enrollment?.class_id) {
    return (
      <div className="grid gap-6">
        <section className="portal-surface p-5">
          <h1 className="portal-title">Attendance</h1>
          <p className="portal-subtitle">View your attendance history for the selected term.</p>

          <form method="get" className="mt-4 grid gap-2 max-w-md">
            <label className="grid gap-1">
              <span className="text-sm">Term</span>
              <select className="portal-select" name="termId" defaultValue={String(selectedTermId)}>
                {(terms ?? []).map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {t.name} {t.is_active ? "(active)" : ""}
                  </option>
                ))}
              </select>
            </label>

            <button className="portal-btn portal-btn-primary w-fit" type="submit">
              Apply
            </button>
          </form>
        </section>

        <section className="portal-surface p-5 text-sm portal-muted">
          You are not enrolled in a class for this term.
        </section>
      </div>
    );
  }

  // 1) teacher assignments for this term/class
  const { data: tas, error: taErr } = await sb
    .from("teacher_assignments")
    .select("id")
    .eq("term_id", selectedTermId)
    .eq("class_id", enrollment.class_id);

  if (taErr) throw new Error(taErr.message);

  const assignmentIds = (tas ?? []).map((x: any) => x.id);

  // 2) sessions for those assignments
  const { data: sessions, error: sessErr } = assignmentIds.length
    ? await sb
        .from("attendance_sessions")
        .select("id, session_date, assignment_id, finalized_at")
        .in("assignment_id", assignmentIds)
        .order("session_date", { ascending: false })
        .limit(200)
    : { data: [], error: null as any };

  if (sessErr) throw new Error(sessErr.message);

  const sessionIds = (sessions ?? []).map((s: any) => s.id);
  const dateBySession = new Map<number, string>();
  (sessions ?? []).forEach((s: any) => dateBySession.set(s.id, s.session_date));

  // 3) marks for this student
  const { data: marks, error: marksErr } = sessionIds.length
    ? await sb
        .from("attendance_marks")
        .select("session_id, status")
        .eq("student_id", student.id)
        .in("session_id", sessionIds)
    : { data: [], error: null as any };

  if (marksErr) throw new Error(marksErr.message);

  const rows = (marks ?? [])
    .map((m: any) => ({
      date: dateBySession.get(m.session_id) ?? "",
      status: m.status as Status,
    }))
    .filter((r) => r.date);

  rows.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  const total = rows.length;
  const present = rows.filter((r) => r.status === "present").length;
  const absent = rows.filter((r) => r.status === "absent").length;
  const late = rows.filter((r) => r.status === "late").length;
  const excused = rows.filter((r) => r.status === "excused").length;

  const rate = total > 0 ? Math.round((present / total) * 100) : 0;

  return (
    <div className="grid gap-6">
      <section className="portal-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="portal-title">Attendance</h1>
            <p className="portal-subtitle">
              Term: <span className="font-medium">{terms?.find((t: any) => t.id === selectedTermId)?.name ?? selectedTermId}</span>
              {" • "}
              Class: <span className="font-medium">{cg?.name ?? enrollment.class_id}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <a className="portal-btn" href={`/portal/student/attendance/export?termId=${selectedTermId}`}>
              Download CSV
            </a>
          </div>
        </div>

        <form method="get" className="mt-4 grid gap-2 max-w-md">
          <label className="grid gap-1">
            <span className="text-sm">Term</span>
            <select className="portal-select" name="termId" defaultValue={String(selectedTermId)}>
              {(terms ?? []).map((t: any) => (
                <option key={t.id} value={t.id}>
                  {t.name} {t.is_active ? "(active)" : ""}
                </option>
              ))}
            </select>
          </label>

          <button className="portal-btn portal-btn-primary w-fit" type="submit">
            Apply
          </button>
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
        <p className="mt-1 text-sm portal-muted">Your attendance marks recorded by teachers.</p>

        {rows.length === 0 ? (
          <div className="mt-4 text-sm portal-muted">No attendance marks yet.</div>
        ) : (
          <div className="mt-4 grid gap-2">
            {rows.slice(0, 120).map((r, idx) => (
              <div
                key={idx}
                className="rounded-xl border bg-white/70 p-3 flex flex-wrap items-center justify-between gap-2"
              >
                <div className="text-sm font-medium text-[color:var(--ohs-charcoal)]">{r.date}</div>
                <Badge text={r.status} />
              </div>
            ))}
          </div>
        )}

        {rows.length > 120 ? (
          <div className="mt-4 text-xs portal-muted">
            Showing latest 120 records. Use “Download CSV” for full export.
          </div>
        ) : null}
      </section>
    </div>
  );
}