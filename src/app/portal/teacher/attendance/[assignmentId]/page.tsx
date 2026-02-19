import { requireRole } from "@/lib/rbac";
import { supabaseServer } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

type EnrollmentRow = {
  student_id: string;
  students: { full_name: string | null } | { full_name: string | null }[] | null;
};

function studentName(students: EnrollmentRow["students"]) {
  if (!students) return "Student";
  // Supabase typings sometimes infer relations as arrays
  if (Array.isArray(students)) return students[0]?.full_name ?? "Student";
  return students.full_name ?? "Student";
}

export default async function AttendancePage({
  params,
}: {
  params: { assignmentId: string };
}) {
  const me = await requireRole(["teacher"]);
  const supabase = await supabaseServer();

  const assignmentId = Number(params.assignmentId);

  // Get assignment
  const { data: assignment } = await supabase
    .from("teaching_assignments")
    .select("*")
    .eq("id", assignmentId)
    .eq("teacher_id", me.id)
    .single();

  if (!assignment) return notFound();

  // Get enrolled students
  const { data: enrollments } = await supabase
    .from("enrollments")
    // alias relation so TS is clearer; still handle array/object in UI
    .select("student_id, students:students(full_name)")
    .eq("class_id", assignment.class_id)
    .eq("term_id", assignment.term_id);

  const students = (enrollments ?? []) as EnrollmentRow[];

  return (
    <div className="rounded-2xl border bg-white p-5">
      <h1 className="text-xl font-semibold">Mark Attendance</h1>

      <p className="mt-2 text-slate-600">
        Date: {new Date().toISOString().split("T")[0]}
      </p>

      {students.length === 0 ? (
        <p className="mt-4 text-slate-600">No students enrolled.</p>
      ) : (
        <form
          action={`/portal/teacher/attendance/${assignmentId}/submit`}
          method="post"
          className="mt-4 space-y-3"
        >
          {students.map((s) => (
            <div
              key={s.student_id}
              className="flex items-center justify-between border rounded-lg p-3"
            >
              <span>{studentName(s.students)}</span>

              <select
                name={`status_${s.student_id}`}
                className="border rounded px-2 py-1"
                defaultValue="present"
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
              </select>
            </div>
          ))}

          <button type="submit" className="mt-4 rounded-lg bg-black text-white px-4 py-2">
            Save Attendance
          </button>
        </form>
      )}
    </div>
  );
}
