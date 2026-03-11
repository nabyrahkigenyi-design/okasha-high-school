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

function InfoPill({ text }: { text: string }) {
  return <span className="portal-badge">{text}</span>;
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
  const meta = selected ? await getAssessmentMeta({ assignmentId: selected.id, assessment }) : null;

  const locked = gradeMap.size > 0 || !!meta?.finalized_at;

  const defaultMax =
    students.length > 0 ? gradeMap.get(students[0].id)?.max_score ?? "100" : meta?.max_score ?? "100";

  return (
    <div className="grid gap-6">
      <ToastGate ok={params.ok} err={params.err} okText="Grades saved." />

      <section className="portal-surface p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h1 className="portal-title">Grading</h1>
            <p className="portal-subtitle">
              Select a class and assessment, enter scores, then finalize when you are completely done.
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
            <input
              className="portal-input"
              name="assessment"
              defaultValue={assessment}
              placeholder="Midterm Test"
            />
          </label>

          <div className="flex items-end">
            <button className="portal-btn portal-btn-primary w-full md:w-auto" type="submit">
              Open
            </button>
          </div>
        </form>

        {selected ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white/75 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="text-base font-semibold text-slate-900">
                  {cg?.name ?? "Class"} • {subj?.name ?? "Subject"}
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  {term?.name ?? "Term"} • {cg?.level ?? ""} •{" "}
                  {subj?.track === "islamic" ? "Islamic Theology" : "Secular"}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <InfoPill text={assessment} />
                {locked ? <InfoPill text="Locked" /> : <InfoPill text="Editable" />}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white/60 p-4 text-sm text-slate-600">
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
            <div className="mt-1 text-xs text-slate-500">
              Finalizing locks this assessment permanently.
            </div>
          </form>
        ) : null}

        {selected && locked ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white/75 p-4 text-sm text-slate-700">
            Grades for <b>{assessment}</b> are now <b>locked</b>. Use Download CSV if you want an external copy.
          </div>
        ) : null}
      </section>

      {selected ? (
        <section className="portal-surface p-4 sm:p-5">
          <h2 className="text-lg font-semibold text-slate-900">Enter marks</h2>
          <p className="mt-1 text-sm text-slate-600">
            {locked
              ? "This assessment is locked."
              : "Enter each student’s score, then save the grades."}
          </p>

          {students.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white/60 p-4 text-sm text-slate-600">
              No students enrolled for this class in this term.
            </div>
          ) : (
            <form action={saveGrades} className="mt-4 grid gap-4">
              <input type="hidden" name="teacher_assignment_id" value={selected.id} />
              <input type="hidden" name="assessment" value={assessment} />

              <label className="grid max-w-xs gap-1">
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

              <div className="grid gap-3">
                {students.map((s: any) => {
                  const existing = gradeMap.get(s.id);

                  return (
                    <div
                      key={s.id}
                      className="rounded-2xl border border-slate-200 bg-white/80 p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-900 sm:text-base">
                            {s.full_name}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">Student score entry</div>
                        </div>

                        <div className="w-full sm:w-[180px]">
                          <input
                            className="portal-input w-full"
                            type="number"
                            step="0.01"
                            min="0"
                            name={`score_${s.id}`}
                            defaultValue={existing?.score ?? ""}
                            placeholder="Enter score"
                            disabled={locked}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {!locked ? (
                <button className="portal-btn portal-btn-primary w-full sm:w-fit" type="submit">
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