import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  getActiveTermOrNull,
  getMyEnrollmentOrNull,
  getStudentOrThrow,
  one,
} from "@/app/portal/student/queries";

type Status = "present" | "absent" | "late" | "sick";

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border bg-white/70 p-4">
      <div className="text-xs font-semibold tracking-widest text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-bold text-[color:var(--ohs-charcoal)]">{value}</div>
      {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  children,
  right,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <section className="portal-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm portal-muted">{subtitle}</p> : null}
        </div>
        {right ? <div className="flex flex-wrap gap-2">{right}</div> : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
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

function money(n: number) {
  return n.toLocaleString();
}

export default async function StudentDashboard() {
  const student = await getStudentOrThrow();
  const sb = supabaseAdmin();

  const activeTerm = await getActiveTermOrNull();
  const enrollment = activeTerm ? await getMyEnrollmentOrNull(activeTerm.id) : null;
  const cg: any = one(enrollment?.class_groups);
  const classId = enrollment?.class_id ?? null;

  let total = 0;
  let present = 0;
  let absent = 0;
  let late = 0;
  let sick = 0;
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
            status: String(m.status ?? "").toLowerCase().trim() as Status,
          }))
          .filter((r) => r.date)
          .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

        total = rows.length;
        present = rows.filter((r) => r.status === "present").length;
        absent = rows.filter((r) => r.status === "absent").length;
        late = rows.filter((r) => r.status === "late").length;
        sick = rows.filter((r) => r.status === "sick").length;
        recentAttendance = rows.slice(0, 5);
      }
    }
  }

  const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;

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

  const { data: grades } =
    activeTerm?.id
      ? await sb
          .from("grades")
          .select("id, assessment, score, max_score, updated_at, subjects:subject_id ( name )")
          .eq("student_id", student.id)
          .eq("term_id", activeTerm.id)
          .order("updated_at", { ascending: false })
          .limit(6)
      : { data: [] as any[] };

  const gradeCount = grades?.length ?? 0;

  const scoredRows = (grades ?? []).filter(
    (g: any) => g.score != null && g.max_score != null && Number(g.max_score) > 0
  );

  const averageGrade =
    scoredRows.length > 0
      ? Math.round(
          scoredRows.reduce((sum: number, row: any) => {
            return sum + (Number(row.score) / Number(row.max_score)) * 100;
          }, 0) / scoredRows.length
        )
      : 0;

  const { data: expectedRow } =
    activeTerm?.id
      ? await sb
          .from("student_fee_expected_view")
          .select("student_id, term_id, expected_amount")
          .eq("student_id", student.id)
          .eq("term_id", activeTerm.id)
          .maybeSingle()
      : { data: null as any };

  const { data: payments } =
    activeTerm?.id
      ? await sb
          .from("student_fee_payments")
          .select("amount_paid")
          .eq("student_id", student.id)
          .eq("term_id", activeTerm.id)
      : { data: [] as any[] };

  const expectedAmount = Number(expectedRow?.expected_amount ?? 0);
  const totalPaid = (payments ?? []).reduce(
    (sum: number, row: any) => sum + Number(row.amount_paid ?? 0),
    0
  );
  const balanceDue = Math.max(expectedAmount - totalPaid, 0);
  const feeProgress = expectedAmount > 0 ? Math.round((totalPaid / expectedAmount) * 100) : 0;

  return (
    <div className="grid gap-6">
      <section className="portal-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="portal-title">Student Dashboard</h1>
            <p className="portal-subtitle">
              Welcome, <span className="font-medium">{student.full_name}</span>
              {activeTerm ? (
                <>
                  {" • "}Active term: <span className="font-medium">{activeTerm.name}</span>
                </>
              ) : null}
              {classId ? (
                <>
                  {" • "}Class: <span className="font-medium">{cg?.name ?? classId}</span>
                </>
              ) : null}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link className="portal-btn" href="/portal/student/timetable">
              Timetable
            </Link>
            <Link className="portal-btn" href="/portal/student/assignments">
              Assignments
            </Link>
            <Link className="portal-btn" href="/portal/student/grades">
              Grades
            </Link>
            <Link className="portal-btn" href="/portal/student/attendance">
              Attendance
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Attendance rate" value={`${attendanceRate}%`} />
        <StatCard label="Present" value={present} />
        <StatCard label="Absent" value={absent} />
        <StatCard label="Late / Sick" value={`${late} / ${sick}`} />
        <StatCard
          label="Grades average"
          value={scoredRows.length > 0 ? `${averageGrade}%` : "—"}
          hint={gradeCount > 0 ? `${gradeCount} recent records` : "No grades yet"}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard
          title="Recent attendance"
          subtitle="Latest attendance marks recorded by teachers."
          right={
            <Link className="portal-btn" href="/portal/student/attendance">
              View all
            </Link>
          }
        >
          {recentAttendance.length === 0 ? (
            <div className="text-sm portal-muted">No attendance records yet.</div>
          ) : (
            <div className="grid gap-2">
              {recentAttendance.map((a, i) => (
                <div
                  key={i}
                  className="rounded-xl border bg-white/70 p-3 flex items-center justify-between gap-2"
                >
                  <div className="text-sm font-medium">{a.date}</div>
                  <span className="portal-badge">{a.status}</span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Today’s timetable"
          subtitle="Your lessons for today."
          right={
            <Link className="portal-btn" href={`/portal/student/timetable?day=${today}`}>
              Full timetable
            </Link>
          }
        >
          {(lessons ?? []).length === 0 ? (
            <div className="text-sm portal-muted">No lessons scheduled for today.</div>
          ) : (
            <div className="grid gap-2">
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
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard
          title="Recent grades"
          subtitle="Latest marked assessments."
          right={
            <Link className="portal-btn" href="/portal/student/grades">
              View all
            </Link>
          }
        >
          {(grades ?? []).length === 0 ? (
            <div className="text-sm portal-muted">No grades yet.</div>
          ) : (
            <div className="grid gap-2">
              {(grades ?? []).map((g: any) => {
                const subjectName = (g.subjects as any)?.name ?? "Subject";
                const percent =
                  g.score != null && g.max_score != null && Number(g.max_score) > 0
                    ? Math.round((Number(g.score) / Number(g.max_score)) * 100)
                    : null;

                return (
                  <div key={g.id} className="rounded-xl border bg-white/70 p-3">
                    <div className="text-sm font-semibold truncate">
                      {subjectName} • {g.assessment}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {g.updated_at ? new Date(g.updated_at).toLocaleString() : ""}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="portal-badge">
                        {g.score ?? "—"} / {g.max_score ?? "—"}
                      </span>
                      {percent != null ? <span className="portal-badge">{percent}%</span> : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard title="School fees" subtitle="Your current term fee position.">
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label="Expected" value={expectedAmount > 0 ? money(expectedAmount) : "0"} />
            <StatCard label="Paid" value={totalPaid > 0 ? money(totalPaid) : "0"} />
            <StatCard label="Balance" value={balanceDue > 0 ? money(balanceDue) : "0"} />
          </div>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-[color:var(--ohs-dark-green)]"
              style={{ width: `${Math.max(0, Math.min(feeProgress, 100))}%` }}
            />
          </div>

          <div className="mt-2 text-xs text-slate-500">
            {expectedAmount > 0
              ? `${feeProgress}% of your current term fees has been cleared.`
              : "No fee structure has been applied yet for this term."}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Announcements"
        subtitle="Latest school and class announcements."
        right={
          <Link className="portal-btn" href="/portal/student/announcements">
            View all
          </Link>
        }
      >
        {visibleAnnouncements.length === 0 ? (
          <div className="text-sm portal-muted">No announcements yet.</div>
        ) : (
          <div className="grid gap-3">
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
      </SectionCard>
    </div>
  );
}