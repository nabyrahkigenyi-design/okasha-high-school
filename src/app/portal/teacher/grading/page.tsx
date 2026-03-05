import Link from "next/link";
import { ToastGate } from "@/components/ToastGate";
import { saveGrades, finalizeAssessment } from "./actions";
import {
  getAssessmentMeta,
  getGradeMapForScope,
  getGradingScopeOrNull,
  listGradingOptions,
  listStudentsForGrading,
} from "./queries";

type Rel<T> = T | T[] | null | undefined;
function one<T>(v: Rel<T>): T | null {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

export default async function TeacherGradingPage({
  searchParams,
}: {
  searchParams: Promise<{ assignmentId?: string; assessment?: string; ok?: string; err?: string }>;
}) {
  const params = await searchParams;
  const assignmentId = params.assignmentId ? Number(params.assignmentId) : 0;
  const assessment = (params.assessment ?? "Test 1").trim();

  const options = await listGradingOptions();
  const selected = assignmentId ? await getGradingScopeOrNull(assignmentId) : null;

  const cg = one(selected?.class_groups);
  const subj = one(selected?.subjects);
  const term = one(selected?.academic_terms);

  const students = selected ? await listStudentsForGrading(selected.id) : [];
  const gradeMap = selected ? await getGradeMapForScope({ assignmentId: selected.id, assessment }) : new Map();

  // Locked if any grade exists for this assessment in this scope
  const meta = selected ? await getAssessmentMeta({ assignmentId: selected.id, assessment }) : null;
  const locked = gradeMap.size > 0;

  const defaultMax =
    students.length > 0 ? gradeMap.get(students[0].id)?.max_score ?? "100" : "100";

  return (
    <div className="grid gap-6">
      <ToastGate ok={params.ok} err={params.err} okText="Grades saved." />

      <section className="portal-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="portal-title">Grading</h1>
            <p className="portal-subtitle">
              Select class/subject, choose an assessment name, enter marks. After saving, grading becomes locked.
            </p>
          </div>

          {selected ? (
            <div className="flex flex-wrap gap-2">
              <Link className="portal-btn" href={`/portal/teacher/attendance?assignmentId=${selected.id}`}>
                Attendance
              </Link>
              <Link className="portal-btn" href={`/portal/teacher/assignments?assignmentId=${selected.id}`}>
                Assignments
              </Link>
              <a
                className="portal-btn"
                href={`/portal/teacher/grading/export?assignmentId=${selected.id}&assessment=${encodeURIComponent(assessment)}`}
              >
                Download CSV
              </a>
            </div>
          ) : null}
        </div>

        <form method="get" className="mt-4 grid gap-3 md:grid-cols-[1fr_220px_auto]">
          <label className="grid gap-1">
            <span className="text-sm">Class / Subject</span>
            <select className="portal-select" name="assignmentId" defaultValue={assignmentId || ""}>
              <option value="">Select class and subject</option>
              {options.map((a: any) => {
                const aCg = one(a.class_groups);
                const aSub = one(a.subjects);
                return (
                  <option key={a.id} value={a.id}>
                    {aCg?.name ?? "Class"} • {aSub?.name ?? "Subject"}
                  </option>
                );
              })}
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-sm">Assessment</span>
            <input className="portal-input" name="assessment" defaultValue={assessment} placeholder="Midterm Test" />
          </label>

          <div className="flex items-end">
            <button className="portal-btn portal-btn-primary" type="submit">
              Open
            </button>
          </div>
        </form>

        {selected ? (
          <div className="mt-4 rounded-xl border bg-white/70 p-4">
            <div className="font-medium">
              {cg?.name ?? "Class"} • {subj?.name ?? "Subject"}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {term?.name ?? "Term"} • {cg?.level ?? ""} •{" "}
              {subj?.track === "islamic" ? "Islamic Theology" : "Secular"}
            </div>
          </div>
        ) : (
          <div className="mt-4 text-sm portal-muted">
            {options.length === 0
              ? "You do not have any active teaching assignments yet."
              : "Select a class and subject to continue."}
          </div>
        )}

        {selected && !locked ? (
  <form action={finalizeAssessment} className="mt-4">
    <input type="hidden" name="teacher_assignment_id" value={selected.id} />
    <input type="hidden" name="assessment" value={assessment} />
    <button className="portal-btn portal-btn-danger" type="submit">
      Finalize grades
    </button>
    <div className="mt-1 text-xs portal-muted">
      Finalizing locks this assessment permanently.
    </div>
  </form>
) : null}

        {selected && locked ? (
          <div className="mt-4 rounded-xl border bg-white/70 p-3 text-sm text-slate-700">
            Grades for <b>{assessment}</b> have been saved and are now <b>locked</b> (not editable). Use “Download CSV”.
          </div>
        ) : null}
      </section>

      {selected ? (
        <section className="portal-surface p-5">
          <h2 className="text-lg font-semibold">Enter marks</h2>
          <p className="mt-1 text-sm portal-muted">
            {locked ? "Locked." : "Fill scores then Save. Students/parents will see updates on refresh."}
          </p>

          {students.length === 0 ? (
            <div className="mt-4 text-sm portal-muted">No students enrolled for this class/term.</div>
          ) : (
            <form action={saveGrades} className="mt-4 grid gap-3">
              <input type="hidden" name="teacher_assignment_id" value={selected.id} />
              <input type="hidden" name="assessment" value={assessment} />

              <label className="grid gap-1 max-w-xs">
                <span className="text-sm">Maximum score</span>
                <input
                  className="portal-input"
                  type="number"
                  step="0.01"
                  min="0"
                  name="max_score"
                  defaultValue={defaultMax}
                  required
                  disabled={locked}
                />
              </label>

              <div className="overflow-hidden rounded-2xl border">
                <div className="grid grid-cols-[1fr_180px] border-b bg-[color:var(--ohs-surface)] px-4 py-2 text-sm font-medium text-slate-700">
                  <div>Student</div>
                  <div>Score</div>
                </div>

                <ul>
                  {students.map((s: any) => {
                    const existing = gradeMap.get(s.id);
                    return (
                      <li key={s.id} className="grid grid-cols-[1fr_180px] items-center gap-3 border-b last:border-b-0 px-4 py-3">
                        <div className="text-sm text-[color:var(--ohs-charcoal)]">{s.full_name}</div>
                        <input
                          className="portal-input"
                          type="number"
                          step="0.01"
                          min="0"
                          name={`score_${s.id}`}
                          defaultValue={existing?.score ?? ""}
                          placeholder="Enter score"
                          disabled={locked}
                        />
                      </li>
                    );
                  })}
                </ul>
              </div>

              {!locked ? (
                <button className="portal-btn portal-btn-primary w-fit" type="submit">
                  Save grades
                </button>
              ) : null}
            </form>
          )}
        </section>
      ) : null}
    </div>
  );
}