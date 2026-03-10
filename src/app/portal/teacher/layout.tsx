import Link from "next/link";
import { ReactNode } from "react";
import { requireRole } from "@/lib/rbac";

type NavItem = {
  href: string;
  label: string;
  shortLabel?: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/portal/teacher/dashboard", label: "Dashboard" },
  { href: "/portal/teacher/classes", label: "My Classes" },
  { href: "/portal/teacher/timetable", label: "Timetable" },
  { href: "/portal/teacher/attendance", label: "Attendance" },
  { href: "/portal/teacher/assignments", label: "Assignments" },
  { href: "/portal/teacher/grading", label: "Grading" },
  { href: "/portal/teacher/announcements", label: "Announcements" },
];

function NavButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link className="portal-btn justify-center" href={href}>
      {children}
    </Link>
  );
}

export default async function TeacherLayout({ children }: { children: ReactNode }) {
  await requireRole(["teacher"]);

  return (
    <div className="grid gap-4 sm:gap-5">
      <section className="portal-surface p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Teacher Portal
            </div>
            <h1 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">
              Teacher Workspace
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              Manage your classes, attendance, assignments, grading, and daily lessons from one place.
            </p>
          </div>

          <div className="hidden lg:grid lg:grid-cols-4 lg:gap-2 xl:grid-cols-7">
            {NAV_ITEMS.map((item) => (
              <NavButton key={item.href} href={item.href}>
                {item.label}
              </NavButton>
            ))}
          </div>
        </div>

        <div className="mt-4 lg:hidden">
          <details className="group">
            <summary className="list-none">
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/80 px-3 py-3 text-sm font-medium text-slate-900">
                <span>Open teacher menu</span>
                <span className="text-slate-500 transition group-open:rotate-180">▾</span>
              </div>
            </summary>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {NAV_ITEMS.map((item) => (
                <NavButton key={item.href} href={item.href}>
                  {item.label}
                </NavButton>
              ))}
            </div>
          </details>
        </div>
      </section>

      {children}
    </div>
  );
}