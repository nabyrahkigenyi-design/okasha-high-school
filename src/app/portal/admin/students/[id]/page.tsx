import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { WatermarkedSection } from "@/components/WatermarkedSection";
import { ToastGate } from "@/components/ToastGate";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import StudentPhotoField from "../StudentPhotoField";
import { getStudentById } from "../queries";
import {
  assignStudentNumber,
  setStudentStatus,
  updateStudentProfile,
  purgeStudent,
  createStudentPortalLogin,
  resetStudentPortalPassword,
} from "../actions";
import { addParentStudentLink, removeParentStudentLink } from "../../parent-links/actions";
import { listParentsForStudent, searchParents } from "../../parent-links/queries";
import { supabaseAdmin } from "@/lib/supabase/admin";

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="portal-badge">{children}</span>;
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
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="portal-title">{title}</h1>
        {subtitle ? <p className="portal-subtitle">{subtitle}</p> : null}
      </div>
      {right ? <div className="flex flex-wrap items-center gap-2">{right}</div> : null}
    </div>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div className="mt-2 text-sm font-medium text-slate-900">{value || "—"}</div>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="grid gap-1 border-b border-slate-200 py-3 last:border-b-0 sm:grid-cols-[180px_1fr] sm:gap-4">
      <div className="text-sm font-medium text-slate-600">{label}</div>
      <div className="text-sm text-slate-900">{value || "—"}</div>
    </div>
  );
}

export default async function AdminStudentProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; err?: string; edit?: string; qParent?: string }>;
}) {
  await requireRole(["admin"]);

  const { id } = await params;
  const sp = await searchParams;
  const editMode = sp.edit === "1";
  const qParent = (sp.qParent ?? "").trim();

  const student = await getStudentById(id);

  if (!student) {
    return (
      <WatermarkedSection tone="portal" variant="mixed">
        <section className="portal-surface p-6">
          <SectionTitle
            title="Student not found"
            subtitle="The requested student record does not exist."
            right={<Link className="portal-btn" href="/portal/admin/students">Back to Students</Link>}
          />
        </section>
      </WatermarkedSection>
    );
  }

  const [linkedParents, parentResults, portalEmail] = await Promise.all([
    listParentsForStudent(student.id),
    searchParents(qParent),
    (async () => {
      if (!student.user_id) return null;
      const res = await supabaseAdmin().auth.admin.getUserById(student.user_id);
      return res.data?.user?.email ?? null;
    })(),
  ]);

  const displayName =
    student.full_name ||
    [student.first_name, student.last_name].filter(Boolean).join(" ") ||
    "Student Profile";

  const schoolPlacement =
    [
      student.school_level,
      student.class_level,
      student.stream ? `Stream ${student.stream}` : null,
      student.track === "islamic" ? "Islamic" : student.track === "secular" ? "Secular" : null,
    ]
      .filter(Boolean)
      .join(" • ") || "Not set";

  const timeline =
    [
      student.admission_date || null,
      student.admission_year ? `Admission year ${student.admission_year}` : null,
      student.graduation_year ? `Graduation year ${student.graduation_year}` : null,
    ]
      .filter(Boolean)
      .join(" • ") || "Not set";

  return (
    <WatermarkedSection tone="portal" variant="mixed">
      <ToastGate ok={sp.ok} err={sp.err} okText="Saved." />

      <div className="grid gap-6">
        <section className="portal-surface p-6">
          <SectionTitle
            title={displayName}
            subtitle="Student profile and registry record."
            right={
              <>
                <Link className="portal-btn" href="/portal/admin/students">
                  Back to Students
                </Link>
                <Link className="portal-btn" href={`/portal/admin/finance/${student.id}`}>
                  Finance
                </Link>
                <Link className="portal-btn" href={`/portal/admin/students/${student.id}/print`}>
                  Print Profile
                </Link>
                <Link className="portal-btn" href={`/portal/admin/students/${student.id}/admission-letter`}>
                  Admission Letter
                </Link>
                {!editMode ? (
                  <Link className="portal-btn portal-btn-primary" href={`/portal/admin/students/${student.id}?edit=1`}>
                    Edit Profile
                  </Link>
                ) : (
                  <Link className="portal-btn" href={`/portal/admin/students/${student.id}`}>
                    Close Edit
                  </Link>
                )}
              </>
            }
          />

          <div className="mt-5 grid gap-5 xl:grid-cols-[180px_1fr]">
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
              <div className="aspect-[3/4] overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                {student.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={student.photo_url}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">
                    No photo
                  </div>
                )}
              </div>

              <div className="mt-3 grid gap-2 text-sm">
                <div className="font-semibold text-slate-900">
                  {student.student_no || "ID not assigned"}
                </div>
                <div className="text-slate-600">{schoolPlacement}</div>
                <div className="flex flex-wrap gap-2">
                  {student.status ? <Pill>{student.status}</Pill> : null}
                  {student.school_level ? <Pill>{student.school_level}</Pill> : null}
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <InfoCard label="Student ID" value={student.student_no ?? "Not assigned"} />
                <InfoCard label="Status" value={student.status ?? "Not set"} />
                <InfoCard label="School placement" value={schoolPlacement} />
                <InfoCard label="Admission timeline" value={timeline} />
              </div>

              <section className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">Profile summary</h2>

                <div className="mt-4 divide-y rounded-xl border border-slate-200 bg-white/70 px-4">
                  <DetailRow label="Full name" value={displayName} />
                  <DetailRow label="Date of birth" value={student.date_of_birth ?? "Not set"} />
                  <DetailRow label="Sex" value={student.sex ?? "Not set"} />
                  <DetailRow label="Religion" value={student.religion ?? "Not set"} />
                  <DetailRow label="Home village / town" value={student.home_village ?? "Not set"} />
                  <DetailRow label="District" value={student.district ?? "Not set"} />
                  <DetailRow label="Nationality" value={student.nationality ?? "Not set"} />
                  <DetailRow label="Former school" value={student.former_school ?? "Not set"} />
                  <DetailRow label="Notes" value={student.notes ?? "No notes"} />
                </div>
              </section>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <section className="portal-surface p-6">
            <h2 className="text-lg font-semibold text-slate-900">Quick actions</h2>

            <div className="mt-4 grid gap-3">
              <section className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                <div className="text-sm font-semibold text-slate-900">Student identity</div>
                <div className="mt-2 text-sm text-slate-600">
                  Generate the permanent school ID once the school level is correct.
                </div>

                <form action={assignStudentNumber} className="mt-4">
                  <input type="hidden" name="id" value={student.id} />
                  <button
                    className="portal-btn portal-btn-primary w-full sm:w-fit"
                    type="submit"
                    disabled={!!student.student_no}
                  >
                    {student.student_no ? "Student ID already assigned" : "Generate student ID"}
                  </button>
                </form>

                {!student.student_no ? (
                  <div className="mt-2 text-xs text-slate-500">
                    Set the school level first so the correct ID format can be generated.
                  </div>
                ) : null}
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                <div className="text-sm font-semibold text-slate-900">Status actions</div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <form action={setStudentStatus}>
                    <input type="hidden" name="id" value={student.id} />
                    <input type="hidden" name="status" value="active" />
                    <button className="portal-btn" type="submit">
                      Mark Active
                    </button>
                  </form>

                  <form action={setStudentStatus}>
                    <input type="hidden" name="id" value={student.id} />
                    <input type="hidden" name="status" value="suspended" />
                    <button className="portal-btn" type="submit">
                      Suspend
                    </button>
                  </form>

                  <form action={setStudentStatus}>
                    <input type="hidden" name="id" value={student.id} />
                    <input type="hidden" name="status" value="withdrawn" />
                    <button className="portal-btn portal-btn-danger" type="submit">
                      Withdraw
                    </button>
                  </form>

                  <form action={setStudentStatus}>
                    <input type="hidden" name="id" value={student.id} />
                    <input type="hidden" name="status" value="graduated" />
                    <button className="portal-btn" type="submit">
                      Graduate
                    </button>
                  </form>
                </div>

                <div className="mt-3 text-xs text-slate-500">
                  These actions align the student status with active/inactive profile state.
                </div>
              </section>

              {!student.user_id ? (
                <section className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                  <div className="text-sm font-semibold text-slate-900">Create portal login</div>
                  <div className="mt-2 text-sm text-slate-600">
                    This student does not yet have a portal account. Create one here later.
                  </div>

                  <form action={createStudentPortalLogin} className="mt-4 grid gap-3">
                    <input type="hidden" name="id" value={student.id} />

                    <label className="grid gap-1">
                      <span className="text-sm">Email</span>
                      <input
                        className="portal-input"
                        type="email"
                        name="email"
                        placeholder="student@example.com"
                        required
                      />
                    </label>

                    <label className="grid gap-1">
                      <span className="text-sm">Temporary password</span>
                      <input
                        className="portal-input"
                        type="password"
                        name="password"
                        placeholder="Minimum 8 characters"
                        required
                      />
                    </label>

                    <button className="portal-btn portal-btn-primary w-full sm:w-fit" type="submit">
                      Create Portal Login
                    </button>
                  </form>
                </section>
              ) : (
                <section className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                  <div className="text-sm font-semibold text-slate-900">Portal account</div>
                  <div className="mt-2 text-sm text-slate-600">
                    This student already has a linked portal account.
                  </div>

                  <div className="mt-4 grid gap-3">
                    <InfoCard label="Login email" value={portalEmail ?? "Email not found"} />
                    <div className="rounded-xl border border-slate-200 bg-white/70 p-4">
                      <div className="text-sm font-semibold text-slate-900">Reset temporary password</div>
                      <div className="mt-1 text-sm text-slate-600">
                        You cannot view the old password. Set a new temporary one here.
                      </div>

                      <form action={resetStudentPortalPassword} className="mt-4 grid gap-3">
                        <input type="hidden" name="id" value={student.id} />
                        <label className="grid gap-1">
                          <span className="text-sm">New temporary password</span>
                          <input
                            className="portal-input"
                            type="password"
                            name="password"
                            placeholder="Minimum 8 characters"
                            required
                          />
                        </label>

                        <button className="portal-btn portal-btn-primary w-full sm:w-fit" type="submit">
                          Reset Password
                        </button>
                      </form>
                    </div>
                  </div>
                </section>
              )}

              <section className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                <div className="text-sm font-semibold text-slate-900">System links</div>
                <div className="mt-3 grid gap-2">
                  <Link className="portal-btn" href={`/portal/admin/finance/${student.id}`}>
                    Open finance record
                  </Link>
                  <Link className="portal-btn" href={`/portal/admin/users?role=student`}>
                    Student user accounts
                  </Link>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                <div className="text-sm font-semibold text-slate-900">Danger zone</div>
                <div className="mt-2 text-sm text-slate-600">
                  Permanently delete this student and all linked records.
                </div>

                <form action={purgeStudent} className="mt-4">
                  <input type="hidden" name="id" value={student.id} />
                  <ConfirmSubmitButton
                    className="portal-btn portal-btn-danger w-full sm:w-fit"
                    confirmText={`Permanently delete "${displayName}"?\n\nThis removes linked student records and cannot be undone.`}
                    title="Delete student permanently"
                  >
                    Delete Student Permanently
                  </ConfirmSubmitButton>
                </form>
              </section>
            </div>
          </section>

          <div className="grid gap-6">
            {editMode ? (
              <section className="portal-surface p-6">
                <h2 className="text-lg font-semibold text-slate-900">Edit student profile</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Update the permanent student record. This does not remove academic history.
                </p>

                <form action={updateStudentProfile} className="mt-4 grid gap-4">
                  <input type="hidden" name="id" value={student.id} />

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-1">
                      <span className="text-sm">First name</span>
                      <input
                        className="portal-input"
                        name="first_name"
                        defaultValue={student.first_name ?? ""}
                        placeholder="First name"
                      />
                    </label>

                    <label className="grid gap-1">
                      <span className="text-sm">Last name</span>
                      <input
                        className="portal-input"
                        name="last_name"
                        defaultValue={student.last_name ?? ""}
                        placeholder="Last name"
                      />
                    </label>
                  </div>

                  <label className="grid gap-1">
                    <span className="text-sm">Other names</span>
                    <input
                      className="portal-input"
                      name="other_names"
                      defaultValue={student.other_names ?? ""}
                      placeholder="Other names"
                    />
                  </label>

                  <label className="grid gap-1">
                    <span className="text-sm">Full name</span>
                    <input
                      className="portal-input"
                      name="full_name"
                      defaultValue={student.full_name ?? ""}
                      placeholder="Full official name"
                      required
                    />
                  </label>

                  <div className="grid gap-4 md:grid-cols-3">
                    <label className="grid gap-1">
                      <span className="text-sm">Date of birth</span>
                      <input
                        className="portal-input"
                        type="date"
                        name="date_of_birth"
                        defaultValue={student.date_of_birth ?? ""}
                      />
                    </label>

                    <label className="grid gap-1">
                      <span className="text-sm">Sex</span>
                      <select className="portal-select" name="sex" defaultValue={student.sex ?? ""}>
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </label>

                    <label className="grid gap-1">
                      <span className="text-sm">Religion</span>
                      <input
                        className="portal-input"
                        name="religion"
                        defaultValue={student.religion ?? ""}
                        placeholder="Religion"
                      />
                    </label>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-1">
                      <span className="text-sm">Home village / town</span>
                      <input
                        className="portal-input"
                        name="home_village"
                        defaultValue={student.home_village ?? ""}
                        placeholder="Village or town"
                      />
                    </label>

                    <label className="grid gap-1">
                      <span className="text-sm">District</span>
                      <input
                        className="portal-input"
                        name="district"
                        defaultValue={student.district ?? ""}
                        placeholder="District"
                      />
                    </label>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-1">
                      <span className="text-sm">Nationality</span>
                      <input
                        className="portal-input"
                        name="nationality"
                        defaultValue={student.nationality ?? ""}
                        placeholder="Nationality"
                      />
                    </label>

                    <div className="grid gap-1">
                      <span className="text-sm">Student photo</span>
                      <StudentPhotoField defaultValue={student.photo_url ?? ""} />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <label className="grid gap-1">
                      <span className="text-sm">School level</span>
                      <select
                        className="portal-select"
                        name="school_level"
                        defaultValue={student.school_level ?? "o-level"}
                        required
                      >
                        <option value="primary">Primary</option>
                        <option value="o-level">O-Level</option>
                        <option value="a-level">A-Level</option>
                      </select>
                    </label>

                    <label className="grid gap-1">
                      <span className="text-sm">Track</span>
                      <select className="portal-select" name="track" defaultValue={student.track ?? ""}>
                        <option value="">Select</option>
                        <option value="secular">Secular</option>
                        <option value="islamic">Islamic</option>
                      </select>
                    </label>

                    <label className="grid gap-1">
                      <span className="text-sm">Class level</span>
                      <input
                        className="portal-input"
                        name="class_level"
                        defaultValue={student.class_level ?? ""}
                        placeholder="P5, S1, S5..."
                      />
                    </label>

                    <label className="grid gap-1">
                      <span className="text-sm">Stream</span>
                      <input
                        className="portal-input"
                        name="stream"
                        defaultValue={student.stream ?? ""}
                        placeholder="A, B..."
                      />
                    </label>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <label className="grid gap-1">
                      <span className="text-sm">Admission year</span>
                      <input
                        className="portal-input"
                        type="number"
                        name="admission_year"
                        defaultValue={student.admission_year ?? ""}
                        placeholder="2026"
                      />
                    </label>

                    <label className="grid gap-1">
                      <span className="text-sm">Graduation year</span>
                      <input
                        className="portal-input"
                        type="number"
                        name="graduation_year"
                        defaultValue={student.graduation_year ?? ""}
                        placeholder="2030"
                      />
                    </label>

                    <label className="grid gap-1">
                      <span className="text-sm">Admission date</span>
                      <input
                        className="portal-input"
                        type="date"
                        name="admission_date"
                        defaultValue={student.admission_date ?? ""}
                      />
                    </label>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-1">
                      <span className="text-sm">Former school</span>
                      <input
                        className="portal-input"
                        name="former_school"
                        defaultValue={student.former_school ?? ""}
                        placeholder="Previous school"
                      />
                    </label>

                    <label className="grid gap-1">
                      <span className="text-sm">Status</span>
                      <select className="portal-select" name="status" defaultValue={student.status ?? "active"}>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="withdrawn">Withdrawn</option>
                        <option value="graduated">Graduated</option>
                      </select>
                    </label>
                  </div>

                  <label className="grid gap-1">
                    <span className="text-sm">Notes</span>
                    <textarea
                      className="portal-input min-h-[120px]"
                      name="notes"
                      defaultValue={student.notes ?? ""}
                      placeholder="Extra profile notes..."
                    />
                  </label>

                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="is_active" defaultChecked={student.is_active ?? true} />
                    <span className="text-sm">Portal/profile active</span>
                  </label>

                  <div className="pt-1">
                    <button className="portal-btn portal-btn-primary w-full sm:w-fit" type="submit">
                      Save profile
                    </button>
                  </div>
                </form>
              </section>
            ) : (
              <section className="portal-surface p-6">
                <h2 className="text-lg font-semibold text-slate-900">More student details</h2>

                <div className="mt-4 divide-y rounded-xl border border-slate-200 bg-white/70 px-4">
                  <DetailRow label="Student ID" value={student.student_no ?? "Not assigned"} />
                  <DetailRow label="Date of birth" value={student.date_of_birth ?? "Not set"} />
                  <DetailRow label="Sex" value={student.sex ?? "Not set"} />
                  <DetailRow label="Religion" value={student.religion ?? "Not set"} />
                  <DetailRow label="Home village / town" value={student.home_village ?? "Not set"} />
                  <DetailRow label="District" value={student.district ?? "Not set"} />
                  <DetailRow label="Nationality" value={student.nationality ?? "Not set"} />
                  <DetailRow label="Former school" value={student.former_school ?? "Not set"} />
                  <DetailRow label="Notes" value={student.notes ?? "No notes"} />
                </div>
              </section>
            )}

            <section className="portal-surface p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Parent links</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Link this student directly to parent accounts.
                  </p>
                </div>
                <Pill>{linkedParents.length} linked</Pill>
              </div>

              <form method="get" className="mt-4 flex flex-wrap gap-2">
                <input
                  className="portal-input w-full sm:w-80"
                  name="qParent"
                  defaultValue={qParent}
                  placeholder="Search parent name..."
                />
                <button className="portal-btn" type="submit">
                  Search
                </button>
                {qParent ? (
                  <Link className="portal-btn" href={`/portal/admin/students/${student.id}`}>
                    Clear
                  </Link>
                ) : null}
              </form>

              <form action={addParentStudentLink} className="mt-4 grid gap-3">
                <input type="hidden" name="student_id" value={student.id} />
                <input type="hidden" name="back_to_student" value="1" />

                <label className="grid gap-1">
                  <span className="text-sm">Select parent</span>
                  <select className="portal-select" name="parent_id" defaultValue={parentResults[0]?.id ?? ""}>
                    {parentResults.map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {p.full_name} {p.phone ? `• ${p.phone}` : ""}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-1">
                  <span className="text-sm">Relation (optional)</span>
                  <input
                    className="portal-input"
                    name="relation"
                    placeholder="Mother, Father, Guardian..."
                  />
                </label>

                <button
                  className="portal-btn portal-btn-primary w-full sm:w-fit"
                  type="submit"
                  disabled={parentResults.length === 0}
                >
                  Link Parent
                </button>
              </form>

              <div className="mt-5 grid gap-3">
                {linkedParents.map((item: any) => (
                  <div
                    key={item.parent_id}
                    className="rounded-2xl border border-slate-200 bg-white/80 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="font-medium text-slate-900">
                          {item.parents?.full_name ?? item.parent_id}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {item.parents?.phone ? `Phone: ${item.parents.phone}` : "No phone"}
                          {item.relation ? ` • Relation: ${item.relation}` : ""}
                        </div>
                      </div>

                      <form action={removeParentStudentLink}>
                        <input type="hidden" name="parent_id" value={item.parent_id} />
                        <input type="hidden" name="student_id" value={student.id} />
                        <input type="hidden" name="back_to_student" value="1" />
                        <ConfirmSubmitButton
                          className="portal-btn portal-btn-danger"
                          confirmText={`Unlink "${item.parents?.full_name ?? "this parent"}" from "${displayName}"?`}
                          title="Unlink parent"
                        >
                          Unlink
                        </ConfirmSubmitButton>
                      </form>
                    </div>
                  </div>
                ))}

                {linkedParents.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-5 text-sm text-slate-600">
                    No parents linked to this student yet.
                  </div>
                ) : null}
              </div>
            </section>
          </div>
        </div>
      </div>
    </WatermarkedSection>
  );
}