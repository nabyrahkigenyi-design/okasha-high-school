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

export default async function ParentLayout({ children }: { children: ReactNode }) {
  await requireRole(["parent"]);

  return (
    <div className="grid gap-4">
      <div className="portal-surface p-4 grid gap-3">
        <div>
          <div className="text-xs font-semibold tracking-widest portal-muted">PARENT PORTAL</div>
          <div className="portal-title">Parent</div>
        </div>

        <div className="-mx-2 flex gap-2 overflow-x-auto px-2 pb-1">
          <NavLink href="/portal/parent/dashboard">Dashboard</NavLink>
          <NavLink href="/portal/parent/children">Children</NavLink>
          <NavLink href="/portal/parent/attendance">Attendance</NavLink>
          <NavLink href="/portal/parent/grades">Grades</NavLink>
        </div>
      </div>

      {children}
    </div>
  );
}