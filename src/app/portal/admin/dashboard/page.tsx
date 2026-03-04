import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { WatermarkedSection } from "@/components/WatermarkedSection";

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border bg-white/80 p-5 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div className="mt-2 text-2xl font-extrabold text-slate-900">{value}</div>
      {hint ? <div className="mt-1 text-sm text-slate-600">{hint}</div> : null}
    </div>
  );
}

function QuickCard({
  title,
  desc,
  href,
}: {
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border bg-white/80 p-5 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-semibold text-slate-900 group-hover:text-slate-950">
            {title}
          </div>
          <div className="mt-1 text-sm text-slate-600">{desc}</div>
        </div>

        <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl border bg-white text-slate-700 transition group-hover:border-slate-300 group-hover:text-slate-900">
          →
        </span>
      </div>
    </Link>
  );
}

function Tip({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-white/80 p-5 shadow-sm">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <div className="mt-2 text-sm text-slate-700">{children}</div>
    </div>
  );
}

export default async function AdminDashboard() {
  const me = await requireRole(["admin"]);

  // Keep dashboard server-safe: no extra queries yet.
  // We can hook real counts later (students, teachers, classes, etc.).
  const now = new Date();
  const today = now.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <WatermarkedSection tone="portal" variant="mixed">
      <div className="grid gap-6">
        {/* Header */}
        <section className="portal-surface p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="portal-title">Admin Dashboard</h1>
              <p className="portal-subtitle">
                Welcome back,{" "}
                <span className="font-semibold text-slate-900">{me.full_name}</span>.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link className="portal-btn portal-btn-primary" href="/portal/admin/academics">
                Academics
              </Link>
              <Link className="portal-btn" href="/portal/admin/users">
                Users
              </Link>
              <Link className="portal-btn" href="/portal/admin/news">
                News
              </Link>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="portal-badge">Role: Admin</span>
            <span className="portal-badge">Today: {today}</span>
            <span className="portal-badge portal-badge-secular">Portal: Online</span>
          </div>
        </section>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="System status" value="Online" hint="All modules available" />
          <StatCard label="Security" value="RBAC" hint="Server-enforced role checks" />
          <StatCard label="Caching" value="Optimized" hint="Public pages cached, portal dynamic" />
        </div>

        {/* Quick actions */}
        <section className="portal-surface p-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Quick actions</h2>
              <p className="mt-1 text-sm text-slate-600">
                Jump straight into what you manage most.
              </p>
            </div>
            <Link className="text-sm underline" href="/portal/admin/settings">
              Go to Settings
            </Link>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <QuickCard
              title="Academics"
              desc="Terms, classes, subjects, assignments, enrollments"
              href="/portal/admin/academics"
            />
            <QuickCard
              title="Admissions"
              desc="Update admissions content and requirements"
              href="/portal/admin/admissions"
            />
            <QuickCard
              title="Calendar"
              desc="School events and term schedules"
              href="/portal/admin/calendar"
            />
            <QuickCard
              title="Fees"
              desc="Tuition & fees guide management"
              href="/portal/admin/fees"
            />
            <QuickCard
              title="News"
              desc="Publish announcements and updates"
              href="/portal/admin/news"
            />
            <QuickCard
              title="Policies"
              desc="Upload and manage school policies"
              href="/portal/admin/policies"
            />
            <QuickCard
              title="Programs"
              desc="Secular + Islamic track programs"
              href="/portal/admin/programs"
            />
            <QuickCard
              title="Staff"
              desc="Staff directory and profiles"
              href="/portal/admin/staff"
            />
            <QuickCard
              title="Users"
              desc="Admins, teachers, students, parents"
              href="/portal/admin/users"
            />
          </div>
        </section>

        {/* Premium “control center” row */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Tip title="Recommended workflow">
            <ol className="list-decimal space-y-1 pl-5">
              <li>
                In <span className="font-semibold">Academics</span>, set the active term.
              </li>
              <li>Create classes and subjects for both tracks.</li>
              <li>Assign teachers to classes/subjects.</li>
              <li>Enroll students in the correct class per term.</li>
            </ol>
          </Tip>

          <Tip title="Today’s checklist">
            <ul className="list-disc space-y-1 pl-5">
              <li>Confirm the active term is correct.</li>
              <li>Check News for announcements that need publishing.</li>
              <li>Verify Calendar has upcoming school events.</li>
            </ul>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link className="portal-btn" href="/portal/admin/academics">
                Check Term
              </Link>
              <Link className="portal-btn" href="/portal/admin/news">
                Post News
              </Link>
              <Link className="portal-btn" href="/portal/admin/calendar">
                Update Calendar
              </Link>
            </div>
          </Tip>

          <Tip title="Next upgrades (optional)">
            <ul className="list-disc space-y-1 pl-5">
              <li>Show real counts (students, teachers, classes, enrollments).</li>
              <li>Show “recent admin actions” activity feed.</li>
              <li>Highlight missing setup (no active term, no classes, etc.).</li>
            </ul>
          </Tip>
        </div>
      </div>
    </WatermarkedSection>
  );
}