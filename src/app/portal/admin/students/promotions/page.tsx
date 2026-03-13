import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { WatermarkedSection } from "@/components/WatermarkedSection";
import { ToastGate } from "@/components/ToastGate";
import {
  listClassesForPromotion,
  listEnrollmentsForTerm,
  listStudentsForPromotion,
  listTermsForPromotion,
} from "./queries";
import { bulkPromoteStudents } from "./actions";

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="portal-badge">{children}</span>;
}

function SectionTitle({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="portal-title">{title}</h1>
        {subtitle ? <p className="portal-subtitle">{subtitle}</p> : null}
      </div>
      {right ? <div className="flex flex-wrap items-center gap-2">{right}</div> : null}
    </div>
  );
}

export default async function AdminStudentPromotionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    schoolLevel?: string;
    termId?: string;
    ok?: string;
    err?: string;
  }>;
}) {
  await requireRole(["admin"]);
  const params = await searchParams;

  const q = (params.q ?? "").trim();
  const status = (params.status ?? "").trim();
  const schoolLevel = (params.schoolLevel ?? "").trim();
  const termId = params.termId ? Number(params.termId) : 0;

  const [terms, classes, students, enrollments] = await Promise.all([
    listTermsForPromotion(),
    listClassesForPromotion(),
    listStudentsForPromotion({ q, status, schoolLevel }),
    termId ? listEnrollmentsForTerm(termId) : Promise.resolve([]),
  ]);

  const activeTerm = terms.find((t: any) => t.is_active) ?? terms[0] ?? null;
  const selectedTermId = termId || activeTerm?.id || 0;

  return (
    <WatermarkedSection tone="portal" variant="mixed">
      <ToastGate ok={params.ok} err={params.err} okText="Done." />

      <div className="grid gap-6">
        <section className="portal-surface p-6">
          <SectionTitle
            title="Student Promotions"
            subtitle="Move students into their next class or stream for a selected term without changing their permanent student ID."
            right={
              <>
                <Link className="portal-btn" href="/portal/admin/students">
                  Back to Students
                </Link>
              </>
            }
          />

          <form method="get" className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <input
              className="portal-input xl:col-span-2"
              name="q"
              defaultValue={q}
              placeholder="Search by name or student ID..."
            />

            <select className="portal-select" name="status" defaultValue={status}>
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="withdrawn">Withdrawn</option>
              <option value="graduated">Graduated</option>
            </select>

            <select className="portal-select" name="schoolLevel" defaultValue={schoolLevel}>
              <option value="">All levels</option>
              <option value="primary">Primary</option>
              <option value="o-level">O-Level</option>
              <option value="a-level">A-Level</option>
            </select>

            <select className="portal-select" name="termId" defaultValue={selectedTermId || ""}>
              {terms.map((term: any) => (
                <option key={term.id} value={term.id}>
                  {term.name} {term.is_active ? "(active)" : ""}
                </option>
              ))}
            </select>

            <div className="flex flex-wrap gap-2 md:col-span-2 xl:col-span-5">
              <button className="portal-btn portal-btn-primary" type="submit">
                Filter
              </button>
              <Link className="portal-btn" href="/portal/admin/students/promotions">
                Clear
              </Link>
            </div>
          </form>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="portal-surface p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900">Eligible students</h2>
              <Pill>{students.length} shown</Pill>
            </div>

            <form action={bulkPromoteStudents} className="mt-4 grid gap-4">
              <input type="hidden" name="term_id" value={selectedTermId} />

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <label className="grid gap-1">
                  <span className="text-sm">Target class</span>
                  <select className="portal-select" name="class_id" required>
                    <option value="">Select class</option>
                    {classes.map((cls: any) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} • {cls.level}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-1">
                  <span className="text-sm">Class level</span>
                  <input className="portal-input" name="class_level" placeholder="S2, P6, S5..." />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm">Stream</span>
                  <input className="portal-input" name="stream" placeholder="A, B..." />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm">Track</span>
                  <select className="portal-select" name="track" defaultValue="">
                    <option value="">Select</option>
                    <option value="secular">Secular</option>
                    <option value="islamic">Islamic</option>
                  </select>
                </label>

                <label className="grid gap-1 md:col-span-2 xl:col-span-1">
                  <span className="text-sm">School level</span>
                  <select className="portal-select" name="school_level" defaultValue="">
                    <option value="">Select</option>
                    <option value="primary">Primary</option>
                    <option value="o-level">O-Level</option>
                    <option value="a-level">A-Level</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-3">
                {students.map((student: any) => (
                  <label
                    key={student.id}
                    className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white/80 p-4"
                  >
                    <input type="checkbox" name="student_ids" value={student.id} className="mt-1" />
                    <div className="min-w-0">
                      <div className="text-base font-semibold text-slate-900">
                        {student.full_name}
                      </div>
                      <div className="mt-1 text-sm text-slate-600">
                        {student.student_no || "No ID yet"}
                        {student.class_level ? ` • ${student.class_level}` : ""}
                        {student.stream ? ` • Stream ${student.stream}` : ""}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {student.school_level || "No level"} • {student.status || "No status"}
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <button className="portal-btn portal-btn-primary w-full sm:w-fit" type="submit">
                Promote / move selected students
              </button>
            </form>
          </section>

          <section className="portal-surface p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900">Current term placement</h2>
              <Pill>{enrollments.length} records</Pill>
            </div>

            {selectedTermId ? (
              <div className="mt-4 grid gap-3">
                {enrollments.map((item: any) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-white/80 p-4"
                  >
                    <div className="text-base font-semibold text-slate-900">
                      {item.students?.full_name ?? "Student"}
                    </div>
                    <div className="mt-1 text-sm text-slate-600">
                      {item.students?.student_no || "No ID"} • {item.class_groups?.name ?? "No class"}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {item.class_groups?.level ?? ""} • {item.class_groups?.track_key ?? ""}
                    </div>
                  </div>
                ))}

                {enrollments.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-4 text-sm text-slate-600">
                    No enrollments found for the selected term.
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="mt-4 text-sm text-slate-600">
                Select a term to see current enrollments.
              </div>
            )}
          </section>
        </div>
      </div>
    </WatermarkedSection>
  );
}