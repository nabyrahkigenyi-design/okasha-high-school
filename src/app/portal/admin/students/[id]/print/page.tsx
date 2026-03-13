import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { WatermarkedSection } from "@/components/WatermarkedSection";
import { getStudentById } from "../../queries";
import PrintButton from "./PrintButton";

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="grid gap-1 border-b border-slate-200 py-3 sm:grid-cols-[180px_1fr] sm:gap-4">
      <div className="text-sm font-semibold text-slate-600">{label}</div>
      <div className="text-sm text-slate-900">{value || "—"}</div>
    </div>
  );
}

function formatSchoolLevel(level: string | null | undefined) {
  if (level === "primary") return "Primary";
  if (level === "o-level") return "O-Level";
  if (level === "a-level") return "A-Level";
  return "—";
}

export default async function AdminStudentPrintPage({
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

  const printedOn = new Date().toLocaleString();

  return (
    <WatermarkedSection tone="portal" variant="mixed">
      <div className="grid gap-6 print:gap-0">
        <section className="portal-surface p-6 print:hidden">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="portal-title">Student Profile Print View</h1>
              <p className="portal-subtitle">
                Printable full profile for {displayName}.
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

        <section className="mx-auto w-full max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none">
          <div className="border-b border-slate-200 pb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="text-2xl font-extrabold tracking-tight text-slate-900">
                  Olive High School
                </div>
                <div className="mt-2 text-sm text-slate-600">
                  Student Profile Record
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Printed on: {printedOn}
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="text-right text-sm text-slate-600">
                  <div>
                    Student ID:{" "}
                    <span className="font-semibold text-slate-900">
                      {student.student_no || "Not assigned"}
                    </span>
                  </div>
                  <div className="mt-1">
                    Status:{" "}
                    <span className="font-semibold text-slate-900">
                      {student.status || "—"}
                    </span>
                  </div>
                </div>

                <div className="h-24 w-24 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                  {student.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={student.photo_url}
                      alt={displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                      No photo
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-6">
            <section className="rounded-2xl border border-slate-200 bg-white/90 p-5">
              <h2 className="text-lg font-semibold text-slate-900">Identity</h2>
              <div className="mt-4">
                <InfoRow label="Full name" value={displayName} />
                <InfoRow label="First name" value={student.first_name || "—"} />
                <InfoRow label="Last name" value={student.last_name || "—"} />
                <InfoRow label="Other names" value={student.other_names || "—"} />
                <InfoRow label="Date of birth" value={student.date_of_birth || "—"} />
                <InfoRow label="Sex" value={student.sex || "—"} />
                <InfoRow label="Religion" value={student.religion || "—"} />
                <InfoRow label="Nationality" value={student.nationality || "—"} />
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white/90 p-5">
              <h2 className="text-lg font-semibold text-slate-900">Home background</h2>
              <div className="mt-4">
                <InfoRow label="Home village / town" value={student.home_village || "—"} />
                <InfoRow label="District" value={student.district || "—"} />
                <InfoRow label="Former school" value={student.former_school || "—"} />
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white/90 p-5">
              <h2 className="text-lg font-semibold text-slate-900">School placement</h2>
              <div className="mt-4">
                <InfoRow label="Student ID" value={student.student_no || "Not assigned"} />
                <InfoRow label="School level" value={formatSchoolLevel(student.school_level)} />
                <InfoRow label="Track" value={student.track || "—"} />
                <InfoRow label="Class level" value={student.class_level || "—"} />
                <InfoRow label="Stream" value={student.stream || "—"} />
                <InfoRow label="Admission year" value={student.admission_year || "—"} />
                <InfoRow label="Graduation year" value={student.graduation_year || "—"} />
                <InfoRow label="Admission date" value={student.admission_date || "—"} />
                <InfoRow label="Status" value={student.status || "—"} />
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white/90 p-5">
              <h2 className="text-lg font-semibold text-slate-900">Notes</h2>
              <div className="mt-4 min-h-[80px] whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-800">
                {student.notes || "No notes recorded."}
              </div>
            </section>
          </div>
        </section>
      </div>
    </WatermarkedSection>
  );
}