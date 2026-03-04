import { ReactNode } from "react";
import Link from "next/link";
import { requireAuth } from "@/lib/rbac";

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const profile = await requireAuth();

  return (
    <div className="min-h-screen bg-[color:var(--ohs-surface)]">
      <header className="sticky top-0 z-40 border-b bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-3 sm:px-4 lg:px-6 py-3">
          <Link href="/portal" className="link-soft font-semibold">
            OHS Portal{" "}
            <span className="text-xs text-slate-500">({profile.role_key})</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link className="portal-btn" href="/portal">
              Home
            </Link>

            <form action="/auth/logout" method="post">
              <button className="portal-btn portal-btn-danger" type="submit">
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-screen-2xl px-3 sm:px-4 lg:px-6 py-5 sm:py-6">
        {children}
      </main>
    </div>
  );
}