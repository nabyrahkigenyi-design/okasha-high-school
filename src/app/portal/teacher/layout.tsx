import Link from "next/link";
import { ReactNode } from "react";
import { requireRole } from "@/lib/rbac";

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link className="portal-btn" href={href}>
      {children}
    </Link>
  );
}

export default async function TeacherLayout({ children }: { children: ReactNode }) {
  await requireRole(["teacher"]);

  return (
    <div className="grid gap-4">
      <div className="portal-surface p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold tracking-widest portal-muted">TEACHER PORTAL</div>
          <div className="portal-title">Teacher Workspace</div>
        </div>

        <div className="flex flex-wrap gap-2">
          <NavLink href="/portal/teacher/dashboard">Dashboard</NavLink>
          <NavLink href="/portal/teacher/classes">My Classes</NavLink>
          <NavLink href="/portal/teacher/timetable">Timetable</NavLink>
          <NavLink href="/portal/teacher/attendance">Attendance</NavLink>
          <NavLink href="/portal/teacher/assignments">Assignments</NavLink>
          <NavLink href="/portal/teacher/grading">Grading</NavLink>
          <NavLink href="/portal/teacher/announcements">Announcements</NavLink>
        </div>
      </div>

      {children}
    </div>
  );
}