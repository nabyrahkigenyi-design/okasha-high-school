import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";

type Rel<T> = T | T[] | null | undefined;

function one<T>(v: Rel<T>): T | null {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
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

function dayLabel(day: string) {
  switch ((day ?? "").toLowerCase()) {
    case "mon":
      return "Monday";
    case "tue":
      return "Tuesday";
    case "wed":
      return "Wednesday";
    case "thu":
      return "Thursday";
    case "fri":
      return "Friday";
    case "sat":
      return "Saturday";
    default:
      return "Sunday";
  }
}

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
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm sm:p-5">
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">{value}</div>
      {hint ? <div className="mt-1 text-sm text-slate-600">{hint}</div> : null}
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
    <section className="portal-surface p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
        </div>
        {right ? <div className="flex flex-wrap gap-2">{right}</div> : null}
      </div>

      <div className="mt-4">{children}</div>
    </section>
  );
}

function ActionTile({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200 bg-white/75 p-4 transition hover:bg-white hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-900 sm:text-base">{title}</div>
          <div className="mt-1 text-sm text-slate-600">{description}</div>
        </div>
        <span className="rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700">
          Open
        </span>
      </div>
    </Link>
  );
}

export default async function TeacherDashboard() {
  const me = await requireRole(["teacher"]);
  const sb = supabaseAdmin();

  const { data: terms, error: termErr } = await sb
    .from("academic_terms")
    .select("id, name, is_active")
    .order("id", { ascending: false })
    .limit(20);

  if (termErr) throw new Error(termErr.message);

  const activeTerm = terms?.find((t: any) => t.is_active) ?? terms?.[0] ?? null;

  const { data: assignments, error: assignErr } =
    activeTerm?.id
      ? await sb
          .from("teacher_assignments")
          .select(`
            id,
            class_id,
            subject_id,
            term_id,
            class_groups:class_id ( id, name, level, track_key ),
            subjects:subject_id ( id, name, code, track )
          `)
          .eq("teacher_id", me.id)
          .eq("term_id", activeTerm.id)
          .order("id", { ascending: true })
      : { data: [] as any[], error: null as any };

  if (assignErr) throw new Error(assignErr.message);

  const today = todayDayKey();

  const { data: lessons, error: ttErr } =
    activeTerm?.id
      ? await sb
          .from("timetables")
          .select(`
            id,
            day_of_week,
            period_no,
            start_time,
            end_time,
            room,
            note,
            class_groups:class_id ( id, name, level ),
            subjects:subject_id ( id, name, code )
          `)
          .eq("term_id", activeTerm.id)
          .eq("teacher_id", me.id)
          .eq("day_of_week", today)
          .order("period_no", { ascending: true })
      : { data: [] as any[], error: null as any };

  if (ttErr) throw new Error(ttErr.message);

  const classesCount = assignments?.length ?? 0;
  const todaysLessons = lessons?.length ?? 0;

  return (
    <div className="grid gap-6">
      <section className="portal-surface p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h1 className="portal-title">Teacher Dashboard</h1>
            <p className="portal-subtitle">
              Welcome, <span className="font-medium text-slate-900">{me.full_name}</span>
              {activeTerm ? (
                <>
                  {" "}
                  • Active term: <span className="font-medium text-slate-900">{activeTerm.name}</span>
                </>
              ) : null}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link className="portal-btn portal-btn-primary" href="/portal/teacher/attendance">
              Take Attendance
            </Link>
            <Link className="portal-btn" href="/portal/teacher/grading">
              Enter Grades
            </Link>
            <Link className="portal-btn" href="/portal/teacher/assignments">
              Create Assignment
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Assigned Classes" value={classesCount} hint="Current active teaching scopes" />
        <StatCard label="Today's Lessons" value={todaysLessons} hint={dayLabel(today)} />
        <StatCard label="Active Term" value={activeTerm?.name ?? "—"} hint="School teaching period" />
        <StatCard label="Priority" value={todaysLessons > 0 ? "Teaching Day" : "No Lessons"} hint="Based on today’s timetable" />
      </div>

      <SectionCard
        title="What do you want to do?"
        subtitle="Quick teacher tasks for daily work."
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <ActionTile
            title="Take attendance"
            description="Open a class session and mark students present, absent, late, or sick."
            href="/portal/teacher/attendance"
          />
          <ActionTile
            title="Enter grades"
            description="Record assessment scores for your class and subject."
            href="/portal/teacher/grading"
          />
          <ActionTile
            title="Create assignments"
            description="Post classwork, homework, or coursework with a due date."
            href="/portal/teacher/assignments"
          />
          <ActionTile
            title="View timetable"
            description="See your teaching schedule for the week and each day."
            href="/portal/teacher/timetable"
          />
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <SectionCard
          title="My classes"
          subtitle="Your current class and subject assignments for the active term."
          right={
            <Link className="portal-btn" href="/portal/teacher/classes">
              View all
            </Link>
          }
        >
          {(assignments ?? []).length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-5 text-sm text-slate-600">
              No class assignments yet. Ask admin to assign you to a class and subject.
            </div>
          ) : (
            <div className="grid gap-3">
              {(assignments ?? []).slice(0, 6).map((a: any) => {
                const cg = one(a.class_groups) as any;
                const subj = one(a.subjects) as any;

                return (
                  <div
                    key={a.id}
                    className="rounded-2xl border border-slate-200 bg-white/75 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 sm:text-base">
                          {cg?.name ?? "Class"} • {subj?.name ?? "Subject"}
                        </div>
                        <div className="mt-1 text-sm text-slate-600">
                          {cg?.level ?? ""}
                          {subj?.code ? ` • ${subj.code}` : ""}
                          {subj?.track === "islamic" ? " • Islamic Theology" : " • Secular"}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Link className="portal-btn" href={`/portal/teacher/attendance?assignmentId=${a.id}`}>
                          Attendance
                        </Link>
                        <Link className="portal-btn" href={`/portal/teacher/grading?assignmentId=${a.id}`}>
                          Grading
                        </Link>
                        <Link className="portal-btn" href={`/portal/teacher/assignments?assignmentId=${a.id}`}>
                          Assignments
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Today's lessons"
          subtitle={`Your schedule for ${dayLabel(today)}.`}
          right={
            <Link className="portal-btn" href={`/portal/teacher/timetable?day=${today}`}>
              Full timetable
            </Link>
          }
        >
          {(lessons ?? []).length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-5 text-sm text-slate-600">
              No lessons assigned for today.
            </div>
          ) : (
            <div className="grid gap-3">
              {(lessons ?? []).map((x: any) => {
                const cg = one(x.class_groups) as any;
                const subj = one(x.subjects) as any;

                return (
                  <div key={x.id} className="rounded-2xl border border-slate-200 bg-white/75 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 sm:text-base">
                          Period {x.period_no ?? "—"} • {subj?.name ?? "Subject"}
                        </div>
                        <div className="mt-1 text-sm text-slate-600">
                          {fmtTime(x.start_time)}–{fmtTime(x.end_time)}
                          {cg?.name ? ` • ${cg.name}` : ""}
                          {x.room ? ` • Room: ${x.room}` : ""}
                        </div>
                        {x.note ? (
                          <div className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">
                            {x.note}
                          </div>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {subj?.code ? <span className="portal-badge">{subj.code}</span> : null}
                        {cg?.name ? <span className="portal-badge">{cg.name}</span> : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}