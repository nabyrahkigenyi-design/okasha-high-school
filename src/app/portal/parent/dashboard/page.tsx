import { requireRole } from "@/lib/rbac";
import { supabaseServer } from "@/lib/supabase/server";

export default async function ParentDashboard() {
  const me = await requireRole(["parent"]);
  const supabase = await supabaseServer();

  const { data: links } = await supabase
    .from("parent_students")
    .select("student_id")
    .eq("parent_id", me.id);

  const studentIds = links?.map(l => l.student_id) ?? [];

  const { data: students } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", studentIds);

  const { data: attendance } = await supabase
    .from("attendance")
    .select("student_id, status")
    .in("student_id", studentIds);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-white p-5">
        <h1 className="text-xl font-semibold">Parent Dashboard</h1>
        <p className="mt-2 text-slate-600">Welcome, {me.full_name}.</p>
      </div>

      <div className="rounded-2xl border bg-white p-5">
        <h2 className="font-semibold">My Children</h2>

        {students && students.length > 0 ? (
          <ul className="mt-3 space-y-3 text-sm">
            {students.map(child => {
              const records =
                attendance?.filter(a => a.student_id === child.id) ?? [];

              const total = records.length;
              const present = records.filter(
                r => r.status === "present"
              ).length;

              const percentage =
                total > 0 ? Math.round((present / total) * 100) : 0;

              return (
                <li key={child.id} className="border rounded-lg p-3">
                  <p className="font-medium">{child.full_name}</p>
                  <p className="text-slate-600">
                    Attendance Rate: {percentage}% ({present}/{total})
                  </p>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-2 text-slate-600">
            No children linked yet.
          </p>
        )}
      </div>
    </div>
  );
}
