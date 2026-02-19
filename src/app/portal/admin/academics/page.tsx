import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import {
  listTerms,
  listClasses,
  listSubjects,
  listTeachers,
  listStudents,
  listAssignments,
  listEnrollments,
} from "./queries";

import {
  upsertTerm,
  upsertClass,
  deleteClass,
  upsertSubject,
  deleteSubject,
  createAssignment,
  deleteAssignment,
  addEnrollment,
  deleteEnrollment,
} from "./actions";

export default async function AdminAcademicsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; id?: string; termId?: string; classId?: string }>;
}) {
  await requireRole(["admin"]);
  const params = await searchParams;

  const tab = params.tab ?? "terms";

  const terms = await listTerms();
  const classes = await listClasses();
  const subjects = await listSubjects();

  const selectedId = params.id ? Number(params.id) : null;

  // For dropdowns
  const teachers = tab === "assignments" ? await listTeachers() : [];
  const assignments = tab === "assignments" ? await listAssignments() : [];

  const students = tab === "enrollments" ? await listStudents() : [];
  const termId = params.termId ? Number(params.termId) : (terms.find((t: any) => t.is_active)?.id ?? null);
  const classId = params.classId ? Number(params.classId) : (classes[0]?.id ?? null);
  const enrollments =
    tab === "enrollments" && termId && classId ? await listEnrollments(termId, classId) : [];

  const activeTab = (k: string) =>
    `rounded-xl px-3 py-2 text-sm ${tab === k ? "bg-[color:var(--ohs-surface)] border" : "underline"}`;

  return (
    <div className="grid gap-6">
      <div className="rounded-2xl border bg-white p-4 flex flex-wrap gap-2">
        <Link className={activeTab("terms")} href="/portal/admin/academics?tab=terms">Terms</Link>
        <Link className={activeTab("classes")} href="/portal/admin/academics?tab=classes">Classes</Link>
        <Link className={activeTab("subjects")} href="/portal/admin/academics?tab=subjects">Subjects</Link>
        <Link className={activeTab("assignments")} href="/portal/admin/academics?tab=assignments">Assignments</Link>
        <Link className={activeTab("enrollments")} href="/portal/admin/academics?tab=enrollments">Enrollments</Link>
      </div>

      {tab === "terms" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border bg-white p-5">
            <h1 className="text-xl font-semibold">Term</h1>
            <p className="mt-1 text-sm text-slate-600">Create terms and choose the active term.</p>

            <form action={upsertTerm} className="mt-4 grid gap-3">
              <input type="hidden" name="id" value={selectedId ?? ""} />
              <label className="grid gap-1">
                <span className="text-sm">Name</span>
                <input className="rounded-lg border px-3 py-2" name="name" required placeholder="Term 1 2026" />
              </label>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="grid gap-1">
                  <span className="text-sm">Start</span>
                  <input className="rounded-lg border px-3 py-2" type="date" name="starts_on" required />
                </label>
                <label className="grid gap-1">
                  <span className="text-sm">End</span>
                  <input className="rounded-lg border px-3 py-2" type="date" name="ends_on" required />
                </label>
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="is_active" />
                <span className="text-sm">Set as active</span>
              </label>
              <button className="rounded-xl px-4 py-2 font-medium text-white"
                style={{ background: "var(--ohs-dark-green)" }} type="submit">
                Save
              </button>
            </form>
          </section>

          <section className="rounded-2xl border bg-white p-5">
            <h2 className="text-lg font-semibold">Terms</h2>
            <div className="mt-3 divide-y">
              {terms.map((t: any) => (
                <div key={t.id} className="py-3 px-2">
                  <div className="font-medium">{t.name} {t.is_active ? "(active)" : ""}</div>
                  <div className="text-xs text-slate-500">{t.starts_on} → {t.ends_on}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      {tab === "classes" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border bg-white p-5">
            <h1 className="text-xl font-semibold">Class</h1>
            <form action={upsertClass} className="mt-4 grid gap-3">
              <input type="hidden" name="id" value={selectedId ?? ""} />
              <label className="grid gap-1">
                <span className="text-sm">Name</span>
                <input className="rounded-lg border px-3 py-2" name="name" required placeholder="S1A" />
              </label>
              <label className="grid gap-1">
                <span className="text-sm">Level</span>
                <input className="rounded-lg border px-3 py-2" name="level" required placeholder="S1" />
              </label>
              <label className="grid gap-1">
                <span className="text-sm">Track</span>
                <select className="rounded-lg border px-3 py-2" name="track_key" defaultValue="secular">
                  <option value="secular">Secular</option>
                  <option value="islamic">Islamic</option>
                </select>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="is_active" defaultChecked />
                <span className="text-sm">Active</span>
              </label>
              <button className="rounded-xl px-4 py-2 font-medium text-white"
                style={{ background: "var(--ohs-dark-green)" }} type="submit">
                Save
              </button>
            </form>
          </section>

          <section className="rounded-2xl border bg-white p-5">
            <h2 className="text-lg font-semibold">Classes</h2>
            <div className="mt-3 divide-y">
              {classes.map((c: any) => (
                <div key={c.id} className="py-3 px-2 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-slate-500">{c.level} • {c.track_key} • {c.is_active ? "active" : "inactive"}</div>
                  </div>
                  <form action={deleteClass}>
                    <input type="hidden" name="id" value={c.id} />
                    <button type="submit" className="text-sm text-red-600 underline">Delete</button>
                  </form>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      {tab === "subjects" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border bg-white p-5">
            <h1 className="text-xl font-semibold">Subject</h1>
            <form action={upsertSubject} className="mt-4 grid gap-3">
              <input type="hidden" name="id" value={selectedId ?? ""} />
              <label className="grid gap-1">
                <span className="text-sm">Code (optional)</span>
                <input className="rounded-lg border px-3 py-2" name="code" placeholder="MATH" />
              </label>
              <label className="grid gap-1">
                <span className="text-sm">Name</span>
                <input className="rounded-lg border px-3 py-2" name="name" required placeholder="Mathematics" />
              </label>
              <label className="grid gap-1">
                <span className="text-sm">Track</span>
                <select className="rounded-lg border px-3 py-2" name="track" defaultValue="secular">
                  <option value="secular">Secular</option>
                  <option value="islamic">Islamic</option>
                </select>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="is_active" defaultChecked />
                <span className="text-sm">Active</span>
              </label>
              <button className="rounded-xl px-4 py-2 font-medium text-white"
                style={{ background: "var(--ohs-dark-green)" }} type="submit">
                Save
              </button>
            </form>
          </section>

          <section className="rounded-2xl border bg-white p-5">
            <h2 className="text-lg font-semibold">Subjects</h2>
            <div className="mt-3 divide-y">
              {subjects.map((s: any) => (
                <div key={s.id} className="py-3 px-2 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-slate-500">{s.code ?? ""} • {s.track} • {s.is_active ? "active" : "inactive"}</div>
                  </div>
                  <form action={deleteSubject}>
                    <input type="hidden" name="id" value={s.id} />
                    <button type="submit" className="text-sm text-red-600 underline">Delete</button>
                  </form>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      {tab === "assignments" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border bg-white p-5">
            <h1 className="text-xl font-semibold">Assignments</h1>
            <p className="mt-1 text-sm text-slate-600">Assign teachers to a class and subject for a term.</p>

            <form action={createAssignment} className="mt-4 grid gap-3">
              <label className="grid gap-1">
                <span className="text-sm">Term</span>
                <select className="rounded-lg border px-3 py-2" name="term_id" defaultValue={terms.find((t: any) => t.is_active)?.id ?? terms[0]?.id}>
                  {terms.map((t: any) => <option key={t.id} value={t.id}>{t.name}{t.is_active ? " (active)" : ""}</option>)}
                </select>
              </label>

              <label className="grid gap-1">
                <span className="text-sm">Class</span>
                <select className="rounded-lg border px-3 py-2" name="class_id">
                  {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>

              <label className="grid gap-1">
                <span className="text-sm">Subject</span>
                <select className="rounded-lg border px-3 py-2" name="subject_id">
                  {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.code ? `${s.code} — ` : ""}{s.name}</option>)}
                </select>
              </label>

              <label className="grid gap-1">
                <span className="text-sm">Teacher</span>
                <select className="rounded-lg border px-3 py-2" name="teacher_id">
                  {teachers.map((t: any) => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                </select>
              </label>

              <button className="rounded-xl px-4 py-2 font-medium text-white"
                style={{ background: "var(--ohs-dark-green)" }} type="submit">
                Create assignment
              </button>
            </form>
          </section>

          <section className="rounded-2xl border bg-white p-5">
            <h2 className="text-lg font-semibold">Existing assignments</h2>
            <div className="mt-3 divide-y">
              {assignments.map((a: any) => (
                <div key={a.id} className="py-3 px-2 flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium">
                      {a.class_groups?.name} • {a.subjects?.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {a.academic_terms?.name} • {a.teachers?.full_name}
                    </div>
                  </div>
                  <form action={deleteAssignment}>
                    <input type="hidden" name="id" value={a.id} />
                    <button className="text-sm text-red-600 underline" type="submit">
                      delete
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      {tab === "enrollments" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border bg-white p-5">
            <h1 className="text-xl font-semibold">Enrollments</h1>
            <p className="mt-1 text-sm text-slate-600">Add students to a class for a term.</p>

            <form action={addEnrollment} className="mt-4 grid gap-3">
              <label className="grid gap-1">
                <span className="text-sm">Term</span>
                <select className="rounded-lg border px-3 py-2" name="term_id" defaultValue={termId ?? undefined}>
                  {terms.map((t: any) => <option key={t.id} value={t.id}>{t.name}{t.is_active ? " (active)" : ""}</option>)}
                </select>
              </label>

              <label className="grid gap-1">
                <span className="text-sm">Class</span>
                <select className="rounded-lg border px-3 py-2" name="class_id" defaultValue={classId ?? undefined}>
                  {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>

              <label className="grid gap-1">
                <span className="text-sm">Student</span>
                <select className="rounded-lg border px-3 py-2" name="student_id">
                  {students.map((s: any) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                </select>
              </label>

              <button className="rounded-xl px-4 py-2 font-medium text-white"
                style={{ background: "var(--ohs-dark-green)" }} type="submit">
                Add enrollment
              </button>
            </form>

            <div className="mt-4 text-xs text-slate-500">
              Tip: if you need different term/class in the list, use URL params:
              <div className="mt-1 font-mono">
                /portal/admin/academics?tab=enrollments&amp;termId=1&amp;classId=1
              </div>
            </div>
          </section>

          <section className="rounded-2xl border bg-white p-5">
            <h2 className="text-lg font-semibold">Enrolled students</h2>
            <p className="mt-1 text-sm text-slate-600">
              Term: {termId ?? "-"} • Class: {classId ?? "-"}
            </p>

            <div className="mt-3 divide-y">
              {enrollments.map((e: any) => (
                <div key={e.id} className="py-3 px-2 flex items-center justify-between gap-4">
                  <div className="font-medium">{e.students?.full_name}</div>
                  <form action={deleteEnrollment}>
                    <input type="hidden" name="id" value={e.id} />
                    <button className="text-sm text-red-600 underline" type="submit">remove</button>
                  </form>
                </div>
              ))}
              {enrollments.length === 0 ? (
                <div className="py-6 text-sm text-slate-600">No enrollments yet.</div>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}