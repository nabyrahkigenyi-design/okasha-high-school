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
type GradeRow = {
  id: number;
  subject_id: number;
  assessment: string | null;
  score: number | null;
  max_score: number | null;
  updated_at: string | null;
  subjects?: any;
};

const REPORT_COLUMNS = [
  "Mid Term 1",
  "End Term 1",
  "Mid Term 2",
  "End Term 2",
  "Mid Term 3",
  "End of Year",
] as const;

type ReportColumn = (typeof REPORT_COLUMNS)[number];

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

function normalizeAssessmentLabel(value: string | null | undefined): ReportColumn | null {
  const v = String(value ?? "").trim().toLowerCase();

  if (!v) return null;

  if (v === "mid term 1" || v === "midterm 1" || v === "mid-term 1" || v === "mid 1") {
    return "Mid Term 1";
  }

  if (
    v === "end term 1" ||
    v === "endterm 1" ||
    v === "end-term 1" ||
    v === "end of term 1" ||
    v === "term 1 final"
  ) {
    return "End Term 1";
  }

  if (v === "mid term 2" || v === "midterm 2" || v === "mid-term 2" || v === "mid 2") {
    return "Mid Term 2";
  }

  if (
    v === "end term 2" ||
    v === "endterm 2" ||
    v === "end-term 2" ||
    v === "end of term 2" ||
    v === "term 2 final"
  ) {
    return "End Term 2";
  }

  if (v === "mid term 3" || v === "midterm 3" || v === "mid-term 3" || v === "mid 3") {
    return "Mid Term 3";
  }

  if (
    v === "end of year" ||
    v === "end year" ||
    v === "final" ||
    v === "final exam" ||
    v === "end term 3" ||
    v === "endterm 3" ||
    v === "end-term 3"
  ) {
    return "End of Year";
  }

  return null;
}

function fmtScore(score: number | null, max: number | null) {
  if (score == null && max == null) return "—";
  return `${score ?? "—"} / ${max ?? "—"}`;
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

  if (!enrollment?.class_id) {
    return (
      <div className="grid gap-6">
        <section className="portal-surface p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="portal-title">Grades</h1>
              <p className="portal-subtitle">
                Child: <span className="font-medium">{student.full_name}</span> • Term:{" "}
                <span className="font-medium">
                  {terms?.find((t: any) => t.id === termId)?.name ?? termId}
                </span>{" "}
                • Not enrolled for this term
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link className="portal-btn" href={`/portal/parent/dashboard?studentId=${studentId}`}>
                Dashboard
              </Link>
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
      </div>
    );
  }

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
    .limit(1000);

  if (gradeErr) throw new Error(gradeErr.message);

  const { data: teacherAssignments, error: taErr } = await sb
    .from("teacher_assignments")
    .select(`
      id,
      subject_id,
      teacher_id,
      subjects:subject_id ( id, name, code, track ),
      teachers:teacher_id ( id, full_name )
    `)
    .eq("term_id", termId)
    .eq("class_id", enrollment.class_id)
    .order("id", { ascending: true });

  if (taErr) throw new Error(taErr.message);

  const gradeRows = (grades ?? []) as GradeRow[];

  const subjectMap = new Map<
    string,
    {
      subjectId: number;
      subjectName: string;
      subjectCode: string | null;
      teacherName: string | null;
      track: string | null;
      gradesByAssessment: Map<
        ReportColumn,
        { score: number | null; max: number | null; updatedAt: string | null }
      >;
      rawItems: GradeRow[];
    }
  >();

  for (const row of teacherAssignments ?? []) {
    const subj = oneRel(row.subjects) as any;
    const teacher = oneRel(row.teachers) as any;
    const key = String(row.subject_id);

    if (!subjectMap.has(key)) {
      subjectMap.set(key, {
        subjectId: Number(row.subject_id),
        subjectName: subj?.name ?? "Subject",
        subjectCode: subj?.code ?? null,
        teacherName: teacher?.full_name ?? null,
        track: subj?.track ?? null,
        gradesByAssessment: new Map(),
        rawItems: [],
      });
    } else {
      const existing = subjectMap.get(key)!;
      if (!existing.teacherName && teacher?.full_name) {
        existing.teacherName = teacher.full_name;
      }
    }
  }

  for (const g of gradeRows) {
    const subj = oneRel(g.subjects) as any;
    const key = String(g.subject_id);

    if (!subjectMap.has(key)) {
      subjectMap.set(key, {
        subjectId: Number(g.subject_id),
        subjectName: subj?.name ?? "Subject",
        subjectCode: subj?.code ?? null,
        teacherName: null,
        track: subj?.track ?? null,
        gradesByAssessment: new Map(),
        rawItems: [],
      });
    }

    const entry = subjectMap.get(key)!;
    entry.rawItems.push(g);

    const normalizedAssessment = normalizeAssessmentLabel(g.assessment);
    if (normalizedAssessment) {
      entry.gradesByAssessment.set(normalizedAssessment, {
        score: g.score != null ? Number(g.score) : null,
        max: g.max_score != null ? Number(g.max_score) : null,
        updatedAt: g.updated_at ?? null,
      });
    }
  }

  const subjects = Array.from(subjectMap.values()).sort((a, b) =>
    a.subjectName.localeCompare(b.subjectName)
  );

  const termName = terms?.find((t: any) => t.id === termId)?.name ?? `Term ${termId}`;

  const scoredRows = gradeRows.filter(
    (g) => g.score != null && g.max_score != null && Number(g.max_score) > 0
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
              {" • "}Class: <span className="font-medium">{cg?.name ?? enrollment.class_id}</span>
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
        <StatCard label="Subjects" value={subjects.length} />
        <StatCard label="Grade records" value={gradeRows.length} />
        <StatCard
          label="Average"
          value={scoredRows.length > 0 ? `${averagePercent}%` : "—"}
          hint={scoredRows.length > 0 ? "Across recorded scores" : "No scored records yet"}
        />
        <StatCard label="Class" value={cg?.name ?? "—"} hint={cg?.level ?? student.class_level ?? ""} />
      </section>

      <SectionCard
        title="Subject performance"
        subtitle="Each subject shows the assigned teacher and recorded assessments for this term."
      >
        {subjects.length === 0 ? (
          <div className="text-sm portal-muted">No subjects or grades found yet for this term.</div>
        ) : (
          <>
            <div className="hidden xl:block overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0 overflow-hidden rounded-2xl border bg-white/70">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="border-b px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Subject
                    </th>
                    <th className="border-b px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Teacher
                    </th>
                    {REPORT_COLUMNS.map((assessment) => (
                      <th
                        key={assessment}
                        className="border-b px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600"
                      >
                        {assessment}
                      </th>
                    ))}
                    <th className="border-b px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Subject Avg
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((subject) => {
                    const subjectScored = subject.rawItems.filter(
                      (g) => g.score != null && g.max_score != null && Number(g.max_score) > 0
                    );
                    const subjectAvg =
                      subjectScored.length > 0
                        ? Math.round(
                            subjectScored.reduce((sum, row) => {
                              return sum + (Number(row.score) / Number(row.max_score)) * 100;
                            }, 0) / subjectScored.length
                          )
                        : null;

                    return (
                      <tr key={subject.subjectId} className="align-top">
                        <td className="border-b px-4 py-3">
                          <div className="font-medium text-slate-900">{subject.subjectName}</div>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {subject.subjectCode ? <span className="portal-badge">{subject.subjectCode}</span> : null}
                            {subject.track === "islamic" ? (
                              <span className="portal-badge">Islamic</span>
                            ) : (
                              <span className="portal-badge">Secular</span>
                            )}
                          </div>
                        </td>

                        <td className="border-b px-4 py-3 text-sm text-slate-700">
                          {subject.teacherName ?? "Not assigned"}
                        </td>

                        {REPORT_COLUMNS.map((assessment) => {
                          const grade = subject.gradesByAssessment.get(assessment);
                          const pct =
                            grade?.score != null && grade?.max != null && grade.max > 0
                              ? Math.round((grade.score / grade.max) * 100)
                              : null;

                          return (
                            <td key={assessment} className="border-b px-4 py-3 text-sm text-slate-700">
                              {grade ? (
                                <div className="grid gap-1">
                                  <div>{fmtScore(grade.score, grade.max)}</div>
                                  {pct != null ? <div className="text-xs text-slate-500">{pct}%</div> : null}
                                </div>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>
                          );
                        })}

                        <td className="border-b px-4 py-3 text-sm font-medium text-slate-900">
                          {subjectAvg != null ? `${subjectAvg}%` : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="grid gap-4 xl:hidden">
              {subjects.map((subject) => {
                const subjectScored = subject.rawItems.filter(
                  (g) => g.score != null && g.max_score != null && Number(g.max_score) > 0
                );
                const subjectAvg =
                  subjectScored.length > 0
                    ? Math.round(
                        subjectScored.reduce((sum, row) => {
                          return sum + (Number(row.score) / Number(row.max_score)) * 100;
                        }, 0) / subjectScored.length
                      )
                    : null;

                return (
                  <div key={subject.subjectId} className="rounded-2xl border bg-white/70 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="font-semibold text-[color:var(--ohs-charcoal)]">
                        {subject.subjectName}
                      </div>
                      {subject.subjectCode ? <span className="portal-badge">{subject.subjectCode}</span> : null}
                    </div>

                    <div className="mt-2 text-sm text-slate-600">
                      Teacher: <span className="font-medium text-slate-900">{subject.teacherName ?? "Not assigned"}</span>
                    </div>

                    <div className="mt-2 text-sm text-slate-600">
                      Average: <span className="font-medium text-slate-900">{subjectAvg != null ? `${subjectAvg}%` : "—"}</span>
                    </div>

                    <div className="mt-4 grid gap-2">
                      {REPORT_COLUMNS.map((assessment) => {
                        const grade = subject.gradesByAssessment.get(assessment);
                        const pct =
                          grade?.score != null && grade?.max != null && grade.max > 0
                            ? Math.round((grade.score / grade.max) * 100)
                            : null;

                        return (
                          <div
                            key={assessment}
                            className="rounded-xl border bg-white/70 p-3 flex items-center justify-between gap-3"
                          >
                            <div className="min-w-0">
                              <div className="text-sm font-medium">{assessment}</div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="portal-badge">
                                {grade ? fmtScore(grade.score, grade.max) : "—"}
                              </span>
                              {pct != null ? <span className="portal-badge">{pct}%</span> : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </SectionCard>
    </div>
  );
}
