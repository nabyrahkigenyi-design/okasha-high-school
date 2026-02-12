import { ReactNode } from "react";
import { requireAuth } from "@/lib/rbac";

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const profile = await requireAuth();

  return (
    <div className="min-h-screen bg-[color:var(--ohs-surface)]">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="font-semibold">
            OHS Portal <span className="text-xs text-slate-500">({profile.role_key})</span>
          </div>
          <form action="/auth/logout" method="post">
            <button className="text-sm underline">Logout</button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
