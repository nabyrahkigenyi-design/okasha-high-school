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

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border bg-white/70 p-4">
      <div className="text-xs font-semibold tracking-widest text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-bold text-[color:var(--ohs-charcoal)]">{value}</div>
    </div>
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
            subjects:subject_id ( id, name, code )
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

  return (
    <div className="grid gap-6">
      <section className="portal-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="portal-title">Teacher Dashboard</h1>
            <p className="portal-subtitle">
              Welcome, <span className="font-medium">{me.full_name}</span>
              {activeTerm ? <> • Active term: <span className="font-medium">{activeTerm.name}</span></> : null}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link className="portal-btn" href="/portal/teacher/timetable">My Timetable</Link>
            <Link className="portal-btn" href="/portal/teacher/attendance">Attendance</Link>
            <Link className="portal-btn" href="/portal/teacher/grading">Grading</Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Assigned classes" value={(assignments ?? []).length} />
        <StatCard label="Today’s lessons" value={(lessons ?? []).length} />
        <StatCard label="Active term" value={activeTerm?.name ?? "—"} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="portal-surface p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">My Classes</h2>
              <p className="mt-1 text-sm portal-muted">Current teaching assignments for the active term.</p>
            </div>
            <Link className="portal-btn" href="/portal/teacher/classes">
              View all
            </Link>
          </div>

          {(assignments ?? []).length === 0 ? (
            <div className="mt-4 text-sm portal-muted">No class assignments yet.</div>
          ) : (
            <div className="mt-4 grid gap-3">
              {(assignments ?? []).slice(0, 6).map((a: any) => {
                const cg = one(a.class_groups) as any;
                const subj = one(a.subjects) as any;

                return (
                  <Link
                    key={a.id}
                    href={`/portal/teacher/attendance?assignmentId=${a.id}`}
                    className="rounded-xl border bg-white/70 p-4 hover:bg-[color:var(--ohs-surface)]"
                  >
                    <div className="text-sm font-semibold">
                      {cg?.name ?? "Class"} • {subj?.name ?? "Subject"}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {cg?.level ?? ""} {subj?.code ? `• ${subj.code}` : ""}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="portal-surface p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Today’s Lessons</h2>
              <p className="mt-1 text-sm portal-muted">Your schedule for today.</p>
            </div>
            <Link className="portal-btn" href={`/portal/teacher/timetable?day=${today}`}>
              Full timetable
            </Link>
          </div>

          {(lessons ?? []).length === 0 ? (
            <div className="mt-4 text-sm portal-muted">No lessons assigned for today.</div>
          ) : (
            <div className="mt-4 grid gap-3">
              {(lessons ?? []).slice(0, 6).map((x: any) => {
                const cg = one(x.class_groups) as any;
                const subj = one(x.subjects) as any;

                return (
                  <div key={x.id} className="rounded-xl border bg-white/70 p-4">
                    <div className="text-sm font-semibold">
                      Period {x.period_no ?? "—"} • {subj?.name ?? "Subject"}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {fmtTime(x.start_time)}–{fmtTime(x.end_time)}
                      {cg?.name ? ` • ${cg.name}` : ""}
                      {x.room ? ` • Room: ${x.room}` : ""}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link className="portal-btn" href="/portal/teacher/timetable">
                        Timetable
                      </Link>
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