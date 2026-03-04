// src/app/portal/admin/layout.tsx
import { ReactNode } from "react";
import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import AdminSidebarNav from "./AdminSidebarNav";
import CloseDetailsOnClick from "@/components/CloseDetailsOnClick";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireRole(["admin"]);

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      {/* ✅ MOBILE: collapsible admin menu */}
      <div className="lg:hidden">
        <div className="portal-surface p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Admin
              </div>
              <div className="mt-1 font-semibold text-slate-900 truncate">
                Control Panel
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link className="portal-btn" href="/portal/admin/dashboard">
                Dashboard
              </Link>
            </div>
          </div>

          {/* Mobile menu */}
          <details className="mt-4 group">
            <summary className="list-none">
              <div className="flex items-center justify-between rounded-xl border bg-white/70 px-3 py-2 text-sm font-medium text-slate-900">
                <span>Menu</span>
                <span className="text-slate-500 group-open:rotate-180 transition">
                  ▾
                </span>
              </div>
            </summary>

            <div className="mt-3 rounded-xl border bg-white/70 p-3">
              <CloseDetailsOnClick>
                <AdminSidebarNav />
              </CloseDetailsOnClick>
            </div>
          </details>

          <div className="mt-4 rounded-xl border bg-white/70 p-3 text-xs text-slate-600">
            Tip: Use{" "}
            <span className="font-semibold text-slate-900">Academics</span> to set
            the active term before teachers begin grading.
          </div>
        </div>
      </div>

      {/* ✅ DESKTOP: sticky sidebar */}
      <aside className="hidden lg:block h-fit lg:sticky lg:top-[76px]">
        <div className="portal-surface p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Admin
              </div>
              <div className="mt-1 font-semibold text-slate-900">Control Panel</div>
            </div>

            <Link className="portal-btn" href="/portal/admin/dashboard">
              Dashboard
            </Link>
          </div>

          <div className="mt-4">
            <AdminSidebarNav />
          </div>

          <div className="mt-5 rounded-xl border bg-white/70 p-3 text-xs text-slate-600">
            Tip: Use{" "}
            <span className="font-semibold text-slate-900">Academics</span> to set
            the active term before teachers begin grading.
          </div>
        </div>
      </aside>

      {/* Content */}
      <section className="min-w-0">{children}</section>
    </div>
  );
}