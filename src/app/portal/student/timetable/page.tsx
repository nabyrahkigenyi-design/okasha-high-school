import { requireRole } from "@/lib/auth/require-role";

export default async function StudentTimetablePage() {
  await requireRole(["student"]);

  return (
    <div className="rounded-2xl border bg-white p-6">
      <div className="text-xs font-semibold tracking-widest text-slate-500">
        TIMETABLE
      </div>
      <h1 className="mt-2 text-xl font-bold text-[color:var(--ohs-charcoal)]">
        Timetable
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Placeholder page. This will show weekly lessons and periods per class.
      </p>
    </div>
  );
}
