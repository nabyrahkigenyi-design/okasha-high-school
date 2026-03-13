import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  getActiveTermOrNull,
  getMyEnrollmentOrNull,
  getStudentOrThrow,
  one,
} from "@/app/portal/student/queries";

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

export default async function StudentTimetablePage({
  searchParams,
}: {
  searchParams: Promise<{ termId?: string; day?: string }>;
}) {
  const params = await searchParams;
  await getStudentOrThrow();

  const sb = supabaseAdmin();

  const { data: terms, error: termErr } = await sb
    .from("academic_terms")
    .select("id, name, is_active")
    .order("id", { ascending: false })
    .limit(50);

  if (termErr) throw new Error(termErr.message);

  const activeTerm = await getActiveTermOrNull();
  const termId = params.termId ? Number(params.termId) : activeTerm?.id ?? terms?.[0]?.id ?? null;

  if (!termId) {
    return (
      <div className="portal-surface p-5">
        <h1 className="portal-title">Timetable</h1>
        <p className="portal-subtitle">No academic terms found yet.</p>
      </div>
    );
  }

  const enrollment = await getMyEnrollmentOrNull(termId);
  const cg: any = one(enrollment?.class_groups);

  if (!enrollment?.class_id) {
    return (
      <div className="grid gap-6">
        <section className="portal-surface p-5">
          <h1 className="portal-title">Timetable</h1>
          <p className="portal-subtitle">You are not enrolled for this term.</p>

          <form method="get" className="mt-4 grid gap-2 max-w-md">
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
            <button className="portal-btn portal-btn-primary w-fit" type="submit">
              Apply
            </button>
          </form>
        </section>

        <section className="portal-surface p-5 text-sm portal-muted">
          Your timetable will appear here once you are enrolled in a class for the selected term.
        </section>
      </div>
    );
  }

  const day = (params.day as DayKey | undefined) ?? todayDayKey();

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
      subjects:subject_id ( id, name, code ),
      teachers:teacher_id ( id, full_name )
    `)
    .eq("term_id", termId)
    .eq("class_id", enrollment.class_id)
    .eq("day_of_week", day)
    .order("period_no", { ascending: true });

  if (ttErr) throw new Error(ttErr.message);

  const termName = terms?.find((t: any) => t.id === termId)?.name ?? `Term ${termId}`;
  const lessonCount = (lessons ?? []).length;

  return (
    <div className="grid gap-6">
      <section className="portal-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="portal-title">Timetable</h1>
            <p className="portal-subtitle">
              Term: <span className="font-medium">{termName}</span> • Class:{" "}
              <span className="font-medium">{cg?.name ?? enrollment.class_id}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link className="portal-btn" href="/portal/student/dashboard">
              Dashboard
            </Link>
            <a className="portal-btn" href={`/portal/student/timetable/export?termId=${termId}`}>
              Download CSV
            </a>
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
            const href = `/portal/student/timetable?termId=${termId}&day=${d.key}`;
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

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Selected day" value={DAYS.find((d) => d.key === day)?.label ?? day} />
        <StatCard label="Lessons" value={lessonCount} />
        <StatCard label="Class" value={cg?.name ?? enrollment.class_id} />
      </section>

      <section className="portal-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Lessons</h2>
            <p className="mt-1 text-sm portal-muted">Your schedule for the selected day.</p>
          </div>

          <span className="portal-badge">
            {lessonCount} lesson{lessonCount === 1 ? "" : "s"}
          </span>
        </div>

        {(lessons ?? []).length === 0 ? (
          <div className="mt-4 text-sm portal-muted">No lessons scheduled for this day.</div>
        ) : (
          <div className="mt-4 grid gap-3">
            {(lessons ?? []).map((x: any) => {
              const subj = one(x.subjects) as any;
              const teacher = one(x.teachers) as any;

              return (
                <div key={x.id} className="rounded-2xl border bg-white/70 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[color:var(--ohs-charcoal)] truncate">
                        Period {x.period_no ?? "—"} • {subj?.name ?? "Subject"}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {fmtTime(x.start_time)}–{fmtTime(x.end_time)}
                        {teacher?.full_name ? ` • ${teacher.full_name}` : ""}
                        {x.room ? ` • Room: ${x.room}` : ""}
                      </div>
                    </div>

                    {subj?.code ? <span className="portal-badge">{subj.code}</span> : null}
                  </div>

                  {x.note ? (
                    <div className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">
                      {x.note}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}