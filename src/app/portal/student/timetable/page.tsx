import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getActiveTermOrNull, getMyEnrollmentOrNull, getStudentOrThrow, one } from "@/app/portal/student/queries";

const DAYS = [
  { n: 1, label: "Mon" },
  { n: 2, label: "Tue" },
  { n: 3, label: "Wed" },
  { n: 4, label: "Thu" },
  { n: 5, label: "Fri" },
  { n: 6, label: "Sat" },
  { n: 7, label: "Sun" },
];

function todayDow(): number {
  const d = new Date().getDay(); // 0=Sun..6=Sat
  return d === 0 ? 7 : d; // 1=Mon..7=Sun
}

function fmtTime(t: string | null) {
  if (!t) return "";
  return t.slice(0, 5); // "HH:MM:SS" -> "HH:MM"
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
      </div>
    );
  }

  const day = params.day ? Number(params.day) : todayDow();

  const { data: lessons, error: ttErr } = await sb
    .from("timetables")
    .select(`
      id,
      day_of_week,
      period_no,
      starts_at,
      ends_at,
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
            <select className="portal-select" name="day" defaultValue={String(day)}>
              {DAYS.map((d) => (
                <option key={d.n} value={d.n}>
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

        {/* Mobile-first day tabs */}
        <div className="-mx-2 mt-4 flex gap-2 overflow-x-auto px-2 pb-1">
          {DAYS.map((d) => {
            const active = d.n === day;
            const href = `/portal/student/timetable?termId=${termId}&day=${d.n}`;
            return (
              <Link key={d.n} href={href} className={`portal-btn whitespace-nowrap ${active ? "portal-btn-primary" : ""}`}>
                {d.label}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="portal-surface p-5">
        <h2 className="text-lg font-semibold">Lessons</h2>
        <p className="mt-1 text-sm portal-muted">Your schedule for the selected day.</p>

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
                        {fmtTime(x.starts_at)}–{fmtTime(x.ends_at)}
                        {teacher?.full_name ? ` • ${teacher.full_name}` : ""}
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