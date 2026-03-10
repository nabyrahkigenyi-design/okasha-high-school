import Link from "next/link";
import { ensureSession, saveMarks, finalizeSession } from "./actions";
import { getMarks, getSession } from "./queries";
import { getTeacherAssignmentById, getTeacherAssignments, listRosterForAssignment } from "../queries";

type Rel<T> = T | T[] | null | undefined;

function one<T>(v: Rel<T>): T | null {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function StatusPill({ text }: { text: string }) {
  return <span className="portal-badge">{text}</span>;
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

  const locked = !!session?.finalized_at;

  return (
    <div className="grid gap-6">
      <section className="portal-surface p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h1 className="portal-title">Attendance</h1>
            <p className="portal-subtitle">
              Choose a class and date, open the session, then mark each student clearly.
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
            <button className="portal-btn portal-btn-primary w-full md:w-auto" type="submit">
              Open
            </button>
          </div>
        </form>

        {selected ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white/75 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="text-base font-semibold text-slate-900">
                  {cg?.name ?? "Class"} • {subj?.name ?? "Subject"}
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  {term?.name ?? "Term"} • {cg?.level ?? ""} •{" "}
                  {subj?.track === "islamic" ? "Islamic Theology" : "Secular"}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <StatusPill text={date} />
                {locked ? <StatusPill text="Locked" /> : <StatusPill text="Editable" />}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white/60 p-4 text-sm text-slate-600">
            {allAssignments.length === 0
              ? "You do not have any active teaching assignments yet."
              : "Select a class and subject to continue."}
          </div>
        )}
      </section>

      {selected ? (
        <>
          <section className="portal-surface p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Session</h2>
                <p className="mt-1 text-sm text-slate-600">
                  {session ? `Session exists for ${date}.` : "No session yet for this date."}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <form action={ensureSession}>
                  <input type="hidden" name="assignmentId" value={selected.id} />
                  <input type="hidden" name="sessionDate" value={date} />
                  <button className="portal-btn portal-btn-primary" type="submit">
                    {session ? "Open session" : "Create session"}
                  </button>
                </form>

                {session && !locked ? (
                  <form action={finalizeSession}>
                    <input type="hidden" name="assignmentId" value={selected.id} />
                    <input type="hidden" name="sessionId" value={session.id} />
                    <button className="portal-btn portal-btn-danger" type="submit">
                      Finalize attendance
                    </button>
                  </form>
                ) : null}
              </div>
            </div>

            {locked ? (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white/75 p-4 text-sm text-slate-700">
                Attendance has been saved and is now <b>locked</b>. You can no longer edit this session.
              </div>
            ) : session ? (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white/75 p-4 text-sm text-slate-700">
                Session is open. Mark students below, then save. Finalize only when you are completely done.
              </div>
            ) : null}
          </section>

          <section className="portal-surface p-4 sm:p-5">
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold text-slate-900">Mark students</h2>
              <p className="text-sm text-slate-600">
                {locked
                  ? "This attendance session is locked."
                  : "Choose a status for each student, then save the marks."}
              </p>
            </div>

            {!session ? (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white/60 p-4 text-sm text-slate-600">
                Create or open a session first.
              </div>
            ) : students.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white/60 p-4 text-sm text-slate-600">
                No students are enrolled for this class in this term.
              </div>
            ) : (
              <form action={saveMarks} className="mt-4 grid gap-4">
                <input type="hidden" name="assignmentId" value={selected.id} />
                <input type="hidden" name="sessionId" value={session.id} />

                <div className="grid gap-3">
                  {students.map((s: any) => {
                    const existing = marks.get(s.id);

                    return (
                      <div
                        key={s.id}
                        className="rounded-2xl border border-slate-200 bg-white/80 p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-slate-900 sm:text-base">
                              {s.full_name}
                            </div>
                            <div className="mt-1 text-xs text-slate-500">
                              Student attendance status
                            </div>
                          </div>

                          <div className="w-full sm:w-[220px]">
                            <select
                              className="portal-select w-full"
                              name={`status_${s.id}`}
                              defaultValue={existing?.status ?? "present"}
                              disabled={locked}
                            >
                              <option value="present">Present</option>
                              <option value="absent">Absent</option>
                              <option value="late">Late</option>
                              <option value="sick">Sick</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {!locked ? (
                  <button className="portal-btn portal-btn-primary w-full sm:w-fit" type="submit">
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