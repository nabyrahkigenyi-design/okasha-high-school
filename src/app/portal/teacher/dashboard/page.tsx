import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { supabaseServer } from "@/lib/supabase/server";

type RelName = { name: string | null } | { name: string | null }[] | null;

type AssignmentRow = {
  id: number;
  class_id: number;
  subject_id: number;
  term_id: number;
  class_groups: RelName;
  subjects: RelName;
};

function relName(v: RelName, fallback: string) {
  if (!v) return fallback;
  if (Array.isArray(v)) return v[0]?.name ?? fallback;
  return v.name ?? fallback;
}

export default async function TeacherDashboard() {
  const me = await requireRole(["teacher"]);
  const supabase = await supabaseServer();

  const { data } = await supabase
    .from("teacher_assignments")
    .select(`
      id,
      class_id,
      subject_id,
      term_id,
      class_groups:class_groups(name),
      subjects:subjects(name)
    `)
    .eq("teacher_id", me.id);

  const assignments = (data ?? []) as AssignmentRow[];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-white p-5">
        <h1 className="text-xl font-semibold">Teacher Dashboard</h1>
        <p className="mt-2 text-slate-600">Welcome, {me.full_name}.</p>
      </div>

      <div className="rounded-2xl border bg-white p-5">
        <h2 className="font-semibold">My Classes</h2>

        {assignments.length > 0 ? (
          <ul className="mt-3 space-y-3 text-sm">
            {assignments.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/portal/teacher/attendance/${a.id}`}
                  className="block border rounded-lg p-3 hover:bg-slate-50"
                >
                  <p className="font-medium">
                    {relName(a.class_groups, "Class")}
                  </p>
                  <p className="text-slate-600">
                    Subject: {relName(a.subjects, "Subject")}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-slate-600">No class assignments yet.</p>
        )}
      </div>
    </div>
  );
}
