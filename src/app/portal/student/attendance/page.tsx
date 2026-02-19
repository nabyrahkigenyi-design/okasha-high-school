import { supabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function StudentAttendancePage({
  searchParams,
}: {
  searchParams: { term?: string };
}) {
const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get student
  const { data: student } = await supabase
    .from("students")
    .select("id, full_name")
    .eq("user_id", user.id)
    .single();

  if (!student) {
    return <div className="p-6">Student profile not found.</div>;
  }

  // Get academic terms
  const { data: terms } = await supabase
    .from("academic_terms")
    .select("id, name")
    .order("id", { ascending: false });

  const selectedTerm =
    searchParams.term || terms?.[0]?.id?.toString();

  // Get attendance for selected term
  const { data: attendance } = await supabase
    .from("attendance_records")
    .select("date, status, subject_id")
    .eq("student_id", student.id)
    .eq("term_id", selectedTerm)
    .order("date", { ascending: false });

  const total = attendance?.length ?? 0;
  const present =
    attendance?.filter((a) => a.status === "present").length ?? 0;
  const absent =
    attendance?.filter((a) => a.status === "absent").length ?? 0;

  const percentage =
    total > 0 ? Math.round((present / total) * 100) : 0;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">
        Attendance History
      </h1>

      {/* Term Filter */}
      <form>
        <select
          name="term"
          defaultValue={selectedTerm}
          className="border rounded px-3 py-2"
          onChange={(e) => e.currentTarget.form?.submit()}
        >
          {terms?.map((term) => (
            <option key={term.id} value={term.id}>
              {term.name}
            </option>
          ))}
        </select>
      </form>

      {/* Summary */}
      <div className="bg-white shadow rounded-lg p-4">
        <p>Total: {total}</p>
        <p>Present: {present}</p>
        <p>Absent: {absent}</p>
        <p className="font-semibold">
          Attendance Rate: {percentage}%
        </p>
      </div>

      {/* Attendance Table */}
      <div className="bg-white shadow rounded-lg p-4 overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-3 py-2 text-left">Date</th>
              <th className="border px-3 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {!attendance?.length && (
              <tr>
                <td colSpan={2} className="text-center py-4">
                  No records found.
                </td>
              </tr>
            )}

            {attendance?.map((record, idx) => (
              <tr key={idx}>
                <td className="border px-3 py-2">
                  {record.date}
                </td>
                <td
                  className={`border px-3 py-2 ${
                    record.status === "present"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {record.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
