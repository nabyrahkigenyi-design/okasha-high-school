import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  getActiveTermOrNull,
  getEnrollmentOrNull,
  getParentOrThrow,
  listMyChildren,
  one,
} from "@/app/portal/parent/queries";

type Rel<T> = T | T[] | null | undefined;

function oneRel<T>(v: Rel<T>): T | null {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
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

export default async function ParentGradesPage({
  searchParams,
}: {
  searchParams: Promise<{ studentId?: string; termId?: string }>;
}) {
  const params = await searchParams;
  const sb = supabaseAdmin();

  await getParentOrThrow();
  const children = await listMyChildren();

  const studentId = params.studentId ?? (children[0]?.id ?? "");
  const student = children.find((c) => c.id === studentId) ?? null;

  const { data: terms, error: termErr } = await sb
    .from("academic_terms")
    .select("id, name, is_active")
    .order("id", { ascending: false })
    .limit(50);

  if (termErr) throw new Error(termErr.message);

  const activeTerm = await getActiveTermOrNull();
  const termId = params.termId
    ? Number(params.termId)
    : activeTerm?.id ?? terms?.[0]?.id ?? null;

  if (!studentId || !student) {
    return (
      <div className="grid gap-6">
        <section className="portal-surface p-5">
          <h1 className="portal-title">Grades</h1>
          <p className="portal-subtitle">No linked students found.</p>
        </section>

        <section className="portal-surface p-5 text-sm portal-muted">
          Ask the school administrator to link your parent account to your child.
        </section>
      </div>
    );
  }

  if (!termId) {
    return (
      <div className="portal-surface p-5">
        <h1 className="portal-title">Grades</h1>
        <p className="portal-subtitle">No academic terms found.</p>
      </div>
    );
  }

  const enrollment = await getEnrollmentOrNull(termId, studentId);
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
    .eq("student_id", studentId)
    .eq("term_id", termId)
    .order("updated_at", { ascending: false })
    .limit(800);

  if (gradeErr) throw new Error(gradeErr.message);

  const bySubject = new Map<
    string,
    {
      subjectName: string;
      subjectCode: string | null;
      items: any[];
    }
  >();

  (grades ?? []).forEach((g: any) => {
    const subj = oneRel(g.subjects) as any;
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

  const groups = Array.from(bySubject.values()).sort((a, b) =>
    a.subjectName.localeCompare(b.subjectName)
  );

  const termName = terms?.find((t: any) => t.id === termId)?.name ?? `Term ${termId}`;

  const gradeRows = grades ?? [];
  const gradeCount = gradeRows.length;
  const subjectCount = groups.length;

  const scoredRows = gradeRows.filter(
    (g: any) =>
      g.score != null &&
      g.max_score != null &&
      Number(g.max_score) > 0
  );

  const averagePercent =
    scoredRows.length > 0
      ? Math.round(
          scoredRows.reduce((sum: number, row: any) => {
            return sum + (Number(row.score) / Number(row.max_score)) * 100;
          }, 0) / scoredRows.length
        )
      : 0;

  return (
    <div className="grid gap-6">
      <section className="portal-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="portal-title">Grades</h1>
            <p className="portal-subtitle">
              Child: <span className="font-medium">{student.full_name}</span> • Term:{" "}
              <span className="font-medium">{termName}</span>
              {enrollment?.class_id ? (
                <>
                  {" • "}Class: <span className="font-medium">{cg?.name ?? enrollment.class_id}</span>
                </>
              ) : (
                <> • Not enrolled for this term</>
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link className="portal-btn" href={`/portal/parent/dashboard?studentId=${studentId}`}>
              Dashboard
            </Link>
            <a
              className="portal-btn"
              href={`/portal/parent/grades/export?studentId=${studentId}&termId=${termId}`}
            >
              Download CSV
            </a>
          </div>
        </div>

        <form method="get" className="mt-4 grid gap-3 md:grid-cols-[1fr_220px_auto]">
          <label className="grid gap-1">
            <span className="text-sm">Child</span>
            <select className="portal-select" name="studentId" defaultValue={studentId}>
              {children.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name}
                </option>
              ))}
            </select>
          </label>

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

          <div className="flex items-end">
            <button className="portal-btn portal-btn-primary" type="submit">
              Apply
            </button>
          </div>
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

      <SectionCard
        title="Results"
        subtitle="Grades entered by teachers for this term."
      >
        {!enrollment?.class_id ? (
          <div className="text-sm portal-muted">No enrollment found for this term.</div>
        ) : gradeRows.length === 0 ? (
          <div className="text-sm portal-muted">No grades recorded yet for this term.</div>
        ) : (
          <div className="grid gap-4">
            {groups.map((g, idx) => (
              <div key={idx} className="rounded-2xl border bg-white/70 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="font-semibold text-[color:var(--ohs-charcoal)]">
                    {g.subjectName}
                  </div>
                  {g.subjectCode ? <span className="portal-badge">{g.subjectCode}</span> : null}
                </div>

                <div className="mt-3 grid gap-2">
                  {g.items
                    .slice()
                    .sort((a: any, b: any) =>
                      String(a.assessment).localeCompare(String(b.assessment))
                    )
                    .map((row: any) => {
                      const score = row.score != null ? Number(row.score) : null;
                      const max = row.max_score != null ? Number(row.max_score) : null;
                      const pct =
                        score != null && max != null && max > 0
                          ? Math.round((score / max) * 100)
                          : null;

                      return (
                        <div
                          key={row.id}
                          className="rounded-xl border bg-white/70 p-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
                        >
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate">
                              {row.assessment}
                            </div>
                            <div className="text-xs text-slate-500">
                              Updated:{" "}
                              {row.updated_at
                                ? new Date(row.updated_at).toLocaleString()
                                : "—"}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <span className="portal-badge">
                              {score ?? "—"} / {max ?? "—"}
                            </span>
                            {pct != null ? (
                              <span className="portal-badge">{pct}%</span>
                            ) : null}
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