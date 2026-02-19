// src/app/portal/admin/layout.tsx
import { ReactNode } from "react";
import Link from "next/link";
import { requireRole } from "@/lib/rbac";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireRole(["admin"]);

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <aside className="rounded-2xl border bg-white p-4 h-fit">
        <div className="font-semibold">Admin</div>
        <nav className="mt-3 grid gap-2 text-sm">
          <Link className="underline" href="/portal/admin/dashboard">Dashboard</Link>
          <Link className="underline" href="/portal/admin/users">Users</Link>
          <Link className="underline" href="/portal/admin/news">News</Link>
          <Link className="underline" href="/portal/admin/staff">Staff</Link>
          <Link className="underline" href="/portal/admin/calendar">Calendar</Link>
          <Link className="underline" href="/portal/admin/policies">Policies</Link>
          <Link className="underline" href="/portal/admin/fees">Fees</Link>
          <Link className="underline" href="/portal/admin/admissions">Admissions</Link>
          <Link className="underline" href="/portal/admin/programs">Programs</Link>
          <Link className="underline" href="/portal/admin/academics">Academics</Link>
        </nav>
      </aside>
      <section>{children}</section>
    </div>
  );
}