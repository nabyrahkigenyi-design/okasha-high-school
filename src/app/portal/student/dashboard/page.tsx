import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getActiveTermOrNull, getMyEnrollmentOrNull, getStudentOrThrow, one } from "@/app/portal/student/queries";

type Status = "present" | "absent" | "late" | "excused";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border bg-white/70 p-4">
      <div className="text-xs font-semibold tracking-widest text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-bold text-[color:var(--ohs-charcoal)]">{value}</div>
    </div>
  );
}

function todayDayKey() {
  const d = new Date().getDay();
  switch (d) {
    case 1:
      return "mon";
    case 2:
      return "tue";
    case 3:
      return "wed";
    case 4:
      return "thu";
    case 5:
      return "fri";
    case 6:
      return "sat";
    default:
      return "sun";
  }
}

function fmtTime(t: string | null) {
  if (!t) return "";
  return String(t).slice(0, 5);
}

export default async function StudentDashboard() {
  const student = await getStudentOrThrow();
  const sb = supabaseAdmin();

  const activeTerm = await getActiveTermOrNull();
  const enrollment = activeTerm ? await getMyEnrollmentOrNull(activeTerm.id) : null;
  const cg: any = one(enrollment?.class_groups);
  const classId = enrollment?.class_id ?? null;

  // Attendance summary from new attendance system
  let total = 0;
  let present = 0;
  let absent = 0;
  let late = 0;
  let excused = 0;
  let recentAttendance: { date: string; status: Status }[] = [];

  if (activeTerm?.id && classId) {
    const { data: tas } = await sb
      .from("teacher_assignments")
      .select("id")
      .eq("term_id", activeTerm.id)
      .eq("class_id", classId);

    const assignmentIds = (tas ?? []).map((x: any) => x.id);

    if (assignmentIds.length > 0) {
      const { data: sessions } = await sb
        .from("attendance_sessions")
        .select("id, session_date")
        .in("assignment_id", assignmentIds)
        .order("session_date", { ascending: false })
        .limit(100);

      const dateBySession = new Map<number, string>();
      (sessions ?? []).forEach((s: any) => dateBySession.set(s.id, s.session_date));
      const sessionIds = (sessions ?? []).map((s: any) => s.id);

      if (sessionIds.length > 0) {
        const { data: marks } = await sb
          .from("attendance_marks")
          .select("session_id, status")
          .eq("student_id", student.id)
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

  const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;

  // Today's timetable
  const today = todayDayKey();
  const { data: lessons } =
    activeTerm?.id && classId
      ? await sb
          .from("timetables")
          .select(`
            id,
            period_no,
            start_time,
            end_time,
            room,
            subjects:subject_id ( id, name, code ),
            teachers:teacher_id ( id, full_name )
          `)
          .eq("term_id", activeTerm.id)
          .eq("class_id", classId)
          .eq("day_of_week", today)
          .order("period_no", { ascending: true })
      : { data: [] as any[] };

  // Latest announcements
  const { data: announcements } =
    activeTerm?.id
      ? await sb
          .from("announcements")
          .select("id, title, body, class_id, created_at")
          .eq("term_id", activeTerm.id)
          .order("created_at", { ascending: false })
          .limit(6)
      : { data: [] as any[] };

  const visibleAnnouncements = (announcements ?? []).filter(
    (a: any) => a.class_id == null || a.class_id === classId
  );

  return (
    <div className="grid gap-6">
      <section className="portal-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="portal-title">Student Dashboard</h1>
            <p className="portal-subtitle">
              Welcome, <span className="font-medium">{student.full_name}</span>
              {activeTerm ? <> • Active term: <span className="font-medium">{activeTerm.name}</span></> : null}
              {classId ? <> • Class: <span className="font-medium">{cg?.name ?? classId}</span></> : null}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link className="portal-btn" href="/portal/student/timetable">Timetable</Link>
            <Link className="portal-btn" href="/portal/student/assignments">Assignments</Link>
            <Link className="portal-btn" href="/portal/student/grades">Grades</Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Attendance rate" value={`${attendanceRate}%`} />
        <StatCard label="Present" value={present} />
        <StatCard label="Absent" value={absent} />
        <StatCard label="Total marks" value={total} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="portal-surface p-5">
          <h2 className="text-lg font-semibold">Recent Attendance</h2>
          <p className="mt-1 text-sm portal-muted">Latest attendance marks recorded by teachers.</p>

          {recentAttendance.length === 0 ? (
            <div className="mt-4 text-sm portal-muted">No attendance records yet.</div>
          ) : (
            <div className="mt-4 grid gap-2">
              {recentAttendance.map((a, i) => (
                <div key={i} className="rounded-xl border bg-white/70 p-3 flex items-center justify-between gap-2">
                  <div className="text-sm font-medium">{a.date}</div>
                  <span className="portal-badge">{a.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="portal-surface p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Today’s Timetable</h2>
              <p className="mt-1 text-sm portal-muted">Your lessons for today.</p>
            </div>
            <Link className="portal-btn" href={`/portal/student/timetable?day=${today}`}>
              Full timetable
            </Link>
          </div>

          {(lessons ?? []).length === 0 ? (
            <div className="mt-4 text-sm portal-muted">No lessons scheduled for today.</div>
          ) : (
            <div className="mt-4 grid gap-2">
              {(lessons ?? []).slice(0, 5).map((x: any) => {
                const subj = one(x.subjects) as any;
                const teacher = one(x.teachers) as any;
                return (
                  <div key={x.id} className="rounded-xl border bg-white/70 p-3">
                    <div className="text-sm font-semibold">
                      Period {x.period_no ?? "—"} • {subj?.name ?? "Subject"}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {fmtTime(x.start_time)}–{fmtTime(x.end_time)}
                      {teacher?.full_name ? ` • ${teacher.full_name}` : ""}
                      {x.room ? ` • Room: ${x.room}` : ""}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="portal-surface p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Announcements</h2>
            <p className="mt-1 text-sm portal-muted">Latest school and class announcements.</p>
          </div>
          <Link className="portal-btn" href="/portal/student/announcements">
            View all
          </Link>
        </div>

        {visibleAnnouncements.length === 0 ? (
          <div className="mt-4 text-sm portal-muted">No announcements yet.</div>
        ) : (
          <div className="mt-4 grid gap-3">
            {visibleAnnouncements.slice(0, 4).map((a: any) => (
              <div key={a.id} className="rounded-xl border bg-white/70 p-4">
                <div className="text-sm font-semibold">{a.title}</div>
                <div className="mt-1 text-xs text-slate-500">
                  {a.class_id ? "Class" : "School-wide"} •{" "}
                  {a.created_at ? new Date(a.created_at).toLocaleString() : ""}
                </div>
                <div className="mt-2 text-sm text-slate-700 line-clamp-3 whitespace-pre-wrap">
                  {a.body}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}