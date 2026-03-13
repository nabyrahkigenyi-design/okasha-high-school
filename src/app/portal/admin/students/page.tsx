import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { WatermarkedSection } from "@/components/WatermarkedSection";
import { listStudentsForAdmin, getStudentStats } from "./queries";

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

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div className="mt-2 text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    schoolLevel?: string;
    admissionYear?: string;
    graduationYear?: string;
    show?: string;
  }>;
}) {
  await requireRole(["admin"]);
  const params = await searchParams;

  const q = (params.q ?? "").trim();
  const status = (params.status ?? "").trim();
  const schoolLevel = (params.schoolLevel ?? "").trim();
  const admissionYear = (params.admissionYear ?? "").trim();
  const graduationYear = (params.graduationYear ?? "").trim();
  const showInactive = params.show === "all";

  const [students, stats] = await Promise.all([
    listStudentsForAdmin({
      q,
      status,
      schoolLevel,
      admissionYear,
      graduationYear,
      showInactive,
    }),
    getStudentStats(),
  ]);

  return (
    <WatermarkedSection tone="portal" variant="mixed">
      <div className="grid gap-6">
        <section className="portal-surface p-6">
          <SectionTitle
            title="Students"
            subtitle="Search, filter, and review student profiles."
            right={
              <>
                <Link className="portal-btn portal-btn-primary" href="/portal/admin/students/new">
                  Register Student
                </Link>
                <Link className="portal-btn" href="/portal/admin/students/promotions">
                  Promotions
                </Link>
                <Link className="portal-btn" href="/portal/admin/users">
                  Back to Users
                </Link>
              </>
            }
          />

          <form method="get" className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            <input
              name="q"
              defaultValue={q}
              className="portal-input xl:col-span-2"
              placeholder="Search by name or student ID..."
            />

            <select name="status" defaultValue={status} className="portal-select">
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="withdrawn">Withdrawn</option>
              <option value="graduated">Graduated</option>
            </select>

            <select name="schoolLevel" defaultValue={schoolLevel} className="portal-select">
              <option value="">All levels</option>
              <option value="primary">Primary</option>
              <option value="o-level">O-Level</option>
              <option value="a-level">A-Level</option>
            </select>

            <input
              name="admissionYear"
              defaultValue={admissionYear}
              className="portal-input"
              placeholder="Admission year"
            />

            <input
              name="graduationYear"
              defaultValue={graduationYear}
              className="portal-input"
              placeholder="Graduation year"
            />

            <div className="flex flex-wrap gap-2 md:col-span-2 xl:col-span-6">
              <select
                name="show"
                defaultValue={showInactive ? "all" : "active"}
                className="portal-select"
              >
                <option value="active">Active only</option>
                <option value="all">Include inactive</option>
              </select>

              <button className="portal-btn portal-btn-primary" type="submit">
                Filter
              </button>

              <Link className="portal-btn" href="/portal/admin/students">
                Clear
              </Link>
            </div>
          </form>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Active" value={stats.active} />
          <StatCard label="Suspended" value={stats.suspended} />
          <StatCard label="Withdrawn" value={stats.withdrawn} />
          <StatCard label="Graduated" value={stats.graduated} />
        </div>

        <section className="portal-surface p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Student registry</h2>
            <div className="flex flex-wrap items-center gap-2">
              <Pill>{students.length} shown</Pill>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {students.map((student: any) => {
              const profileHref = `/portal/admin/students/${student.id}`;
              const displayName =
                student.full_name ||
                [student.first_name, student.last_name].filter(Boolean).join(" ") ||
                "Unnamed student";

              return (
                <Link
                  key={student.id}
                  href={profileHref}
                  className="group rounded-2xl border border-slate-200 bg-white/80 p-4 transition hover:border-slate-300 hover:bg-white hover:shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                      {student.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={student.photo_url}
                          alt={displayName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-400">
                          No photo
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="truncate text-base font-semibold text-slate-900 group-hover:text-slate-950">
                          {displayName}
                        </div>
                        {student.status ? <Pill>{student.status}</Pill> : null}
                        {student.school_level ? <Pill>{student.school_level}</Pill> : null}
                      </div>

                      <div className="mt-1 text-sm text-slate-600">
                        {student.student_no ? `ID: ${student.student_no}` : "ID not assigned yet"}
                      </div>

                      <div className="mt-1 text-sm text-slate-600">
                        {student.class_level ? student.class_level : "Class not set"}
                        {student.stream ? ` • Stream ${student.stream}` : ""}
                        {student.track === "islamic"
                          ? " • Islamic"
                          : student.track === "secular"
                            ? " • Secular"
                            : ""}
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        {student.admission_year ? `Admission year: ${student.admission_year}` : "Admission year not set"}
                        {student.graduation_year ? ` • Graduation: ${student.graduation_year}` : ""}
                        {student.date_of_birth ? ` • DOB: ${student.date_of_birth}` : ""}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="portal-btn">Open profile</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}

            {students.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-6 text-sm text-slate-600 lg:col-span-2">
                No students found for the selected filters.
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </WatermarkedSection>
  );
}