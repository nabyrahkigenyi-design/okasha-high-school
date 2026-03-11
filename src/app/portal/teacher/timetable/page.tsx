import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";

const DAYS = [
  { key: "mon", label: "Mon", long: "Monday" },
  { key: "tue", label: "Tue", long: "Tuesday" },
  { key: "wed", label: "Wed", long: "Wednesday" },
  { key: "thu", label: "Thu", long: "Thursday" },
  { key: "fri", label: "Fri", long: "Friday" },
  { key: "sat", label: "Sat", long: "Saturday" },
  { key: "sun", label: "Sun", long: "Sunday" },
] as const;

type DayKey = (typeof DAYS)[number]["key"];
type Rel<T> = T | T[] | null | undefined;

function todayDayKey(): DayKey {
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

function one<T>(v: Rel<T>): T | null {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

export default async function TeacherTimetablePage({
  searchParams,
}: {
  searchParams: Promise<{ termId?: string; day?: string }>;
}) {
  const me = await requireRole(["teacher"]);
  const sb = supabaseAdmin();
  const params = await searchParams;

  const { data: terms, error: termErr } = await sb
    .from("academic_terms")
    .select("id, name, is_active")
    .order("id", { ascending: false })
    .limit(50);

  if (termErr) throw new Error(termErr.message);

  const activeTerm = terms?.find((t: any) => t.is_active) ?? terms?.[0] ?? null;
  const termId = params.termId ? Number(params.termId) : activeTerm?.id ?? null;
  const day = (params.day as DayKey | undefined) ?? todayDayKey();

  if (!termId) {
    return (
      <div className="portal-surface p-5">
        <h1 className="portal-title">My Timetable</h1>
        <p className="portal-subtitle">No academic terms found yet.</p>
      </div>
    );
  }

  const { data: lessons, error: ttErr } = await sb
    .from("timetables")
    .select(`
      id,
      day_of_week,
      period_no,
      start_time,
      end_time,
      room,
      note,
      class_groups:class_id ( id, name, level, track_key ),
      subjects:subject_id ( id, name, code ),
      teachers:teacher_id ( id, full_name )
    `)
    .eq("term_id", termId)
    .eq("teacher_id", me.id)
    .eq("day_of_week", day)
    .order("period_no", { ascending: true });

  if (ttErr) throw new Error(ttErr.message);

  const termName = terms?.find((t: any) => t.id === termId)?.name ?? `Term ${termId}`;
  const selectedDay = DAYS.find((d) => d.key === day);

  return (
    <div className="grid gap-6">
      <section className="portal-surface p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="portal-title">My Timetable</h1>
            <p className="portal-subtitle">
              Term: <span className="font-medium text-slate-900">{termName}</span> • Day:{" "}
              <span className="font-medium text-slate-900">{selectedDay?.long ?? day}</span>
            </p>
          </div>
        </div>

        <form method="get" className="mt-4 grid gap-3 md:grid-cols-[1fr_220px_auto]">
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

          <label className="grid gap-1">
            <span className="text-sm">Day</span>
            <select className="portal-select" name="day" defaultValue={day}>
              {DAYS.map((d) => (
                <option key={d.key} value={d.key}>
                  {d.long}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-end">
            <button className="portal-btn portal-btn-primary w-full md:w-auto" type="submit">
              Apply
            </button>
          </div>
        </form>

        <div className="-mx-2 mt-4 flex gap-2 overflow-x-auto px-2 pb-1">
          {DAYS.map((d) => {
            const active = d.key === day;
            const href = `/portal/teacher/timetable?termId=${termId}&day=${d.key}`;

            return (
              <Link
                key={d.key}
                href={href}
                className={`portal-btn whitespace-nowrap ${active ? "portal-btn-primary" : ""}`}
              >
                {d.label}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="portal-surface p-4 sm:p-5">
        <h2 className="text-lg font-semibold text-slate-900">Lessons</h2>
        <p className="mt-1 text-sm text-slate-600">Your teaching schedule for the selected day.</p>

        {(lessons ?? []).length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white/60 p-4 text-sm text-slate-600">
            No lessons assigned for this day.
          </div>
        ) : (
          <div className="mt-4 grid gap-3">
            {(lessons ?? []).map((x: any) => {
              const subj = one(x.subjects) as any;
              const cg = one(x.class_groups) as any;

              return (
                <div key={x.id} className="rounded-2xl border border-slate-200 bg-white/80 p-4">
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
                        <div className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
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
      </section>
    </div>
  );
}