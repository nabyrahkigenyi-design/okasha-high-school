import Link from "next/link";
import { ToastGate } from "@/components/ToastGate";
import { createTeacherAssignment, deleteTeacherAssignmentItem } from "./actions";
import { getSelectedAssignmentOrNull, listAssignmentOptions, listMyAssignmentsForScope } from "./queries";
import { AttachmentField } from "./AttachmentField";

type Rel<T> = T | T[] | null | undefined;

function one<T>(v: Rel<T>): T | null {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

function InfoPill({ text }: { text: string }) {
  return <span className="portal-badge">{text}</span>;
}

export default async function TeacherAssignmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ assignmentId?: string; ok?: string; err?: string }>;
}) {
  const params = await searchParams;
  const assignmentId = params.assignmentId ? Number(params.assignmentId) : 0;

  const options = await listAssignmentOptions();
  const selected = assignmentId ? await getSelectedAssignmentOrNull(assignmentId) : null;
  const items = selected ? await listMyAssignmentsForScope(selected.id) : [];

  const cg = one(selected?.class_groups);
  const subj = one(selected?.subjects);
  const term = one(selected?.academic_terms);

  return (
    <div className="grid gap-6">
      <ToastGate ok={params.ok} err={params.err} okText="Assignment saved." />

      <section className="portal-surface p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h1 className="portal-title">Assignments</h1>
            <p className="portal-subtitle">
              Create coursework for one of your assigned class and subject combinations.
            </p>
          </div>

          {selected ? (
            <div className="flex flex-wrap gap-2">
              <Link className="portal-btn" href={`/portal/teacher/attendance?assignmentId=${selected.id}`}>
                Attendance
              </Link>
              <Link className="portal-btn" href={`/portal/teacher/grading?assignmentId=${selected.id}`}>
                Grading
              </Link>
            </div>
          ) : null}
        </div>

        <form method="get" className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
          <label className="grid gap-1">
            <span className="text-sm">Class / Subject</span>
            <select className="portal-select" name="assignmentId" defaultValue={assignmentId || ""}>
              <option value="">Select class and subject</option>
              {options.map((a: any) => {
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
                <InfoPill text={`${items.length} assignment${items.length === 1 ? "" : "s"}`} />
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white/60 p-4 text-sm text-slate-600">
            {options.length === 0
              ? "You do not have any active teaching assignments yet."
              : "Select a class and subject to continue."}
          </div>
        )}
      </section>

      {selected ? (
        <>
          <section className="portal-surface p-4 sm:p-5">
            <h2 className="text-lg font-semibold text-slate-900">Create new assignment</h2>

            <form action={createTeacherAssignment} className="mt-4 grid gap-3">
              <input type="hidden" name="teacher_assignment_id" value={selected.id} />

              <label className="grid gap-1">
                <span className="text-sm">Title</span>
                <input className="portal-input" name="title" required placeholder="Week 3 Exercise" />
              </label>

              <label className="grid gap-1">
                <span className="text-sm">Description</span>
                <textarea
                  className="portal-input min-h-[120px]"
                  name="description"
                  required
                  placeholder="Instructions for students..."
                />
              </label>

              <label className="grid gap-1">
                <span className="text-sm">Due date and time</span>
                <input className="portal-input" type="datetime-local" name="due_at" required />
              </label>

              <label className="grid gap-1">
                <span className="text-sm">Attachment (optional)</span>
                <AttachmentField />
              </label>

              <button className="portal-btn portal-btn-primary w-full sm:w-fit" type="submit">
                Create assignment
              </button>
            </form>
          </section>

          <section className="portal-surface p-4 sm:p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-slate-900">My created assignments</h2>
              <span className="portal-badge">{items.length} total</span>
            </div>

            {items.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white/60 p-4 text-sm text-slate-600">
                No assignments created yet for this class and subject.
              </div>
            ) : (
              <div className="mt-4 grid gap-3">
                {items.map((item: any) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-white/80 p-4"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="text-base font-semibold text-slate-900">{item.title}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          Due: {item.due_at ? new Date(item.due_at).toLocaleString() : "No due date"}
                        </div>

                        {item.description ? (
                          <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">
                            {item.description}
                          </p>
                        ) : null}

                        {item.attachment_url ? (
                          <a
                            className="mt-3 inline-block text-sm underline"
                            href={item.attachment_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open attachment
                          </a>
                        ) : (
                          <div className="mt-3 text-xs text-slate-500">No file attached</div>
                        )}
                      </div>

                      <form action={deleteTeacherAssignmentItem}>
                        <input type="hidden" name="id" value={item.id} />
                        <input type="hidden" name="teacher_assignment_id" value={selected.id} />
                        <button className="portal-btn portal-btn-danger w-full sm:w-auto" type="submit">
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}