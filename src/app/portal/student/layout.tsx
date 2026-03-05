import Link from "next/link";
import { ReactNode } from "react";
import { requireRole } from "@/lib/rbac";

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link className="portal-btn whitespace-nowrap" href={href}>
      {children}
    </Link>
  );
}

export default async function StudentLayout({ children }: { children: ReactNode }) {
  await requireRole(["student"]);

  return (
    <div className="grid gap-4">
      <div className="portal-surface p-4 grid gap-3">
        <div>
          <div className="text-xs font-semibold tracking-widest portal-muted">STUDENT PORTAL</div>
          <div className="portal-title">Student</div>
        </div>

        <div className="-mx-2 flex gap-2 overflow-x-auto px-2 pb-1">
          <NavLink href="/portal/student/dashboard">Dashboard</NavLink>
          <NavLink href="/portal/student/assignments">Assignments</NavLink>
          <NavLink href="/portal/student/grades">Grades</NavLink>
          <NavLink href="/portal/student/attendance">Attendance</NavLink>
          <NavLink href="/portal/student/timetable">Timetable</NavLink>
          <NavLink href="/portal/student/announcements">Announcements</NavLink>
        </div>
      </div>

      {children}
    </div>
  );
}