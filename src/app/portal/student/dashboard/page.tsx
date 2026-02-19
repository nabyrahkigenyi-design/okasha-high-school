import { requireRole } from "@/lib/rbac";
import { supabaseServer } from "@/lib/supabase/server";

export default async function StudentDashboard() {
  const me = await requireRole(["student"]);
  const supabase = await supabaseServer();

  // Attendance summary
  const { data: attendance } = await supabase
    .from("attendance")
    .select("status, date")
    .eq("student_id", me.id)
    .order("date", { ascending: false });

  const total = attendance?.length ?? 0;
  const present = attendance?.filter(a => a.status === "present").length ?? 0;
  const absent = attendance?.filter(a => a.status === "absent").length ?? 0;
  const percentage =
    total > 0 ? Math.round((present / total) * 100) : 0;

  const recent = attendance?.slice(0, 5) ?? [];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-white p-5">
        <h1 className="text-xl font-semibold">Student Dashboard</h1>
        <p className="mt-2 text-slate-600">Welcome, {me.full_name}.</p>
      </div>

      <div className="rounded-2xl border bg-white p-5">
        <h2 className="font-semibold">Attendance Summary</h2>
        <div className="mt-3 text-sm space-y-1">
          <p>Total: {total}</p>
          <p>Present: {present}</p>
          <p>Absent: {absent}</p>
          <p className="font-medium">
            Attendance Rate: {percentage}%
          </p>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-5">
        <h2 className="font-semibold">Recent Attendance</h2>
        {recent.length > 0 ? (
          <ul className="mt-3 text-sm space-y-1">
            {recent.map((a, i) => (
              <li key={i}>
                {a.date} — {a.status}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-slate-600">
            No attendance records yet.
          </p>
        )}
      </div>

      <div className="rounded-2xl border bg-white p-5">
        <h2 className="font-semibold">Today's Timetable</h2>
        <p className="mt-2 text-slate-600">
          Timetable feature coming soon.
        </p>
      </div>
    </div>
  );
}
