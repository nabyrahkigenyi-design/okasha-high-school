import { ReactNode } from "react";
import { requireRole } from "@/lib/rbac";
import AdminSidebarNav from "./AdminSidebarNav";
import CloseDetailsOnClick from "@/components/CloseDetailsOnClick";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireRole(["admin"]);

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      {/* Mobile */}
      <div className="lg:hidden">
        <div className="portal-surface p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Admin
              </div>
              <div className="mt-1 truncate text-base font-semibold text-slate-900">
                School Control Panel
              </div>
              <div className="mt-1 text-sm text-slate-600">
                Manage academics, users, content, and school operations.
              </div>
            </div>
          </div>

          <details className="group mt-4">
            <summary className="list-none">
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/80 px-3 py-2.5 text-sm font-medium text-slate-900">
                <span>Open menu</span>
                <span className="text-slate-500 transition group-open:rotate-180">▾</span>
              </div>
            </summary>

            <div className="mt-3 rounded-xl border border-slate-200 bg-white/80 p-3">
              <CloseDetailsOnClick>
                <AdminSidebarNav />
              </CloseDetailsOnClick>
            </div>
          </details>

          <div className="mt-4 rounded-xl border border-slate-200 bg-white/80 p-3 text-xs text-slate-600">
            Keep the active term correct before managing enrollments, assignments, and grading.
          </div>
        </div>
      </div>

      {/* Desktop */}
      <aside className="hidden h-fit lg:sticky lg:top-[76px] lg:block">
        <div className="portal-surface p-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Admin
            </div>
            <div className="mt-1 text-base font-semibold text-slate-900">
              School Control Panel
            </div>
            <div className="mt-1 text-sm text-slate-600">
              Manage academics, users, content, and school operations.
            </div>
          </div>

          <div className="mt-4">
            <AdminSidebarNav />
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 bg-white/80 p-3 text-xs text-slate-600">
            Keep the active term correct before managing enrollments, assignments, and grading.
          </div>
        </div>
      </aside>

      <section className="min-w-0">{children}</section>
    </div>
  );
}