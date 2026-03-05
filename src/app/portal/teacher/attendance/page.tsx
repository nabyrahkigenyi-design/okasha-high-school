import Link from "next/link";
import { ensureSession, saveMarks, finalizeSession } from "./actions";import { getMarks, getSession } from "./queries";
import { getTeacherAssignmentById, getTeacherAssignments, listRosterForAssignment } from "../queries";

type Rel<T> = T | T[] | null | undefined;
function one<T>(v: Rel<T>): T | null {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default async function TeacherAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ assignmentId?: string; date?: string; ok?: string; err?: string }>;
}) {
  const params = await searchParams;

  const allAssignments = await getTeacherAssignments();
  const assignmentId = params.assignmentId ? Number(params.assignmentId) : 0;
  const date = params.date ?? todayISO();

  const selected = assignmentId ? await getTeacherAssignmentById(assignmentId) : null;

  const cg = one(selected?.class_groups);
  const subj = one(selected?.subjects);
  const term = one(selected?.academic_terms);

  const students = selected ? await listRosterForAssignment(selected.id) : [];
  const session = selected ? await getSession(selected.id, date) : null;
  const marks = session ? await getMarks(session.id) : new Map();

  // Lock once anything exists for this session
  const locked = !!session?.finalized_at;
  return (
    <div className="grid gap-6">
      <section className="portal-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="portal-title">Attendance</h1>
            <p className="portal-subtitle">
              Select class/subject, pick a date, create/open a session, then mark students.
            </p>
          </div>

          {selected ? (
            <div className="flex flex-wrap gap-2">
              <Link className="portal-btn" href={`/portal/teacher/assignments?assignmentId=${selected.id}`}>
                Assignments
              </Link>
              <Link className="portal-btn" href={`/portal/teacher/grading?assignmentId=${selected.id}`}>
                Grading
              </Link>
              {session ? (
                <a
                  className="portal-btn"
                  href={`/portal/teacher/attendance/export?assignmentId=${selected.id}&date=${encodeURIComponent(date)}`}
                >
                  Download CSV
                </a>
              ) : null}
            </div>
          ) : null}
        </div>

        <form method="get" className="mt-4 grid gap-3 md:grid-cols-[1fr_220px_auto]">
          <label className="grid gap-1">
            <span className="text-sm">Class / Subject</span>
            <select className="portal-select" name="assignmentId" defaultValue={assignmentId || ""}>
              <option value="">Select class and subject</option>
              {allAssignments.map((a: any) => {
                const aCg = one(a.class_groups);
                const aSub = one(a.subjects);
                return (
                  <option key={a.id} value={a.id}>
                    {aCg?.name ?? "Class"} • {aSub?.name ?? "Subject"}
                  </option>
                );
              })}
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-sm">Date</span>
            <input className="portal-input" type="date" name="date" defaultValue={date} />
          </label>

          <div className="flex items-end">
            <button className="portal-btn portal-btn-primary" type="submit">
              Open
            </button>
          </div>
        </form>

        {selected ? (
          <div className="mt-4 rounded-xl border bg-white/70 p-4">
            <div className="font-medium">
              {cg?.name ?? "Class"} • {subj?.name ?? "Subject"}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {term?.name ?? "Term"} • {cg?.level ?? ""} •{" "}
              {subj?.track === "islamic" ? "Islamic Theology" : "Secular"}
            </div>
          </div>
        ) : (
          <div className="mt-4 text-sm portal-muted">
            {allAssignments.length === 0
              ? "You do not have any active teaching assignments yet."
              : "Select a class and subject to continue."}
          </div>
        )}
      </section>

      {selected ? (
        <>
          <section className="portal-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Session</h2>
                <p className="text-sm portal-muted">
                  {session ? `Session exists for ${date}.` : "No session yet for this date."}
                </p>
              </div>

              <form action={ensureSession} className="flex flex-wrap items-center gap-2">
                <input type="hidden" name="assignmentId" value={selected.id} />
                <input type="hidden" name="sessionDate" value={date} />
                <button className="portal-btn portal-btn-primary" type="submit">
                  {session ? "Open session" : "Create session"}
                </button>
              </form>
              {session && !locked ? (
              <form action={finalizeSession} className="mt-2">
                <input type="hidden" name="assignmentId" value={selected.id} />
                <input type="hidden" name="sessionId" value={session.id} />
                <button className="portal-btn portal-btn-danger" type="submit">
                   Finalize attendance
                </button>
                <div className="mt-1 text-xs portal-muted">
                 Finalizing locks this attendance permanently.
                </div>
              </form>
) : null}
            </div>

            {locked ? (
              <div className="mt-3 rounded-xl border bg-white/70 p-3 text-sm text-slate-700">
                Attendance has been saved and is now <b>locked</b> (not editable). Use “Download CSV” to keep a hard copy.
              </div>
            ) : null}
          </section>

          <section className="portal-surface p-5">
            <h2 className="text-lg font-semibold">Mark students</h2>
            <p className="mt-1 text-sm portal-muted">
              {locked
                ? "This session is locked."
                : "Select a status for each student, then Save. (Visible after refresh.)"}
            </p>

            {!session ? (
              <div className="mt-4 text-sm portal-muted">Create/open a session first.</div>
            ) : students.length === 0 ? (
              <div className="mt-4 text-sm portal-muted">No students enrolled for this class/term.</div>
            ) : (
              <form action={saveMarks} className="mt-4 grid gap-3">
                <input type="hidden" name="assignmentId" value={selected.id} />
                <input type="hidden" name="sessionId" value={session.id} />

                <div className="overflow-hidden rounded-2xl border">
                  <div className="grid grid-cols-2 border-b bg-[color:var(--ohs-surface)] px-4 py-2 text-sm font-medium text-slate-700">
                    <div>Student</div>
                    <div>Status</div>
                  </div>

                  <ul>
                    {students.map((s: any) => {
                      const existing = marks.get(s.id);
                      return (
                        <li key={s.id} className="grid grid-cols-2 items-center gap-3 border-b last:border-b-0 px-4 py-3">
                          <div className="text-sm text-[color:var(--ohs-charcoal)]">{s.full_name}</div>
                          <select
                            className="portal-select"
                            name={`status_${s.id}`}
                            defaultValue={existing?.status ?? "present"}
                            disabled={locked}
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

                {!locked ? (
                  <button className="portal-btn portal-btn-primary w-fit" type="submit">
                    Save marks
                  </button>
                ) : null}
              </form>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}