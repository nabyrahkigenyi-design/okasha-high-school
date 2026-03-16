import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { WatermarkedSection } from "@/components/WatermarkedSection";
import { ToastGate } from "@/components/ToastGate";
import {
  listStaffTitles,
  listTeachers,
  getTeacherStats,
} from "./queries";

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

export default async function AdminStaffInternalPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    show?: string;
    titleId?: string;
    ok?: string;
    err?: string;
  }>;
}) {
  await requireRole(["admin"]);
  const sp = await searchParams;

  const q = (sp.q ?? "").trim();
  const titleId = (sp.titleId ?? "").trim();
  const showInactive = sp.show === "all";

  const [titles, teachers, stats] = await Promise.all([
    listStaffTitles(),
    listTeachers({
      q,
      includeInactive: showInactive,
      titleId,
    }),
    getTeacherStats(),
  ]);

  return (
    <WatermarkedSection tone="portal" variant="mixed">
      <ToastGate ok={sp.ok} err={sp.err} okText="Saved." />

      <div className="grid gap-6">
        <section className="portal-surface p-6">
          <SectionTitle
            title="Staff Internal"
            subtitle="Manage internal teaching staff records, profiles, salaries, and portal accounts."
            right={
              <>
                <Link className="portal-btn" href="/portal/admin/academics?tab=assignments">
                  Subject Assignments
                </Link>
                <Link className="portal-btn" href="/portal/admin/academics?tab=class-teachers">
                  Class Teachers
                </Link>
              </>
            }
          />

          <form method="get" className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <input
              name="q"
              defaultValue={q}
              className="portal-input xl:col-span-2"
              placeholder="Search by name, staff no, phone, email, subject..."
            />

            <select name="titleId" defaultValue={titleId} className="portal-select">
              <option value="">All titles</option>
              {titles.map((title: any) => (
                <option key={title.id} value={title.id}>
                  {title.title_name}
                </option>
              ))}
            </select>

            <select
              name="show"
              defaultValue={showInactive ? "all" : "active"}
              className="portal-select"
            >
              <option value="active">Active only</option>
              <option value="all">Include inactive</option>
            </select>

            <div className="flex flex-wrap gap-2">
              <button className="portal-btn portal-btn-primary" type="submit">
                Filter
              </button>
              <Link className="portal-btn" href="/portal/admin/staff-internal">
                Clear
              </Link>
            </div>
          </form>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Active" value={stats.active} />
          <StatCard label="Inactive" value={stats.inactive} />
          <StatCard label="Theology" value={stats.theology} />
          <StatCard label="Secular" value={stats.secular} />
        </div>

        <section className="portal-surface p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Staff registry</h2>
            <div className="flex flex-wrap gap-2">
              <Pill>{teachers.length} shown</Pill>
              <Link className="portal-btn portal-btn-primary" href="/portal/admin/staff-internal/new">
                Register Staff
              </Link>
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            {teachers.map((teacher: any) => {
              const titleName =
                Array.isArray(teacher.staff_titles)
                  ? teacher.staff_titles[0]?.title_name
                  : teacher.staff_titles?.title_name;

              return (
                <Link
                  key={teacher.id}
                  href={`/portal/admin/staff-internal/${teacher.id}`}
                  className="block rounded-2xl border border-slate-200 bg-white/80 p-4 transition hover:border-slate-300 hover:shadow-sm"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-base font-semibold text-slate-900">
                          {teacher.full_name}
                        </div>
                        {titleName ? <Pill>{titleName}</Pill> : null}
                        {teacher.is_active ? <Pill>active</Pill> : <Pill>inactive</Pill>}
                        {teacher.secular_role ? <Pill>Secular</Pill> : null}
                        {teacher.theology_role ? <Pill>Theology</Pill> : null}
                      </div>

                      <div className="mt-1 text-sm text-slate-600">
                        {teacher.staff_no ? `Staff No: ${teacher.staff_no}` : "No staff number"}
                        {teacher.department ? ` • ${teacher.department}` : ""}
                        {teacher.phone ? ` • ${teacher.phone}` : ""}
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        {teacher.qualification ? `Qualification: ${teacher.qualification}` : ""}
                        {teacher.residence ? ` • Residence: ${teacher.residence}` : ""}
                        {teacher.salary_amount != null
                          ? ` • Salary: ${teacher.salary_amount}${teacher.salary_frequency ? ` / ${teacher.salary_frequency}` : ""}`
                          : ""}
                      </div>
                    </div>

                    <div className="text-sm text-slate-500">Open profile</div>
                  </div>
                </Link>
              );
            })}

            {teachers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-6 text-sm text-slate-600">
                No staff found for the selected filters.
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </WatermarkedSection>
  );
}
