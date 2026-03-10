import { ReactNode } from "react";
import Link from "next/link";
import { requireAuth } from "@/lib/rbac";

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const profile = await requireAuth();

  return (
    <div className="min-h-screen bg-[color:var(--ohs-surface)]">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-3 px-3 py-3 sm:px-4 lg:px-6">
          <Link href="/portal" className="min-w-0">
            <div className="truncate text-sm font-semibold text-slate-900 sm:text-base">
              OHS Portal
            </div>
            <div className="text-xs text-slate-500">
              Signed in as <span className="font-medium">{profile.role_key}</span>
            </div>
          </Link>

          <form action="/auth/logout" method="post">
            <button className="portal-btn portal-btn-danger" type="submit">
              Logout
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto w-full max-w-screen-2xl px-3 py-5 sm:px-4 sm:py-6 lg:px-6">
        {children}
      </main>
    </div>
  );
}