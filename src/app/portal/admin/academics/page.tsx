import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { WatermarkedSection } from "@/components/WatermarkedSection";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import { ToastGate } from "@/components/ToastGate";

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

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="portal-badge">{children}</span>;
}

function BadgeTrack({ track }: { track: "secular" | "islamic" }) {
  return (
    <span className={`portal-badge ${track === "islamic" ? "portal-badge-islamic" : "portal-badge-secular"}`}>
      {track === "islamic" ? "Islamic" : "Secular"}
    </span>
  );
}

function SectionTitle({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="portal-title">{title}</h1>
        {subtitle ? <p className="portal-subtitle">{subtitle}</p> : null}
      </div>
      {right ? <div className="flex items-center gap-2">{right}</div> : null}
    </div>
  );
}

function GhostLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link className="portal-btn" href={href}>
      {children}
    </Link>
  );
}

function PrimaryButton({
  children,
  type = "button",
}: {
  children: React.ReactNode;
  type?: "button" | "submit";
}) {
  return (
    <button className="portal-btn portal-btn-primary" type={type}>
      {children}
    </button>
  );
}

function SearchBar({
  tab,
  showInactive,
  q,
  placeholder,
}: {
  tab: string;
  showInactive: boolean;
  q: string;
  placeholder: string;
}) {
  return (
    <form method="get" className="mt-3 flex gap-2">
      <input type="hidden" name="tab" value={tab} />
      {showInactive ? <input type="hidden" name="showInactive" value="1" /> : null}

      <input className="portal-input" name="q" defaultValue={q} placeholder={placeholder} />

      <button className="portal-btn" type="submit">
        Search
      </button>

      {q ? (
        <Link className="portal-btn" href={`/portal/admin/academics?tab=${tab}${showInactive ? "&showInactive=1" : ""}`}>
          Clear
        </Link>
      ) : null}
    </form>
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

    q?: string;
    qStudent?: string;
    qClass?: string;
  }>;
}) {
  await requireRole(["admin"]);
  const params = await searchParams;

  const tab = params.tab ?? "terms";
  const showInactive = params.showInactive === "1";

  const q = (params.q ?? "").trim();
  const qStudent = (params.qStudent ?? "").trim();
  const qClass = (params.qClass ?? "").trim();

  const terms = await listTerms();

  const classes =
    tab === "classes"
      ? await listClasses({ includeInactive: showInactive, q })
      : await listClasses({ includeInactive: false, q: tab === "enrollments" ? qClass : "" });

  const subjects =
    tab === "subjects"
      ? await listSubjects({ includeInactive: showInactive, q })
      : await listSubjects({ includeInactive: false });

  const selectedId = params.id ? Number(params.id) : null;

  const selectedTerm = tab === "terms" && selectedId ? terms.find((t: any) => t.id === selectedId) : null;
  const selectedClass = tab === "classes" && selectedId ? classes.find((c: any) => c.id === selectedId) : null;
  const selectedSubject = tab === "subjects" && selectedId ? subjects.find((s: any) => s.id === selectedId) : null;

  const termById = new Map<number, any>(terms.map((t: any) => [t.id, t]));
  const classById = new Map<number, any>(classes.map((c: any) => [c.id, c]));

  const teachers = tab === "assignments" ? await listTeachers() : [];
  const assignments = tab === "assignments" ? await listAssignments() : [];

  const secularAssignments = assignments.filter((a: any) => a.class_groups?.track_key !== "islamic");
  const islamicAssignments = assignments.filter((a: any) => a.class_groups?.track_key === "islamic");

  const students = tab === "enrollments" ? await listStudents({ q: qStudent, limit: 500 }) : [];

  const termId =
    params.termId ? Number(params.termId) : (terms.find((t: any) => t.is_active)?.id ?? null);

  const classId = params.classId ? Number(params.classId) : null;

  const enrollments =
    tab === "enrollments" && termId && classId ? await listEnrollments(termId, classId) : [];

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

  const baseTabHref = (k: string) => `/portal/admin/academics?tab=${k}${showInactive ? "&showInactive=1" : ""}`;
  const tabClass = (k: string) => `portal-tab ${tab === k ? "portal-tab-active" : ""}`;

  // Choose toast text based on current tab. (Actions still set ok=1/err=...)
  const okText =
    tab === "terms"
      ? "Saved."
      : tab === "classes"
        ? "Saved."
        : tab === "subjects"
          ? "Saved."
          : tab === "assignments"
            ? "Assignment saved."
            : tab === "enrollments"
              ? "Enrollment saved."
              : "Saved.";

  return (
    <WatermarkedSection tone="portal" variant="mixed">
      {/* Toasts (reads ok/err from URL then cleans it) */}
      <ToastGate ok={params.ok} err={params.err} okText={okText} />

      <div className="grid gap-6">
        {/* Tabs */}
        <div className="portal-tabs sticky top-2 z-10">
          <Link className={tabClass("terms")} href="/portal/admin/academics?tab=terms">
            Terms
          </Link>
          <Link className={tabClass("classes")} href="/portal/admin/academics?tab=classes">
            Classes
          </Link>
          <Link className={tabClass("subjects")} href="/portal/admin/academics?tab=subjects">
            Subjects
          </Link>
          <Link className={tabClass("assignments")} href="/portal/admin/academics?tab=assignments">
            Assignments
          </Link>
          <Link className={tabClass("enrollments")} href="/portal/admin/academics?tab=enrollments">
            Enrollments
          </Link>
        </div>

        {/* TERMS */}
        {tab === "terms" ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="portal-surface p-5">
              <SectionTitle
                title="Term"
                subtitle="Create terms and choose the active term."
                right={<GhostLink href="/portal/admin/academics?tab=terms">New</GhostLink>}
              />

              {selectedTerm ? (
                <div className="mt-3 text-sm portal-muted">
                  Editing: <span className="font-medium text-slate-900">{selectedTerm.name}</span>
                </div>
              ) : null}

              <form action={upsertTerm} className="mt-4 grid gap-3">
                <input type="hidden" name="id" value={selectedId ?? ""} />

                <label className="grid gap-1">
                  <span className="text-sm">Name</span>
                  <input
                    className="portal-input"
                    name="name"
                    required
                    placeholder="Term 1 2026"
                    defaultValue={selectedTerm?.name ?? ""}
                  />
                </label>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="grid gap-1">
                    <span className="text-sm">Start</span>
                    <input
                      className="portal-input"
                      type="date"
                      name="starts_on"
                      required
                      defaultValue={selectedTerm?.starts_on ?? ""}
                    />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-sm">End</span>
                    <input
                      className="portal-input"
                      type="date"
                      name="ends_on"
                      required
                      defaultValue={selectedTerm?.ends_on ?? ""}
                    />
                  </label>
                </div>

                <label className="flex items-center gap-2">
                  <input type="checkbox" name="is_active" defaultChecked={selectedTerm?.is_active ?? false} />
                  <span className="text-sm">Set as active</span>
                </label>

                <div className="pt-1">
                  <PrimaryButton type="submit">Save</PrimaryButton>
                </div>
              </form>
            </section>

            <section className="portal-surface p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Terms</h2>
                <Pill>{terms.length} total</Pill>
              </div>

              <div className="mt-3 divide-y rounded-xl border bg-white/70">
                {terms.map((t: any) => (
                  <div key={t.id} className="py-3 px-3 flex items-start justify-between gap-4">
                    <div>
                      <div className="font-medium">
                        {t.name} {t.is_active ? <span className="text-xs text-green-700">• active</span> : null}
                      </div>
                      <div className="text-xs text-slate-500">
                        {t.starts_on} → {t.ends_on}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link className="text-sm underline" href={`/portal/admin/academics?tab=terms&id=${t.id}`}>
                        Edit
                      </Link>

                      {!t.is_active ? (
                        <form action={setActiveTerm}>
                          <input type="hidden" name="id" value={t.id} />
                          <button type="submit" className="text-sm underline">
                            Set active
                          </button>
                        </form>
                      ) : null}

                      <form action={deleteTerm}>
                        <input type="hidden" name="id" value={t.id} />
                        <ConfirmSubmitButton
                          className="portal-btn portal-btn-danger"
                          confirmText={`Delete term "${t.name}"?\n\nIf it is in use, it will be archived instead.`}
                          title="Delete term"
                        >
                          Delete
                        </ConfirmSubmitButton>
                      </form>
                    </div>
                  </div>
                ))}

                {terms.length === 0 ? <div className="py-6 px-3 text-sm portal-muted">No terms yet.</div> : null}
              </div>
            </section>
          </div>
        ) : null}

        {/* CLASSES */}
        {tab === "classes" ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="portal-surface p-5">
              <SectionTitle
                title="Class"
                subtitle="Create class groups and manage active/inactive classes."
                right={
                  <>
                    <GhostLink href={toggleInactiveHref("classes")}>
                      {showInactive ? "Hide inactive" : "Show inactive"}
                    </GhostLink>
                    <GhostLink href={baseTabHref("classes")}>New</GhostLink>
                  </>
                }
              />

              {selectedClass ? (
                <div className="mt-3 text-sm portal-muted">
                  Editing: <span className="font-medium text-slate-900">{selectedClass.name}</span>
                </div>
              ) : null}

              <SearchBar tab="classes" showInactive={showInactive} q={q} placeholder="Search classes (e.g. S1A, S2, ...)" />

              <form action={upsertClass} className="mt-4 grid gap-3">
                <input type="hidden" name="id" value={selectedId ?? ""} />

                <label className="grid gap-1">
                  <span className="text-sm">Name</span>
                  <input className="portal-input" name="name" required placeholder="S1A" defaultValue={selectedClass?.name ?? ""} />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm">Level</span>
                  <input className="portal-input" name="level" required placeholder="S1" defaultValue={selectedClass?.level ?? ""} />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm">Track</span>
                  <select className="portal-select" name="track_key" defaultValue={selectedClass?.track_key ?? "secular"}>
                    <option value="secular">Secular</option>
                    <option value="islamic">Islamic Theology</option>
                  </select>
                </label>

                <label className="flex items-center gap-2">
                  <input type="checkbox" name="is_active" defaultChecked={selectedClass?.is_active ?? true} />
                  <span className="text-sm">Active</span>
                </label>

                <div className="pt-1">
                  <PrimaryButton type="submit">Save</PrimaryButton>
                </div>
              </form>
            </section>

            <section className="portal-surface p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Classes</h2>
                <div className="flex items-center gap-2">
                  <Pill>Secular: {secularClasses.length}</Pill>
                  <Pill>Islamic: {islamicClasses.length}</Pill>
                  {showInactive ? <Pill>Inactive: {inactiveClasses.length}</Pill> : null}
                </div>
              </div>

              {[
                { title: "Secular", items: secularClasses, track: "secular" as const },
                { title: "Islamic Theology", items: islamicClasses, track: "islamic" as const },
              ].map((group) => (
                <div key={group.title} className="mt-5">
                  <div className="text-sm font-semibold flex items-center gap-2">
                    {group.title} <BadgeTrack track={group.track} />
                  </div>

                  <div className="mt-2 divide-y rounded-xl border bg-white/70">
                    {group.items.map((c: any) => (
                      <div key={c.id} className="py-3 px-3 flex items-center justify-between gap-4">
                        <div>
                          <div className="font-medium">{c.name}</div>
                          <div className="text-xs text-slate-500">{c.level} {c.is_active ? "" : "• inactive"}</div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            className="text-sm underline"
                            href={`/portal/admin/academics?tab=classes&id=${c.id}${showInactive ? "&showInactive=1" : ""}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                          >
                            Edit
                          </Link>

                          <form action={setClassActive}>
                            <input type="hidden" name="id" value={c.id} />
                            <input type="hidden" name="is_active" value={c.is_active ? "false" : "true"} />
                            <button type="submit" className="portal-btn">
                              {c.is_active ? "Deactivate" : "Activate"}
                            </button>
                          </form>

                          <form action={deleteClass}>
                            <input type="hidden" name="id" value={c.id} />
                            <ConfirmSubmitButton
                              className="portal-btn portal-btn-danger"
                              confirmText={`Delete class "${c.name}"?\n\nIf it is in use, it will be archived instead.`}
                            >
                              Delete
                            </ConfirmSubmitButton>
                          </form>
                        </div>
                      </div>
                    ))}

                    {group.items.length === 0 ? <div className="py-4 px-3 text-sm portal-muted">None.</div> : null}
                  </div>
                </div>
              ))}

              {showInactive && inactiveClasses.length > 0 ? (
                <div className="mt-6">
                  <div className="text-sm font-semibold">Inactive</div>
                  <div className="mt-2 divide-y rounded-xl border bg-white/70">
                    {inactiveClasses.map((c: any) => (
                      <div key={c.id} className="py-3 px-3 flex items-center justify-between">
                        <div className="font-medium">{c.name}</div>
                        <div className="flex items-center gap-2">
                          <Link
                            className="text-sm underline"
                            href={`/portal/admin/academics?tab=classes&id=${c.id}&showInactive=1${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                          >
                            Edit
                          </Link>
                          <form action={setClassActive}>
                            <input type="hidden" name="id" value={c.id} />
                            <input type="hidden" name="is_active" value="true" />
                            <button className="portal-btn" type="submit">Activate</button>
                          </form>
                        </div>
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
            <section className="portal-surface p-5">
              <SectionTitle
                title="Subject"
                subtitle="Create subjects and keep secular and Islamic theology tracks organized."
                right={
                  <>
                    <GhostLink href={toggleInactiveHref("subjects")}>
                      {showInactive ? "Hide inactive" : "Show inactive"}
                    </GhostLink>
                    <GhostLink href={baseTabHref("subjects")}>New</GhostLink>
                  </>
                }
              />

              {selectedSubject ? (
                <div className="mt-3 text-sm portal-muted">
                  Editing: <span className="font-medium text-slate-900">{selectedSubject.name}</span>
                </div>
              ) : null}

              <SearchBar tab="subjects" showInactive={showInactive} q={q} placeholder="Search subjects (name or code)" />

              <form action={upsertSubject} className="mt-4 grid gap-3">
                <input type="hidden" name="id" value={selectedId ?? ""} />

                <label className="grid gap-1">
                  <span className="text-sm">Code (optional)</span>
                  <input className="portal-input" name="code" placeholder="MATH" defaultValue={selectedSubject?.code ?? ""} />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm">Name</span>
                  <input className="portal-input" name="name" required placeholder="Mathematics" defaultValue={selectedSubject?.name ?? ""} />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm">Track</span>
                  <select className="portal-select" name="track" defaultValue={selectedSubject?.track ?? "secular"}>
                    <option value="secular">Secular</option>
                    <option value="islamic">Islamic Theology</option>
                  </select>
                </label>

                <label className="flex items-center gap-2">
                  <input type="checkbox" name="is_active" defaultChecked={selectedSubject?.is_active ?? true} />
                  <span className="text-sm">Active</span>
                </label>

                <div className="pt-1">
                  <PrimaryButton type="submit">Save</PrimaryButton>
                </div>
              </form>
            </section>

            <section className="portal-surface p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Subjects</h2>
                <div className="flex items-center gap-2">
                  <Pill>Secular: {secularSubjects.length}</Pill>
                  <Pill>Islamic: {islamicSubjects.length}</Pill>
                  {showInactive ? <Pill>Inactive: {inactiveSubjects.length}</Pill> : null}
                </div>
              </div>

              {[
                { title: "Secular", items: secularSubjects, track: "secular" as const },
                { title: "Islamic Theology", items: islamicSubjects, track: "islamic" as const },
              ].map((group) => (
                <div key={group.title} className="mt-5">
                  <div className="text-sm font-semibold flex items-center gap-2">
                    {group.title} <BadgeTrack track={group.track} />
                  </div>

                  <div className="mt-2 divide-y rounded-xl border bg-white/70">
                    {group.items.map((s: any) => (
                      <div key={s.id} className="py-3 px-3 flex items-center justify-between gap-4">
                        <div>
                          <div className="font-medium">{s.name}</div>
                          <div className="text-xs text-slate-500">{s.code ? s.code : ""} {s.is_active ? "" : "• inactive"}</div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            className="text-sm underline"
                            href={`/portal/admin/academics?tab=subjects&id=${s.id}${showInactive ? "&showInactive=1" : ""}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                          >
                            Edit
                          </Link>

                          <form action={setSubjectActive}>
                            <input type="hidden" name="id" value={s.id} />
                            <input type="hidden" name="is_active" value={s.is_active ? "false" : "true"} />
                            <button type="submit" className="portal-btn">
                              {s.is_active ? "Deactivate" : "Activate"}
                            </button>
                          </form>

                          <form action={deleteSubject}>
                            <input type="hidden" name="id" value={s.id} />
                            <ConfirmSubmitButton
                              className="portal-btn portal-btn-danger"
                              confirmText={`Delete subject "${s.name}"?\n\nIf it is in use, it will be archived instead.`}
                            >
                              Delete
                            </ConfirmSubmitButton>
                          </form>
                        </div>
                      </div>
                    ))}

                    {group.items.length === 0 ? <div className="py-4 px-3 text-sm portal-muted">None.</div> : null}
                  </div>
                </div>
              ))}

              {showInactive && inactiveSubjects.length > 0 ? (
                <div className="mt-6">
                  <div className="text-sm font-semibold">Inactive</div>
                  <div className="mt-2 divide-y rounded-xl border bg-white/70">
                    {inactiveSubjects.map((s: any) => (
                      <div key={s.id} className="py-3 px-3 flex items-center justify-between">
                        <div className="font-medium">{s.name}</div>
                        <div className="flex items-center gap-2">
                          <Link
                            className="text-sm underline"
                            href={`/portal/admin/academics?tab=subjects&id=${s.id}&showInactive=1${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                          >
                            Edit
                          </Link>
                          <form action={setSubjectActive}>
                            <input type="hidden" name="id" value={s.id} />
                            <input type="hidden" name="is_active" value="true" />
                            <button className="portal-btn" type="submit">Activate</button>
                          </form>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>
          </div>
        ) : null}

        {/* ASSIGNMENTS */}
        {tab === "assignments" ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="portal-surface p-5">
              <SectionTitle title="Assignments" subtitle="Assign a teacher to teach a subject for a class in a term." />

              <form action={createAssignment} className="mt-4 grid gap-3">
                <label className="grid gap-1">
                  <span className="text-sm">Term</span>
                  <select
                    className="portal-select"
                    name="term_id"
                    defaultValue={terms.find((t: any) => t.is_active)?.id ?? terms[0]?.id}
                  >
                    {terms.map((t: any) => (
                      <option key={t.id} value={t.id}>
                        {t.name}{t.is_active ? " (active)" : ""}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-1">
                  <span className="text-sm">Class</span>
                  <select className="portal-select" name="class_id">
                    {classes.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.track_key === "islamic" ? "(Islamic)" : "(Secular)"}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-1">
                  <span className="text-sm">Subject</span>
                  <select className="portal-select" name="subject_id">
                    {subjects.map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.code ? `${s.code} — ` : ""}{s.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-1">
                  <span className="text-sm">Teacher</span>
                  <select className="portal-select" name="teacher_id">
                    {teachers.map((t: any) => (
                      <option key={t.id} value={t.id}>
                        {t.full_name}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="pt-1">
                  <PrimaryButton type="submit">Create assignment</PrimaryButton>
                </div>
              </form>
            </section>

            <section className="portal-surface p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Existing assignments</h2>
                <Pill>{assignments.length} total</Pill>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold flex items-center gap-2">
                    Secular <BadgeTrack track="secular" />
                  </div>
                  <Pill>{secularAssignments.length}</Pill>
                </div>
                <div className="mt-2 divide-y rounded-xl border bg-white/70">
                  {secularAssignments.map((a: any) => (
                    <div key={a.id} className="py-3 px-3 flex items-start justify-between gap-4">
                      <div>
                        <div className="font-medium">{a.class_groups?.name} • {a.subjects?.name}</div>
                        <div className="text-xs text-slate-500">{a.academic_terms?.name} • {a.teachers?.full_name}</div>
                      </div>
                      <form action={deleteAssignment}>
                        <input type="hidden" name="id" value={a.id} />
                        <ConfirmSubmitButton
                          className="portal-btn portal-btn-danger"
                          confirmText={`Delete assignment for ${a.class_groups?.name} • ${a.subjects?.name}?`}
                        >
                          Delete
                        </ConfirmSubmitButton>
                      </form>
                    </div>
                  ))}
                  {secularAssignments.length === 0 ? <div className="py-4 px-3 text-sm portal-muted">None.</div> : null}
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold flex items-center gap-2">
                    Islamic Theology <BadgeTrack track="islamic" />
                  </div>
                  <Pill>{islamicAssignments.length}</Pill>
                </div>
                <div className="mt-2 divide-y rounded-xl border bg-white/70">
                  {islamicAssignments.map((a: any) => (
                    <div key={a.id} className="py-3 px-3 flex items-start justify-between gap-4">
                      <div>
                        <div className="font-medium">{a.class_groups?.name} • {a.subjects?.name}</div>
                        <div className="text-xs text-slate-500">{a.academic_terms?.name} • {a.teachers?.full_name}</div>
                      </div>
                      <form action={deleteAssignment}>
                        <input type="hidden" name="id" value={a.id} />
                        <ConfirmSubmitButton
                          className="portal-btn portal-btn-danger"
                          confirmText={`Delete assignment for ${a.class_groups?.name} • ${a.subjects?.name}?`}
                        >
                          Delete
                        </ConfirmSubmitButton>
                      </form>
                    </div>
                  ))}
                  {islamicAssignments.length === 0 ? <div className="py-4 px-3 text-sm portal-muted">None.</div> : null}
                </div>
              </div>
            </section>
          </div>
        ) : null}

        {/* ENROLLMENTS */}
        {tab === "enrollments" ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="portal-surface p-5">
              <SectionTitle title="Enrollments" subtitle="Add / move a student into a class for a term." />

              <form method="get" className="mt-3 flex gap-2">
                <input type="hidden" name="tab" value="enrollments" />
                {termId ? <input type="hidden" name="termId" value={String(termId)} /> : null}
                {classId ? <input type="hidden" name="classId" value={String(classId)} /> : null}
                {qClass ? <input type="hidden" name="qClass" value={qClass} /> : null}

                <input className="portal-input" name="qStudent" defaultValue={qStudent} placeholder="Search student name…" />
                <button className="portal-btn" type="submit">Search</button>

                {qStudent ? (
                  <Link
                    className="portal-btn"
                    href={`/portal/admin/academics?tab=enrollments${termId ? `&termId=${termId}` : ""}${classId ? `&classId=${classId}` : ""}${qClass ? `&qClass=${encodeURIComponent(qClass)}` : ""}`}
                  >
                    Clear
                  </Link>
                ) : null}
              </form>

              <form action={addEnrollment} className="mt-4 grid gap-3">
                <label className="grid gap-1">
                  <span className="text-sm">Term</span>
                  <select className="portal-select" name="term_id" defaultValue={termId ?? undefined}>
                    {terms.map((t: any) => (
                      <option key={t.id} value={t.id}>
                        {t.name}{t.is_active ? " (active)" : ""}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-1">
                  <span className="text-sm">Class</span>
                  <select className="portal-select" name="class_id" defaultValue={classId ?? classes[0]?.id ?? undefined}>
                    {classes.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.track_key === "islamic" ? "(Islamic)" : "(Secular)"}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-1">
                  <span className="text-sm">Student</span>
                  <select className="portal-select" name="student_id">
                    {students.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.full_name}</option>
                    ))}
                  </select>

                  {qStudent ? (
                    <div className="mt-1 text-xs portal-muted">
                      Showing filtered results for: <span className="font-mono">{qStudent}</span>
                    </div>
                  ) : null}
                </label>

                <div className="pt-1">
                  <PrimaryButton type="submit">Add / Move enrollment</PrimaryButton>
                </div>
              </form>

              <form method="get" className="mt-5 flex gap-2">
                <input type="hidden" name="tab" value="enrollments" />
                {termId ? <input type="hidden" name="termId" value={String(termId)} /> : null}
                {qStudent ? <input type="hidden" name="qStudent" value={qStudent} /> : null}

                <input className="portal-input" name="qClass" defaultValue={qClass} placeholder="Search class name…" />
                <button className="portal-btn" type="submit">Search</button>

                {qClass ? (
                  <Link
                    className="portal-btn"
                    href={`/portal/admin/academics?tab=enrollments${termId ? `&termId=${termId}` : ""}${qStudent ? `&qStudent=${encodeURIComponent(qStudent)}` : ""}`}
                  >
                    Clear
                  </Link>
                ) : null}
              </form>
            </section>

            <section className="portal-surface p-5">
              <h2 className="text-lg font-semibold">
                {termId ? `Enrollment overview — ${termById.get(termId)?.name ?? `Term ${termId}`}` : "Enrollment overview"}
              </h2>

              {termId && classId ? (
                <>
                  <p className="mt-1 text-sm portal-muted">
                    Class: {classById.get(classId)?.name ?? classId}
                  </p>

                  <div className="mt-3 divide-y rounded-xl border bg-white/70">
                    {enrollments.map((e: any) => (
                      <div key={e.id} className="py-3 px-3 flex items-center justify-between gap-4">
                        <div className="font-medium">{e.students?.full_name}</div>
                        <form action={deleteEnrollment}>
                          <input type="hidden" name="id" value={e.id} />
                          <input type="hidden" name="term_id" value={termId} />
                          <input type="hidden" name="class_id" value={classId} />
                          <ConfirmSubmitButton
                            className="portal-btn portal-btn-danger"
                            confirmText={`Remove "${e.students?.full_name}" from this class?`}
                          >
                            Remove
                          </ConfirmSubmitButton>
                        </form>
                      </div>
                    ))}

                    {enrollments.length === 0 ? (
                      <div className="py-6 px-3 text-sm portal-muted">No students in this class yet.</div>
                    ) : null}
                  </div>

                  <div className="mt-4">
                    <Link
                      className="text-sm underline"
                      href={`/portal/admin/academics?tab=enrollments&termId=${termId}${qStudent ? `&qStudent=${encodeURIComponent(qStudent)}` : ""}${qClass ? `&qClass=${encodeURIComponent(qClass)}` : ""}`}
                    >
                      Back to overview
                    </Link>
                  </div>
                </>
              ) : (
                <div className="mt-4 grid gap-6">
                  {[
                    { title: "Secular", items: secularOverview, track: "secular" as const },
                    { title: "Islamic Theology", items: islamicOverview, track: "islamic" as const },
                  ].map((group) => (
                    <div key={group.title}>
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold flex items-center gap-2">
                          {group.title} <BadgeTrack track={group.track} />
                        </div>
                        <Pill>{group.items.length}</Pill>
                      </div>

                      <div className="mt-2 grid gap-3">
                        {group.items.map((x: any) => (
                          <div key={x.class.id} className="rounded-xl border bg-white/70 p-4">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <div className="font-medium">{x.class.name}</div>
                                <div className="text-xs text-slate-500">{x.count} enrolled</div>
                              </div>

                              <Link
                                className="text-sm underline"
                                href={`/portal/admin/academics?tab=enrollments&termId=${termId}&classId=${x.class.id}${qStudent ? `&qStudent=${encodeURIComponent(qStudent)}` : ""}${qClass ? `&qClass=${encodeURIComponent(qClass)}` : ""}`}
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

                        {group.items.length === 0 ? <div className="text-sm portal-muted">No classes found in this track.</div> : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        ) : null}
      </div>
    </WatermarkedSection>
  );
}