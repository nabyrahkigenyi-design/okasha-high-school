import { supabaseAdmin } from "@/lib/supabase/admin";
import { getActiveTermOrNull, getMyEnrollmentOrNull, getStudentOrThrow, one } from "../queries";

export default async function StudentGradesPage({
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
  const termId = params.termId ? Number(params.termId) : activeTerm?.id ?? terms?.[0]?.id ?? null;

  if (!termId) {
    return (
      <div className="portal-surface p-5">
        <h1 className="portal-title">Grades</h1>
        <p className="portal-subtitle">No academic terms found yet.</p>
      </div>
    );
  }

  const enrollment = await getMyEnrollmentOrNull(termId);
  const cg: any = one(enrollment?.class_groups);

  const { data: grades, error: gradeErr } = await sb
    .from("grades")
    .select("id, subject_id, assessment, score, max_score, updated_at, subjects:subject_id ( id, name, code, track )")
    .eq("student_id", student.id)
    .eq("term_id", termId)
    .order("updated_at", { ascending: false })
    .limit(500);

  if (gradeErr) throw new Error(gradeErr.message);

  // Group by subject
  const bySubject = new Map<string, { subjectName: string; items: any[] }>();
  (grades ?? []).forEach((g: any) => {
    const subj = one(g.subjects) as any;
    const key = String(g.subject_id);
    if (!bySubject.has(key)) {
      bySubject.set(key, { subjectName: subj?.name ?? "Subject", items: [] });
    }
    bySubject.get(key)!.items.push(g);
  });

  const subjectGroups = Array.from(bySubject.values()).sort((a, b) => a.subjectName.localeCompare(b.subjectName));

  return (
    <div className="grid gap-6">
      <section className="portal-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="portal-title">Grades</h1>
            <p className="portal-subtitle">
              Term: <span className="font-medium">{terms?.find((t: any) => t.id === termId)?.name ?? termId}</span>
              {enrollment?.class_id ? (
                <>
                  {" • "}Class: <span className="font-medium">{cg?.name ?? enrollment.class_id}</span>
                </>
              ) : null}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <a className="portal-btn" href={`/portal/student/grades/export?termId=${termId}`}>
              Download CSV
            </a>
          </div>
        </div>

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

      <section className="portal-surface p-5">
        <h2 className="text-lg font-semibold">Results</h2>
        <p className="mt-1 text-sm portal-muted">Grades entered by teachers (visible after refresh).</p>

        {(grades ?? []).length === 0 ? (
          <div className="mt-4 text-sm portal-muted">No grades recorded yet for this term.</div>
        ) : (
          <div className="mt-4 grid gap-4">
            {subjectGroups.map((group, idx) => (
              <div key={idx} className="rounded-2xl border bg-white/70 p-4">
                <div className="font-semibold text-[color:var(--ohs-charcoal)]">{group.subjectName}</div>

                <div className="mt-3 grid gap-2">
                  {group.items
                    .slice()
                    .sort((a, b) => String(a.assessment).localeCompare(String(b.assessment)))
                    .map((g: any) => {
                      const score = g.score != null ? Number(g.score) : null;
                      const max = g.max_score != null ? Number(g.max_score) : null;
                      const pct = score != null && max != null && max > 0 ? Math.round((score / max) * 100) : null;

                      return (
                        <div
                          key={g.id}
                          className="rounded-xl border bg-white/70 p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate">{g.assessment}</div>
                            <div className="text-xs text-slate-500">
                              Updated: {g.updated_at ? new Date(g.updated_at).toLocaleString() : "—"}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="portal-badge">
                              {score ?? "—"} / {max ?? "—"}
                            </span>
                            {pct != null ? <span className="portal-badge">{pct}%</span> : null}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}