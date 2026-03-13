import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import PrintButton from "./PrintButton";
import { WatermarkedSection } from "@/components/WatermarkedSection";
import { getStudentById } from "../../queries";

function InfoLine({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 text-sm">
      <div className="font-semibold text-slate-700">{label}</div>
      <div className="text-slate-900">{value || "—"}</div>
    </div>
  );
}

function formatSchoolLevel(level: string | null | undefined) {
  if (level === "primary") return "Primary";
  if (level === "o-level") return "O-Level";
  if (level === "a-level") return "A-Level";
  return "—";
}

export default async function AdminStudentAdmissionLetterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["admin"]);

  const { id } = await params;
  const student = await getStudentById(id);

  if (!student) {
    return (
      <WatermarkedSection tone="portal" variant="mixed">
        <section className="portal-surface p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="portal-title">Student not found</h1>
              <p className="portal-subtitle">
                The requested student record does not exist.
              </p>
            </div>

            <Link className="portal-btn" href="/portal/admin/students">
              Back to Students
            </Link>
          </div>
        </section>
      </WatermarkedSection>
    );
  }

  const displayName =
    student.full_name ||
    [student.first_name, student.last_name].filter(Boolean).join(" ") ||
    "Student";

  const today = new Date().toLocaleDateString();

  const placement = [
    student.class_level,
    student.stream ? `Stream ${student.stream}` : null,
    student.track === "islamic" ? "Islamic" : student.track === "secular" ? "Secular" : null,
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <WatermarkedSection tone="portal" variant="mixed">
      <div className="grid gap-6 print:gap-0">
        <section className="portal-surface p-6 print:hidden">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="portal-title">Admission Letter</h1>
              <p className="portal-subtitle">
                Printable admission letter for {displayName}.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link className="portal-btn" href={`/portal/admin/students/${student.id}`}>
                Back to Profile
              </Link>
              <PrintButton />
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none">
          <div className="border-b border-slate-200 pb-6">
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="text-2xl font-extrabold tracking-tight text-slate-900">
                  Olive High School
                </div>
                <div className="mt-2 text-sm leading-6 text-slate-600">
                  Official Admission Letter
                  <br />
                  Date: {today}
                </div>
              </div>

              <div className="text-right text-sm text-slate-600">
                Ref: {student.student_no || "Pending ID"}
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-6">
            <div>
              <div className="text-sm text-slate-700">Dear Parent/Guardian,</div>
              <p className="mt-3 text-sm leading-7 text-slate-800">
                We are pleased to inform you that{" "}
                <span className="font-semibold">{displayName}</span> has been
                admitted to Olive High School.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
              <div className="mb-4 text-base font-semibold text-slate-900">
                Student Admission Details
              </div>

              <div className="grid gap-3">
                <InfoLine label="Student Name" value={displayName} />
                <InfoLine label="Student ID" value={student.student_no || "To be assigned"} />
                <InfoLine label="School Level" value={formatSchoolLevel(student.school_level)} />
                <InfoLine label="Class Placement" value={placement || "To be confirmed"} />
                <InfoLine label="Admission Year" value={student.admission_year || "—"} />
                <InfoLine label="Admission Date" value={student.admission_date || "—"} />
                <InfoLine label="Date of Birth" value={student.date_of_birth || "—"} />
                <InfoLine label="Former School" value={student.former_school || "—"} />
              </div>
            </div>

            <div>
              <div className="text-base font-semibold text-slate-900">
                Reporting Instructions
              </div>
              <div className="mt-3 space-y-2 text-sm leading-7 text-slate-800">
                <p>
                  Please ensure that the student reports to school on the official
                  reporting date communicated by the administration.
                </p>
                <p>
                  The student should come with all required scholastic materials,
                  uniforms, and any documents requested by the school office.
                </p>
                <p>
                  School fees and other requirements should be cleared according to
                  the school guidelines before or during reporting.
                </p>
              </div>
            </div>

            <div>
              <div className="text-base font-semibold text-slate-900">
                Important Note
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-800">
                This admission remains valid subject to compliance with the school’s
                rules, financial requirements, and reporting procedures.
              </p>
            </div>

            <div className="pt-8">
              <div className="text-sm text-slate-800">Yours faithfully,</div>
              <div className="mt-8 text-sm font-semibold text-slate-900">
                Administration
              </div>
              <div className="text-sm text-slate-600">Olive High School</div>
            </div>
          </div>
        </section>
      </div>
    </WatermarkedSection>
  );
}