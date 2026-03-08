import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";

const DAYS = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
] as const;

type DayKey = (typeof DAYS)[number]["key"];

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

type Rel<T> = T | T[] | null | undefined;
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

  return (
    <div className="grid gap-6">
      <section className="portal-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="portal-title">My Timetable</h1>
            <p className="portal-subtitle">
              Term: <span className="font-medium">{termName}</span>
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
                  {d.label}
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

        <div className="-mx-2 mt-4 flex gap-2 overflow-x-auto px-2 pb-1">
          {DAYS.map((d) => {
            const active = d.key === day;
            const href = `/portal/teacher/timetable?termId=${termId}&day=${d.key}`;
            return (
              <Link key={d.key} href={href} className={`portal-btn whitespace-nowrap ${active ? "portal-btn-primary" : ""}`}>
                {d.label}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="portal-surface p-5">
        <h2 className="text-lg font-semibold">Lessons</h2>
        <p className="mt-1 text-sm portal-muted">Your teaching schedule for the selected day.</p>

        {(lessons ?? []).length === 0 ? (
          <div className="mt-4 text-sm portal-muted">No lessons assigned for this day.</div>
        ) : (
          <div className="mt-4 grid gap-3">
            {(lessons ?? []).map((x: any) => {
              const subj = one(x.subjects) as any;
              const cg = one(x.class_groups) as any;

              return (
                <div key={x.id} className="rounded-2xl border bg-white/70 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[color:var(--ohs-charcoal)] truncate">
                        Period {x.period_no ?? "—"} • {subj?.name ?? "Subject"}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {fmtTime(x.start_time)}–{fmtTime(x.end_time)}
                        {cg?.name ? ` • ${cg.name}` : ""}
                        {x.room ? ` • Room: ${x.room}` : ""}
                      </div>
                    </div>

                    {subj?.code ? <span className="portal-badge">{subj.code}</span> : null}
                  </div>

                  {x.note ? <div className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{x.note}</div> : null}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}