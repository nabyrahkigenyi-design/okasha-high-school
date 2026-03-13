import { ReactNode } from "react";
import { requireRole } from "@/lib/rbac";
import { WatermarkedSection } from "@/components/WatermarkedSection";
import { getSchoolDashboardSnapshot } from "./queries";

function money(n: number) {
  return new Intl.NumberFormat("en-UG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n || 0);
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
    <div className="rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm sm:p-5">
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
        {value}
      </div>
      {hint ? <div className="mt-1 text-sm text-slate-600">{hint}</div> : null}
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="portal-surface p-4 sm:p-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
      </div>

      <div className="mt-4">{children}</div>
    </section>
  );
}

function TrackBadge({ track }: { track: "secular" | "islamic" }) {
  return (
    <span
      className={`portal-badge ${
        track === "islamic" ? "portal-badge-islamic" : "portal-badge-secular"
      }`}
    >
      {track === "islamic" ? "Islamic Theology" : "Secular"}
    </span>
  );
}

function EnrollmentRow({
  className,
  level,
  track,
  count,
  totalStudents,
}: {
  className: string;
  level?: string | null;
  track: "secular" | "islamic";
  count: number;
  totalStudents: number;
}) {
  const percentage = totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0;
  const width = totalStudents > 0 ? Math.max(6, percentage) : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/70 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="truncate text-base font-semibold text-slate-900">{className}</div>
            <TrackBadge track={track} />
          </div>

          <div className="mt-1 text-sm text-slate-600">
            {level ? `${level} • ` : ""}
            {count} enrolled student{count === 1 ? "" : "s"}
          </div>
        </div>

        <div className="text-sm font-medium text-slate-700">{percentage}%</div>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-[color:var(--ohs-dark-green)]"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function AnnouncementCard({ item }: { item: any }) {
  const scope = item.class_groups?.name
    ? `${item.class_groups.name}`
    : item.academic_terms?.name
      ? `${item.academic_terms.name} • General`
      : "General";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/70 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="text-base font-semibold text-slate-900">{item.title}</div>
          <div className="mt-1 text-xs text-slate-500">
            {scope} • {new Date(item.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>

      <p className="mt-3 line-clamp-3 text-sm text-slate-700">{item.body}</p>
    </div>
  );
}

function TimetableTable({ items }: { items: any[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white/80">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="bg-slate-50 text-slate-700">
          <tr>
            <th className="px-4 py-3 font-semibold">Day</th>
            <th className="px-4 py-3 font-semibold">Period</th>
            <th className="px-4 py-3 font-semibold">Time</th>
            <th className="px-4 py-3 font-semibold">Class</th>
            <th className="px-4 py-3 font-semibold">Subject</th>
            <th className="px-4 py-3 font-semibold">Teacher</th>
            <th className="px-4 py-3 font-semibold">Room</th>
          </tr>
        </thead>
        <tbody>
          {items.map((row) => (
            <tr key={row.id} className="border-t border-slate-200">
              <td className="px-4 py-3 text-slate-700">{row.day_label}</td>
              <td className="px-4 py-3 text-slate-700">{row.period_no ?? "—"}</td>
              <td className="px-4 py-3 text-slate-700">
                {row.start_time && row.end_time
                  ? `${row.start_time.slice(0, 5)} - ${row.end_time.slice(0, 5)}`
                  : "—"}
              </td>
              <td className="px-4 py-3">
                <div className="font-medium text-slate-900">{row.class_groups?.name ?? "—"}</div>
                <div className="text-xs text-slate-500">{row.class_groups?.level ?? ""}</div>
              </td>
              <td className="px-4 py-3 text-slate-700">
                {row.subjects?.code ? `${row.subjects.code} — ` : ""}
                {row.subjects?.name ?? "—"}
              </td>
              <td className="px-4 py-3 text-slate-700">{row.teachers?.full_name ?? "—"}</td>
              <td className="px-4 py-3 text-slate-700">{row.room ?? "—"}</td>
            </tr>
          ))}

          {items.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-6 text-center text-sm text-slate-500">
                No timetable slots available.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

function MiniBar({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-slate-600">
          {value} ({percentage}%)
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-[color:var(--ohs-dark-green)]"
          style={{ width: `${Math.max(0, percentage)}%` }}
        />
      </div>
    </div>
  );
}

export default async function AdminDashboard() {
  const me = await requireRole(["admin"]);
  const data = await getSchoolDashboardSnapshot();

  const secularEnrollment = data.enrollmentByClass.filter(
    (item: any) => item.track_key === "secular"
  );

  const islamicEnrollment = data.enrollmentByClass.filter(
    (item: any) => item.track_key === "islamic"
  );

  const emptyClasses = data.enrollmentByClass.filter(
    (item: any) => item.enrolled_count === 0
  ).length;

  const attendanceRate =
    data.attendanceSummary.totalMarked > 0
      ? Math.round((data.attendanceSummary.present / data.attendanceSummary.totalMarked) * 100)
      : 0;

  const studentStatusTotal =
    data.studentStatusSummary.active +
    data.studentStatusSummary.suspended +
    data.studentStatusSummary.withdrawn +
    data.studentStatusSummary.graduated;

  return (
    <WatermarkedSection tone="portal" variant="mixed">
      <div className="grid gap-6">
        <section className="portal-surface p-4 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <h1 className="portal-title">Admin Dashboard</h1>
              <p className="portal-subtitle">
                Welcome back, <span className="font-semibold text-slate-900">{me.full_name}</span>.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="portal-badge">
                Today: {new Date(data.today).toLocaleDateString()}
              </span>
              {data.activeTerm ? (
                <span className="portal-badge portal-badge-secular">
                  Active term: {data.activeTerm.name}
                </span>
              ) : (
                <span className="portal-badge">No active term</span>
              )}
              {data.activeTerm?.days_until_end != null ? (
                <span className="portal-badge">
                  {data.activeTerm.days_until_end >= 0
                    ? `Term ends in ${data.activeTerm.days_until_end} day${data.activeTerm.days_until_end === 1 ? "" : "s"}`
                    : "Term end date passed"}
                </span>
              ) : null}
            </div>
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <StatCard label="Staff" value={data.staffCount} hint="Admins + teachers" />
          <StatCard label="Teachers" value={data.teacherCount} hint="Active teaching staff" />
          <StatCard label="Parents" value={data.parentCount} hint="Registered parent accounts" />
          <StatCard label="Students" value={data.studentCount} hint="Active learners" />
          <StatCard label="Classes" value={data.classCount} hint="Currently active classes" />
          <StatCard
            label="Attendance today"
            value={`${attendanceRate}%`}
            hint={`${data.attendanceSummary.present} present • ${data.attendanceSummary.absent} absent • ${data.attendanceSummary.sick} sick`}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <SectionCard
            title="School overview"
            subtitle="A quick operational summary for the current school term."
          >
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white/75 p-4">
                <div className="text-sm font-semibold text-slate-900">Current term</div>
                <div className="mt-2 text-sm text-slate-700">
                  {data.activeTerm ? (
                    <>
                      <div className="font-medium text-slate-900">{data.activeTerm.name}</div>
                      <div className="mt-1">
                        {data.activeTerm.starts_on} → {data.activeTerm.ends_on}
                      </div>
                      {data.activeTerm.days_until_end != null ? (
                        <div className="mt-1 text-xs text-slate-500">
                          {data.activeTerm.days_until_end >= 0
                            ? `${data.activeTerm.days_until_end} day${data.activeTerm.days_until_end === 1 ? "" : "s"} remaining`
                            : "End date passed"}
                        </div>
                      ) : null}
                    </>
                  ) : (
                    "No active term has been set."
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/75 p-4">
                <div className="text-sm font-semibold text-slate-900">Enrollment coverage</div>
                <div className="mt-2 text-sm text-slate-700">
                  {emptyClasses > 0
                    ? `${emptyClasses} class${emptyClasses === 1 ? "" : "es"} currently have no enrolled students.`
                    : "All active classes currently have enrolled students."}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/75 p-4">
                <div className="text-sm font-semibold text-slate-900">Announcements</div>
                <div className="mt-2 text-sm text-slate-700">
                  {data.announcements.length} recent announcement
                  {data.announcements.length === 1 ? "" : "s"} available.
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/75 p-4">
                <div className="text-sm font-semibold text-slate-900">Timetable slots</div>
                <div className="mt-2 text-sm text-slate-700">
                  {data.weeklyTimetable.length} lesson slot
                  {data.weeklyTimetable.length === 1 ? "" : "s"} in the active term timetable.
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Finance snapshot"
            subtitle="Current term fee collection and spending overview."
          >
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white/75 p-4">
                <div className="text-sm font-semibold text-slate-900">Expected fees</div>
                <div className="mt-2 text-lg font-bold text-slate-900">
                  UGX {money(data.financeSummary.expected)}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/75 p-4">
                <div className="text-sm font-semibold text-slate-900">Collected</div>
                <div className="mt-2 text-lg font-bold text-slate-900">
                  UGX {money(data.financeSummary.paid)}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/75 p-4">
                <div className="text-sm font-semibold text-slate-900">Outstanding balance</div>
                <div className="mt-2 text-lg font-bold text-slate-900">
                  UGX {money(data.financeSummary.balance)}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/75 p-4">
                <div className="text-sm font-semibold text-slate-900">Expenses</div>
                <div className="mt-2 text-lg font-bold text-slate-900">
                  UGX {money(data.financeSummary.expenses)}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/75 p-4">
                <div className="text-sm font-semibold text-slate-900">Net</div>
                <div className="mt-2 text-lg font-bold text-slate-900">
                  UGX {money(data.financeSummary.net)}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/75 p-4">
                <div className="text-sm font-semibold text-slate-900">Collection rate</div>
                <div className="mt-2 text-lg font-bold text-slate-900">
                  {data.financeSummary.collectionPercentage}%
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <SectionCard
            title="Student status overview"
            subtitle="A quick view of active, suspended, withdrawn, and graduated students."
          >
            <div className="grid gap-4">
              <MiniBar
                label="Active"
                value={data.studentStatusSummary.active}
                total={studentStatusTotal}
              />
              <MiniBar
                label="Suspended"
                value={data.studentStatusSummary.suspended}
                total={studentStatusTotal}
              />
              <MiniBar
                label="Withdrawn"
                value={data.studentStatusSummary.withdrawn}
                total={studentStatusTotal}
              />
              <MiniBar
                label="Graduated"
                value={data.studentStatusSummary.graduated}
                total={studentStatusTotal}
              />
            </div>
          </SectionCard>

          <SectionCard
            title="Attendance today"
            subtitle="Attendance summary based on teacher-marked sessions for today."
          >
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <StatCard
                label="Present"
                value={data.attendanceSummary.present}
                hint="Marked present"
              />
              <StatCard
                label="Absent"
                value={data.attendanceSummary.absent}
                hint="Marked absent"
              />
              <StatCard
                label="Late"
                value={data.attendanceSummary.late}
                hint="Marked late"
              />
              <StatCard
                label="Sick"
                value={data.attendanceSummary.sick}
                hint="Marked sick"
              />
              <StatCard
                label="Marked"
                value={data.attendanceSummary.totalMarked}
                hint="Total attendance marks today"
              />
            </div>
          </SectionCard>
        </div>

        <SectionCard
          title="Enrollment by class"
          subtitle={
            data.activeTerm
              ? `Student distribution for ${data.activeTerm.name}.`
              : "Set an active term to view enrollment by class."
          }
        >
          {!data.activeTerm ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-5 text-sm text-slate-600">
              No active term is selected yet. Once an active term is set, this section will show
              student totals for each class.
            </div>
          ) : (
            <div className="grid gap-6 xl:grid-cols-2">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <div className="text-sm font-semibold text-slate-900">Secular classes</div>
                  <TrackBadge track="secular" />
                </div>

                <div className="grid gap-3">
                  {secularEnrollment.length > 0 ? (
                    secularEnrollment.map((item: any) => (
                      <EnrollmentRow
                        key={item.id}
                        className={item.name}
                        level={item.level}
                        track="secular"
                        count={item.enrolled_count}
                        totalStudents={data.studentCount}
                      />
                    ))
                  ) : (
                    <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm text-slate-600">
                      No secular classes found.
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center gap-2">
                  <div className="text-sm font-semibold text-slate-900">
                    Islamic theology classes
                  </div>
                  <TrackBadge track="islamic" />
                </div>

                <div className="grid gap-3">
                  {islamicEnrollment.length > 0 ? (
                    islamicEnrollment.map((item: any) => (
                      <EnrollmentRow
                        key={item.id}
                        className={item.name}
                        level={item.level}
                        track="islamic"
                        count={item.enrolled_count}
                        totalStudents={data.studentCount}
                      />
                    ))
                  ) : (
                    <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm text-slate-600">
                      No Islamic theology classes found.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </SectionCard>

        <div className="grid gap-6 xl:grid-cols-[1fr_1.25fr]">
          <SectionCard
            title="Recent announcements"
            subtitle="Latest notices created for the school portal."
          >
            <div className="grid gap-3">
              {data.announcements.length > 0 ? (
                data.announcements.map((item: any) => (
                  <AnnouncementCard key={item.id} item={item} />
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-5 text-sm text-slate-600">
                  No announcements available yet.
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Weekly school timetable"
            subtitle={
              data.activeTerm
                ? `General timetable for ${data.activeTerm.name}.`
                : "Set an active term to show the weekly timetable."
            }
          >
            {!data.activeTerm ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-5 text-sm text-slate-600">
                No active term is selected yet. Once an active term is set, the weekly timetable
                will appear here.
              </div>
            ) : (
              <TimetableTable items={data.weeklyTimetable} />
            )}
          </SectionCard>
        </div>
      </div>
    </WatermarkedSection>
  );
}