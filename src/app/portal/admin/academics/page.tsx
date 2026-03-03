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
  getEnrollmentCount,
} from "./queries";

import {
  upsertTerm,
  deleteTerm,
  setActiveTerm,
  upsertClass,
  deleteClass,
  setClassActive,
  upsertSubject,
  deleteSubject,
  setSubjectActive,
  createAssignment,
  deleteAssignment,
  addEnrollment,
  deleteEnrollment,
} from "./actions";

function Banner({ ok, err, okText }: { ok?: string; err?: string; okText: string }) {
  return (
    <>
      {ok ? (
        <div className="mt-3 rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-800">
          {okText}
        </div>
      ) : null}

      {err ? (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
          {decodeURIComponent(err)}
        </div>
      ) : null}
    </>
  );
}

export default async function AdminAcademicsPage({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string;
    id?: string;
    termId?: string;
    classId?: string;
    ok?: string;
    err?: string;
    showInactive?: string;
  }>;
}) {
  await requireRole(["admin"]);
  const params = await searchParams;

  const tab = params.tab ?? "terms";
  const showInactive = params.showInactive === "1";

  const terms = await listTerms();

  const classes = await listClasses({ includeInactive: showInactive && tab === "classes" });
  const subjects = await listSubjects({ includeInactive: showInactive && tab === "subjects" });

  const selectedId = params.id ? Number(params.id) : null;

  const teachers = tab === "assignments" ? await listTeachers() : [];
  const assignments = tab === "assignments" ? await listAssignments() : [];
  const secularAssignments = assignments.filter((a: any) => a.class_groups?.track_key !== "islamic");
  const islamicAssignments = assignments.filter((a: any) => a.class_groups?.track_key === "islamic");

  const students = tab === "enrollments" ? await listStudents() : [];
  const termId =
    params.termId ? Number(params.termId) : (terms.find((t: any) => t.is_active)?.id ?? null);

  const classId = params.classId ? Number(params.classId) : null;

  const enrollments =
    tab === "enrollments" && termId && classId ? await listEnrollments(termId, classId) : [];

  const activeTab = (k: string) =>
    `rounded-xl px-3 py-2 text-sm ${tab === k ? "bg-[color:var(--ohs-surface)] border" : "underline"}`;

  const toggleInactiveHref = (k: "classes" | "subjects") =>
    `/portal/admin/academics?tab=${k}${showInactive ? "" : "&showInactive=1"}`;

  const secularClasses = classes.filter((c: any) => c.track_key === "secular" && (showInactive || c.is_active));
  const islamicClasses = classes.filter((c: any) => c.track_key === "islamic" && (showInactive || c.is_active));
  const inactiveClasses = classes.filter((c: any) => !c.is_active);

  const secularSubjects = subjects.filter((s: any) => s.track === "secular" && (showInactive || s.is_active));
  const islamicSubjects = subjects.filter((s: any) => s.track === "islamic" && (showInactive || s.is_active));
  const inactiveSubjects = subjects.filter((s: any) => !s.is_active);

  const enrollmentOverview =
    tab === "enrollments" && termId
      ? await Promise.all(
          classes
            .filter((c: any) => c.is_active)
            .map(async (c: any) => {
              const [count, preview] = await Promise.all([
                getEnrollmentCount(termId, c.id),
                listEnrollments(termId, c.id, 6),
              ]);
              return { class: c, count, preview };
            })
        )
      : [];

  const secularOverview = enrollmentOverview.filter((x: any) => x.class.track_key === "secular");
  const islamicOverview = enrollmentOverview.filter((x: any) => x.class.track_key === "islamic");

  return (
    <div className="grid gap-6">
      <div className="rounded-2xl border bg-white p-4 flex flex-wrap gap-2">
        <Link className={activeTab("terms")} href="/portal/admin/academics?tab=terms">Terms</Link>
        <Link className={activeTab("classes")} href="/portal/admin/academics?tab=classes">Classes</Link>
        <Link className={activeTab("subjects")} href="/portal/admin/academics?tab=subjects">Subjects</Link>
        <Link className={activeTab("assignments")} href="/portal/admin/academics?tab=assignments">Assignments</Link>
        <Link className={activeTab("enrollments")} href="/portal/admin/academics?tab=enrollments">Enrollments</Link>
      </div>

      {/* TERMS */}
      {tab === "terms" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border bg-white p-5">
            <h1 className="text-xl font-semibold">Term</h1>
            <p className="mt-1 text-sm text-slate-600">Create terms and choose the active term.</p>

            <Banner ok={params.ok} err={params.err} okText="Saved." />

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
                <div key={t.id} className="py-3 px-2 flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium">{t.name} {t.is_active ? "(active)" : ""}</div>
                    <div className="text-xs text-slate-500">{t.starts_on} → {t.ends_on}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    {!t.is_active ? (
                      <form action={setActiveTerm}>
                        <input type="hidden" name="id" value={t.id} />
                        <button type="submit" className="text-sm underline">Set active</button>
                      </form>
                    ) : null}

                    <form action={deleteTerm}>
                      <input type="hidden" name="id" value={t.id} />
                      <button type="submit" className="text-sm text-red-600 underline">Delete</button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      {/* CLASSES */}
      {tab === "classes" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border bg-white p-5">
            <h1 className="text-xl font-semibold">Class</h1>
            <Banner ok={params.ok} err={params.err} okText="Saved." />

            <div className="mt-2">
              <Link className="text-sm underline" href={toggleInactiveHref("classes")}>
                {showInactive ? "Hide inactive" : "Show inactive"}
              </Link>
            </div>

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
                  <option value="islamic">Islamic Theology</option>
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

            {[
              { title: "Secular", items: secularClasses },
              { title: "Islamic Theology", items: islamicClasses },
            ].map((group) => (
              <div key={group.title} className="mt-5">
                <div className="text-sm font-semibold">{group.title}</div>
                <div className="mt-2 divide-y rounded-xl border">
                  {group.items.map((c: any) => (
                    <div key={c.id} className="py-3 px-3 flex items-center justify-between gap-4">
                      <div>
                        <div className="font-medium">{c.name}</div>
                        <div className="text-xs text-slate-500">{c.level} {c.is_active ? "" : "• inactive"}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <form action={setClassActive}>
                          <input type="hidden" name="id" value={c.id} />
                          <input type="hidden" name="is_active" value={c.is_active ? "false" : "true"} />
                          <button type="submit" className="text-sm underline">
                            {c.is_active ? "Deactivate" : "Activate"}
                          </button>
                        </form>
                        <form action={deleteClass}>
                          <input type="hidden" name="id" value={c.id} />
                          <button type="submit" className="text-sm text-red-600 underline">Delete</button>
                        </form>
                      </div>
                    </div>
                  ))}
                  {group.items.length === 0 ? (
                    <div className="py-4 px-3 text-sm text-slate-600">None.</div>
                  ) : null}
                </div>
              </div>
            ))}

            {showInactive && inactiveClasses.length > 0 ? (
              <div className="mt-6">
                <div className="text-sm font-semibold">Inactive</div>
                <div className="mt-2 divide-y rounded-xl border">
                  {inactiveClasses.map((c: any) => (
                    <div key={c.id} className="py-3 px-3 flex items-center justify-between">
                      <div className="font-medium">{c.name}</div>
                      <form action={setClassActive}>
                        <input type="hidden" name="id" value={c.id} />
                        <input type="hidden" name="is_active" value="true" />
                        <button className="text-sm underline" type="submit">Activate</button>
                      </form>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        </div>
      ) : null}

      {/* SUBJECTS */}
      {tab === "subjects" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border bg-white p-5">
            <h1 className="text-xl font-semibold">Subject</h1>
            <Banner ok={params.ok} err={params.err} okText="Saved." />

            <div className="mt-2">
              <Link className="text-sm underline" href={toggleInactiveHref("subjects")}>
                {showInactive ? "Hide inactive" : "Show inactive"}
              </Link>
            </div>

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
                  <option value="islamic">Islamic Theology</option>
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

            <div className="mt-3 text-xs text-slate-500">
              Tip: If you reuse an existing Code, the system will reactivate/update the old subject instead of creating a duplicate.
            </div>
          </section>

          <section className="rounded-2xl border bg-white p-5">
            <h2 className="text-lg font-semibold">Subjects</h2>

            {[
              { title: "Secular", items: secularSubjects },
              { title: "Islamic Theology", items: islamicSubjects },
            ].map((group) => (
              <div key={group.title} className="mt-5">
                <div className="text-sm font-semibold">{group.title}</div>
                <div className="mt-2 divide-y rounded-xl border">
                  {group.items.map((s: any) => (
                    <div key={s.id} className="py-3 px-3 flex items-center justify-between gap-4">
                      <div>
                        <div className="font-medium">{s.name}</div>
                        <div className="text-xs text-slate-500">{s.code ?? ""} {s.is_active ? "" : "• inactive"}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <form action={setSubjectActive}>
                          <input type="hidden" name="id" value={s.id} />
                          <input type="hidden" name="is_active" value={s.is_active ? "false" : "true"} />
                          <button type="submit" className="text-sm underline">
                            {s.is_active ? "Deactivate" : "Activate"}
                          </button>
                        </form>
                        <form action={deleteSubject}>
                          <input type="hidden" name="id" value={s.id} />
                          <button type="submit" className="text-sm text-red-600 underline">Delete</button>
                        </form>
                      </div>
                    </div>
                  ))}
                  {group.items.length === 0 ? (
                    <div className="py-4 px-3 text-sm text-slate-600">None.</div>
                  ) : null}
                </div>
              </div>
            ))}

            {showInactive && inactiveSubjects.length > 0 ? (
              <div className="mt-6">
                <div className="text-sm font-semibold">Inactive</div>
                <div className="mt-2 divide-y rounded-xl border">
                  {inactiveSubjects.map((s: any) => (
                    <div key={s.id} className="py-3 px-3 flex items-center justify-between">
                      <div className="font-medium">{s.name}</div>
                      <form action={setSubjectActive}>
                        <input type="hidden" name="id" value={s.id} />
                        <input type="hidden" name="is_active" value="true" />
                        <button className="text-sm underline" type="submit">Activate</button>
                      </form>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        </div>
      ) : null}

      {/* ENROLLMENTS: grouped overview by default */}
      {tab === "enrollments" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border bg-white p-5">
            <h1 className="text-xl font-semibold">Enrollments</h1>
            <p className="mt-1 text-sm text-slate-600">Add / move a student into a class for a term.</p>

            <Banner ok={params.ok} err={params.err} okText="Enrollment saved." />

            <form action={addEnrollment} className="mt-4 grid gap-3">
              <label className="grid gap-1">
                <span className="text-sm">Term</span>
                <select className="rounded-lg border px-3 py-2" name="term_id" defaultValue={termId ?? undefined}>
                  {terms.map((t: any) => (
                    <option key={t.id} value={t.id}>
                      {t.name}{t.is_active ? " (active)" : ""}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1">
                <span className="text-sm">Class</span>
                <select
                  className="rounded-lg border px-3 py-2"
                  name="class_id"
                  // ✅ for the form we can still default to first class if none selected
                  defaultValue={classId ?? classes[0]?.id ?? undefined}
                >
                  {classes.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.track_key === "islamic" ? "(Islamic)" : "(Secular)"}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1">
                <span className="text-sm">Student</span>
                <select className="rounded-lg border px-3 py-2" name="student_id">
                  {students.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.full_name}</option>
                  ))}
                </select>
              </label>

              <button className="rounded-xl px-4 py-2 font-medium text-white"
                style={{ background: "var(--ohs-dark-green)" }} type="submit">
                Add / Move enrollment
              </button>
            </form>
          </section>

          <section className="rounded-2xl border bg-white p-5">
            <h2 className="text-lg font-semibold">
              {termId ? `Enrollment overview (Term ${termId})` : "Enrollment overview"}
            </h2>

            {/* If classId is selected, show full list. Otherwise show per-class groupings */}
            {termId && classId ? (
              <>
                <p className="mt-1 text-sm text-slate-600">Class: {classId}</p>
                <div className="mt-3 divide-y">
                  {enrollments.map((e: any) => (
                    <div key={e.id} className="py-3 px-2 flex items-center justify-between gap-4">
                      <div className="font-medium">{e.students?.full_name}</div>
                      <form action={deleteEnrollment}>
                        <input type="hidden" name="id" value={e.id} />
                        <input type="hidden" name="term_id" value={termId} />
                        <input type="hidden" name="class_id" value={classId} />
                        <button className="text-sm text-red-600 underline" type="submit">remove</button>
                      </form>
                    </div>
                  ))}
                  {enrollments.length === 0 ? (
                    <div className="py-6 text-sm text-slate-600">No students in this class yet.</div>
                  ) : null}
                </div>

                <div className="mt-4">
                  <Link className="text-sm underline" href={`/portal/admin/academics?tab=enrollments&termId=${termId}`}>
                    Back to overview
                  </Link>
                </div>
              </>
            ) : (
              <div className="mt-4 grid gap-6">
                {[
                  { title: "Secular", items: secularOverview },
                  { title: "Islamic Theology", items: islamicOverview },
                ].map((group) => (
                  <div key={group.title}>
                    <div className="text-sm font-semibold">{group.title}</div>
                    <div className="mt-2 grid gap-3">
                      {group.items.map((x: any) => (
                        <div key={x.class.id} className="rounded-xl border p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="font-medium">{x.class.name}</div>
                              <div className="text-xs text-slate-500">{x.count} enrolled</div>
                            </div>
                            <Link
                              className="text-sm underline"
                              href={`/portal/admin/academics?tab=enrollments&termId=${termId}&classId=${x.class.id}`}
                            >
                              View all
                            </Link>
                          </div>

                          <div className="mt-3 text-sm text-slate-700">
                            {x.preview.length === 0 ? (
                              <div className="text-slate-500">No students yet.</div>
                            ) : (
                              <ul className="list-disc pl-5">
                                {x.preview.map((e: any) => (
                                  <li key={e.id}>{e.students?.full_name}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      ))}
                      {group.items.length === 0 ? (
                        <div className="text-sm text-slate-600">No classes found in this track.</div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : null}

      {/* ASSIGNMENTS tab stays as you had it; we’ll enhance next */}
      {tab === "assignments" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border bg-white p-5">
            <h1 className="text-xl font-semibold">Assignments</h1>
            <Banner ok={params.ok} err={params.err} okText="Assignment created." />

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

            <div className="mt-4">
              <div className="text-sm font-semibold">Secular</div>
              <div className="mt-2 divide-y rounded-xl border">
                {secularAssignments.map((a: any) => (
                  <div key={a.id} className="py-3 px-3 flex items-start justify-between gap-4">
                    <div>
                      <div className="font-medium">{a.class_groups?.name} • {a.subjects?.name}</div>
                      <div className="text-xs text-slate-500">{a.academic_terms?.name} • {a.teachers?.full_name}</div>
                    </div>
                    <form action={deleteAssignment}>
                      <input type="hidden" name="id" value={a.id} />
                      <button className="text-sm text-red-600 underline" type="submit">delete</button>
                    </form>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <div className="text-sm font-semibold">Islamic Theology</div>
              <div className="mt-2 divide-y rounded-xl border">
                {islamicAssignments.map((a: any) => (
                  <div key={a.id} className="py-3 px-3 flex items-start justify-between gap-4">
                    <div>
                      <div className="font-medium">{a.class_groups?.name} • {a.subjects?.name}</div>
                      <div className="text-xs text-slate-500">{a.academic_terms?.name} • {a.teachers?.full_name}</div>
                    </div>
                    <form action={deleteAssignment}>
                      <input type="hidden" name="id" value={a.id} />
                      <button className="text-sm text-red-600 underline" type="submit">delete</button>
                    </form>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}