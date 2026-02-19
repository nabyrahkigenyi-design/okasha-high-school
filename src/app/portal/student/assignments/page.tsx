import { requireRole } from "@/lib/auth/require-role";

export default async function StudentAssignmentsPage() {
  await requireRole(["student"]);

  return (
    <div className="rounded-2xl border bg-white p-6">
      <div className="text-xs font-semibold tracking-widest text-slate-500">
        ASSIGNMENTS
      </div>
      <h1 className="mt-2 text-xl font-bold text-[color:var(--ohs-charcoal)]">
        Assignments
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Placeholder page. This will show class assignments, due dates, and file
        submissions (future).
      </p>
    </div>
  );
}
