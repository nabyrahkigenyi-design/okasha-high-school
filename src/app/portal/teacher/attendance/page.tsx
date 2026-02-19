import { requireRole } from "@/lib/rbac";
import { ensureSession, saveMarks } from "./actions";
import { getAssignmentOrNull, getMarks, getSession, listEnrolledStudents } from "./queries";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default async function TeacherAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ assignmentId?: string; date?: string }>;
}) {
  await requireRole(["teacher"]);

  const params = await searchParams;
  const assignmentId = params.assignmentId ? Number(params.assignmentId) : 0;
  const date = params.date ?? todayISO();

  if (!assignmentId) {
    return (
      <div className="rounded-2xl border bg-white p-5">
        Missing assignment. Go to “My classes”.
      </div>
    );
  }

  const assignment = await getAssignmentOrNull(assignmentId);
  if (!assignment) {
    return (
      <div className="rounded-2xl border bg-white p-5">
        You do not have access to this assignment.
      </div>
    );
  }

  const students = await listEnrolledStudents(assignment.term_id, assignment.class_id);
  const session = await getSession(assignmentId, date);
  const marks = session ? await getMarks(session.id) : new Map();

  return (
    <div className="grid gap-6">
      <section className="rounded-2xl border bg-white p-5">
        <h1 className="text-xl font-semibold">Attendance</h1>

        <form action={ensureSession} className="mt-3 flex flex-wrap items-end gap-3">
          <input type="hidden" name="assignmentId" value={assignmentId} />
          <label className="grid gap-1">
            <span className="text-sm">Date</span>
            <input className="rounded-lg border px-3 py-2" type="date" name="sessionDate" defaultValue={date} />
          </label>
          <button
            className="rounded-xl px-4 py-2 font-medium text-white"
            style={{ background: "var(--ohs-dark-green)" }}
            type="submit"
          >
            {session ? "Open session" : "Create session"}
          </button>
          <span className="text-sm text-slate-600">
            {session ? `Session ID: ${session.id}` : "No session yet for this date."}
          </span>
        </form>
      </section>

      <section className="rounded-2xl border bg-white p-5">
        <h2 className="text-lg font-semibold">Mark students</h2>
        <p className="mt-1 text-sm text-slate-600">
          Select a status for each student, then Save. (Visible after refresh.)
        </p>

        {!session ? (
          <div className="mt-4 text-sm text-slate-600">
            Create/open a session for the date first.
          </div>
        ) : (
          <form action={saveMarks} className="mt-4 grid gap-3">
            <input type="hidden" name="assignmentId" value={assignmentId} />
            <input type="hidden" name="sessionId" value={session.id} />

            <div className="overflow-hidden rounded-2xl border">
              <div className="grid grid-cols-2 border-b bg-[color:var(--ohs-surface)] px-4 py-2 text-sm font-medium text-slate-700">
                <div>Student</div>
                <div>Status</div>
              </div>

              <ul>
                {students.map((s) => {
                  const existing = marks.get(s.id);
                  return (
                    <li key={s.id} className="grid grid-cols-2 items-center gap-3 border-b last:border-b-0 px-4 py-3">
                      <div className="text-sm text-[color:var(--ohs-charcoal)]">{s.full_name}</div>
                      <select
                        className="rounded-lg border px-3 py-2 text-sm"
                        name={`status_${s.id}`}
                        defaultValue={existing?.status ?? "present"}
                      >
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                        <option value="excused">Excused</option>
                      </select>
                    </li>
                  );
                })}
              </ul>
            </div>

            <button
              className="w-fit rounded-xl px-4 py-2 font-medium text-white"
              style={{ background: "var(--ohs-dark-green)" }}
              type="submit"
            >
              Save marks
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
