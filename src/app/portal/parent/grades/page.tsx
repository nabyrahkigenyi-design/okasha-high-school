import { requireRole } from "@/lib/auth/require-role";

export default async function ParentGradesPage() {
  await requireRole(["parent"]);

  return (
    <div className="rounded-2xl border bg-white p-6">
      <div className="text-xs font-semibold tracking-widest text-slate-500">
        GRADES
      </div>
      <h1 className="mt-2 text-xl font-bold text-[color:var(--ohs-charcoal)]">
        Grades Overview
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Placeholder page. This will show subject grades per term, teacher remarks,
        and downloadable report cards (future).
      </p>
    </div>
  );
}
