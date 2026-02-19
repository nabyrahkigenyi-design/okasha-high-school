import { requireRole } from "@/lib/auth/require-role";

export default async function ParentAttendancePage() {
  await requireRole(["parent"]);

  return (
    <div className="rounded-2xl border bg-white p-6">
      <div className="text-xs font-semibold tracking-widest text-slate-500">
        ATTENDANCE
      </div>
      <h1 className="mt-2 text-xl font-bold text-[color:var(--ohs-charcoal)]">
        Attendance Overview
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Placeholder page. This will show daily attendance records for your child
        (present/absent/late), with term filters.
      </p>
    </div>
  );
}
