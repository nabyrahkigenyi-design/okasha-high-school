import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getActiveTermOrNull, getMyEnrollmentOrNull, getStudentOrThrow, one } from "../queries";

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
    .select(`
      id,
      subject_id,
      assessment,
      score,
      max_score,
      updated_at,
      subjects:subject_id ( id, name, code, track )
    `)
    .eq("student_id", student.id)
    .eq("term_id", termId)
    .order("updated_at", { ascending: false })
    .limit(500);

  if (gradeErr) throw new Error(gradeErr.message);

  const bySubject = new Map<string, { subjectName: string; subjectCode: string | null; items: any[] }>();

  (grades ?? []).forEach((g: any) => {
    const subj = one(g.subjects) as any;
    const key = String(g.subject_id);

    if (!bySubject.has(key)) {
      bySubject.set(key, {
        subjectName: subj?.name ?? "Subject",
        subjectCode: subj?.code ?? null,
        items: [],
      });
    }

    bySubject.get(key)!.items.push(g);
  });

  const subjectGroups = Array.from(bySubject.values()).sort((a, b) =>
    a.subjectName.localeCompare(b.subjectName)
  );

  const gradeRows = grades ?? [];
  const subjectCount = subjectGroups.length;
  const gradeCount = gradeRows.length;

  const scoredRows = gradeRows.filter(
    (g: any) => g.score != null && g.max_score != null && Number(g.max_score) > 0
  );

  const averagePercent =
    scoredRows.length > 0
      ? Math.round(
          scoredRows.reduce((sum: number, row: any) => {
            return sum + (Number(row.score) / Number(row.max_score)) * 100;
          }, 0) / scoredRows.length
        )
      : 0;

  const termName = terms?.find((t: any) => t.id === termId)?.name ?? termId;

  return (
    <div className="grid gap-6">
      <section className="portal-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="portal-title">Grades</h1>
            <p className="portal-subtitle">
              Term: <span className="font-medium">{termName}</span>
              {enrollment?.class_id ? (
                <>
                  {" • "}Class: <span className="font-medium">{cg?.name ?? enrollment.class_id}</span>
                </>
              ) : null}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link className="portal-btn" href="/portal/student/dashboard">
              Dashboard
            </Link>
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

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Subjects" value={subjectCount} />
        <StatCard label="Grade records" value={gradeCount} />
        <StatCard
          label="Average"
          value={scoredRows.length > 0 ? `${averagePercent}%` : "—"}
          hint={scoredRows.length > 0 ? "Across recorded scores" : "No scored records yet"}
        />
        <StatCard
          label="Class"
          value={cg?.name ?? "—"}
          hint={student.class_level ?? ""}
        />
      </section>

      <SectionCard title="Results" subtitle="Grades entered by teachers for this term.">
        {gradeRows.length === 0 ? (
          <div className="text-sm portal-muted">No grades recorded yet for this term.</div>
        ) : (
          <div className="grid gap-4">
            {subjectGroups.map((group, idx) => (
              <div key={idx} className="rounded-2xl border bg-white/70 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="font-semibold text-[color:var(--ohs-charcoal)]">
                    {group.subjectName}
                  </div>
                  {group.subjectCode ? <span className="portal-badge">{group.subjectCode}</span> : null}
                </div>

                <div className="mt-3 grid gap-2">
                  {group.items
                    .slice()
                    .sort((a: any, b: any) =>
                      String(a.assessment).localeCompare(String(b.assessment))
                    )
                    .map((g: any) => {
                      const score = g.score != null ? Number(g.score) : null;
                      const max = g.max_score != null ? Number(g.max_score) : null;
                      const pct =
                        score != null && max != null && max > 0
                          ? Math.round((score / max) * 100)
                          : null;

                      return (
                        <div
                          key={g.id}
                          className="rounded-xl border bg-white/70 p-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
                        >
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate">{g.assessment}</div>
                            <div className="text-xs text-slate-500">
                              Updated: {g.updated_at ? new Date(g.updated_at).toLocaleString() : "—"}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
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
      </SectionCard>
    </div>
  );
}