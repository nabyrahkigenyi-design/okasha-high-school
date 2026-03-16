import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { WatermarkedSection } from "@/components/WatermarkedSection";
import { ToastGate } from "@/components/ToastGate";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import TeacherPhotoField from "../TeacherPhotoField";
import {
  getTeacherById,
  listStaffTitles,
  listTeacherAssignmentsForTeacher,
  listClassTeacherAssignmentsForTeacher,
  listTermsForStaffForm,
  listClassesForStaffForm,
  listSubjectsForStaffForm,
} from "../queries";
import {
  upsertTeacherProfile,
  setTeacherActive,
  createTeacherPortalLogin,
  resetTeacherPortalPassword,
  deleteTeacherProfile,
} from "../actions";
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

function schoolLevelLabel(value: string | null | undefined) {
  if (value === "primary") return "Primary";
  if (value === "o-level") return "O-level";
  if (value === "a-level") return "A-level";
  return value ?? "—";
}

export default async function AdminStaffInternalProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; err?: string }>;
}) {
  await requireRole(["admin"]);

  const { id } = await params;
  const sp = await searchParams;

  const teacher = await getTeacherById(id);

  if (!teacher) {
    return (
      <WatermarkedSection tone="portal" variant="mixed">
        <section className="portal-surface p-6">
          <SectionTitle
            title="Staff not found"
            subtitle="The requested staff record does not exist."
            right={<Link className="portal-btn" href="/portal/admin/staff-internal">Back</Link>}
          />
        </section>
      </WatermarkedSection>
    );
  }

  const [
    titles,
    assignments,
    classTeacherAssignments,
    terms,
    classes,
    subjects,
    portalInfo,
  ] = await Promise.all([
    listStaffTitles(),
    listTeacherAssignmentsForTeacher(teacher.id),
    listClassTeacherAssignmentsForTeacher(teacher.id),
    listTermsForStaffForm(),
    listClassesForStaffForm(),
    listSubjectsForStaffForm(),
    (async () => {
      const admin = supabaseAdmin();

      // New model: teacher.user_id stores auth user id
      if (teacher.user_id) {
        const res = await admin.auth.admin.getUserById(teacher.user_id);
        return {
          hasLogin: !!res.data?.user,
          email: res.data?.user?.email ?? null,
          authUserId: teacher.user_id,
        };
      }

      // Legacy model: teacher.id itself is the auth user id
      const legacyRes = await admin.auth.admin.getUserById(teacher.id);
      if (legacyRes.data?.user) {
        return {
          hasLogin: true,
          email: legacyRes.data.user.email ?? null,
          authUserId: teacher.id,
        };
      }

      return {
        hasLogin: false,
        email: null,
        authUserId: null,
      };
    })(),
  ]);

  const titleRel = teacher.staff_titles as any;
  const titleName = Array.isArray(titleRel)
    ? titleRel[0]?.title_name ?? null
    : titleRel?.title_name ?? null;

  const defaultTermId = terms.find((t: any) => t.is_active)?.id ?? terms[0]?.id ?? "";

  return (
    <WatermarkedSection tone="portal" variant="mixed">
      <ToastGate ok={sp.ok} err={sp.err} okText="Saved." />

      <div className="grid gap-6">
        <section className="portal-surface p-6">
          <SectionTitle
            title={teacher.full_name}
            subtitle="Internal staff profile"
            right={
              <>
                <Link className="portal-btn" href="/portal/admin/staff-internal">
                  Back to Staff Internal
                </Link>
                <Link className="portal-btn" href="/portal/admin/academics?tab=assignments">
                  Subject Assignments
                </Link>
                <Link className="portal-btn" href="/portal/admin/academics?tab=class-teachers">
                  Class Teachers
                </Link>
              </>
            }
          />

          <div className="mt-5 grid gap-5 xl:grid-cols-[180px_1fr]">
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
              <div className="aspect-[3/4] overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                {teacher.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={teacher.photo_url}
                    alt={teacher.full_name}
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
                  {teacher.staff_no || "No staff number"}
                </div>
                <div className="text-slate-600">{titleName || "No title assigned"}</div>
                <div className="flex flex-wrap gap-2">
                  {teacher.is_active ? <Pill>Active</Pill> : <Pill>Inactive</Pill>}
                  {teacher.secular_role ? <Pill>Secular</Pill> : null}
                  {teacher.theology_role ? <Pill>Theology</Pill> : null}
                  {teacher.is_muslim ? <Pill>Muslim</Pill> : null}
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <InfoCard label="Staff number" value={teacher.staff_no ?? "Not set"} />
                <InfoCard label="Title" value={titleName ?? "Not set"} />
                <InfoCard label="Department" value={teacher.department ?? "Not set"} />
                <InfoCard
                  label="Salary"
                  value={
                    teacher.salary_amount != null
                      ? `${teacher.salary_amount}${teacher.salary_frequency ? ` / ${teacher.salary_frequency}` : ""}`
                      : "Not set"
                  }
                />
                <InfoCard label="Status" value={teacher.is_active ? "Active" : "Inactive"} />
              </div>

              <section className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">Profile summary</h2>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <InfoCard label="Phone" value={teacher.phone ?? "Not set"} />
                  <InfoCard label="Email" value={teacher.email ?? "Not set"} />
                  <InfoCard label="Residence" value={teacher.residence ?? "Not set"} />
                  <InfoCard label="Qualification" value={teacher.qualification ?? "Not set"} />
                  <InfoCard label="Employment type" value={teacher.employment_type ?? "Not set"} />
                  <InfoCard label="National ID" value={teacher.national_id ?? "Not set"} />
                  <InfoCard label="Subjects summary" value={teacher.subjects_summary ?? "Not set"} />
                  <InfoCard label="Classes summary" value={teacher.classes_summary ?? "Not set"} />
                </div>
              </section>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <section className="portal-surface p-6">
            <h2 className="text-lg font-semibold text-slate-900">Edit profile</h2>

            <form action={upsertTeacherProfile} className="mt-4 grid gap-6">
              <input type="hidden" name="id" value={teacher.id} />

              <div className="grid gap-4">
                <h3 className="text-base font-semibold text-slate-900">Personal details</h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-1">
                    <span className="text-sm">First name</span>
                    <input className="portal-input" name="first_name" defaultValue={teacher.first_name ?? ""} />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-sm">Last name</span>
                    <input className="portal-input" name="last_name" defaultValue={teacher.last_name ?? ""} />
                  </label>
                </div>

                <label className="grid gap-1">
                  <span className="text-sm">Other names</span>
                  <input className="portal-input" name="other_names" defaultValue={teacher.other_names ?? ""} />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm">Full name</span>
                  <input className="portal-input" name="full_name" defaultValue={teacher.full_name ?? ""} required />
                </label>

                <div className="grid gap-4 md:grid-cols-3">
                  <label className="grid gap-1">
                    <span className="text-sm">Sex</span>
                    <select className="portal-select" name="sex" defaultValue={teacher.sex ?? ""}>
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </label>
                  <label className="grid gap-1">
                    <span className="text-sm">Phone</span>
                    <input className="portal-input" name="phone" defaultValue={teacher.phone ?? ""} />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-sm">Email</span>
                    <input className="portal-input" name="email" defaultValue={teacher.email ?? ""} />
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <label className="grid gap-1">
                    <span className="text-sm">Date of birth</span>
                    <input className="portal-input" type="date" name="date_of_birth" defaultValue={teacher.date_of_birth ?? ""} />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-sm">National ID</span>
                    <input className="portal-input" name="national_id" defaultValue={teacher.national_id ?? ""} />
                  </label>
                  <div className="grid gap-1">
                    <span className="text-sm">Teacher photo</span>
                    <TeacherPhotoField defaultValue={teacher.photo_url ?? ""} />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-1">
                    <span className="text-sm">Residence</span>
                    <input className="portal-input" name="residence" defaultValue={teacher.residence ?? ""} />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-sm">Qualification</span>
                    <input className="portal-input" name="qualification" defaultValue={teacher.qualification ?? ""} />
                  </label>
                </div>
              </div>

              <div className="grid gap-4">
                <h3 className="text-base font-semibold text-slate-900">Work details</h3>

                <div className="grid gap-4 md:grid-cols-3">
                  <label className="grid gap-1">
                    <span className="text-sm">Staff number</span>
                    <input className="portal-input" name="staff_no" defaultValue={teacher.staff_no ?? ""} />
                  </label>

                  <label className="grid gap-1">
                    <span className="text-sm">Title</span>
                    <select className="portal-select" name="title_id" defaultValue={teacher.title_id ?? ""}>
                      <option value="">Select title</option>
                      {titles.map((title: any) => (
                        <option key={title.id} value={title.id}>
                          {title.title_name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-1">
                    <span className="text-sm">Department</span>
                    <input className="portal-input" name="department" defaultValue={teacher.department ?? ""} />
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <label className="grid gap-1">
                    <span className="text-sm">Employment type</span>
                    <input className="portal-input" name="employment_type" defaultValue={teacher.employment_type ?? ""} />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-sm">Salary amount</span>
                    <input
                      className="portal-input"
                      type="number"
                      step="0.01"
                      min="0"
                      name="salary_amount"
                      defaultValue={teacher.salary_amount ?? ""}
                    />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-sm">Salary frequency</span>
                    <input className="portal-input" name="salary_frequency" defaultValue={teacher.salary_frequency ?? ""} />
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-1">
                    <span className="text-sm">Subjects summary</span>
                    <input className="portal-input" name="subjects_summary" defaultValue={teacher.subjects_summary ?? ""} />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-sm">Classes summary</span>
                    <input className="portal-input" name="classes_summary" defaultValue={teacher.classes_summary ?? ""} />
                  </label>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="secular_role" defaultChecked={teacher.secular_role ?? false} />
                    <span className="text-sm">Secular teacher</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="theology_role" defaultChecked={teacher.theology_role ?? false} />
                    <span className="text-sm">Theology teacher</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="is_muslim" defaultChecked={teacher.is_muslim ?? false} />
                    <span className="text-sm">Muslim</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="is_active" defaultChecked={teacher.is_active ?? true} />
                    <span className="text-sm">Active</span>
                  </label>
                </div>
              </div>

              <div className="grid gap-4">
                <h3 className="text-base font-semibold text-slate-900">Academic assignment</h3>
                <p className="text-sm text-slate-600">
                  Use this section to assign this teacher the same way the Academics area does.
                </p>

                <div className="grid gap-4 md:grid-cols-3">
                  <label className="grid gap-1">
                    <span className="text-sm">Term</span>
                    <select className="portal-select" name="assignment_term_id" defaultValue={String(defaultTermId)}>
                      <option value="">No change</option>
                      {terms.map((term: any) => (
                        <option key={term.id} value={term.id}>
                          {term.name} {term.is_active ? "(active)" : ""}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-1">
                    <span className="text-sm">Class</span>
                    <select className="portal-select" name="assignment_class_id" defaultValue="">
                      <option value="">Select class</option>
                      {classes.map((c: any) => (
                        <option key={c.id} value={c.id}>
                          {c.name} • {schoolLevelLabel(c.school_level)}{" "}
                          {c.track_key === "islamic" ? "(Islamic)" : "(Secular)"}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-1">
                    <span className="text-sm">Subject</span>
                    <select className="portal-select" name="assignment_subject_id" defaultValue="">
                      <option value="">Select subject</option>
                      {subjects.map((subject: any) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.code ? `${subject.code} — ` : ""}
                          {subject.name}
                          {subject.school_level ? ` • ${schoolLevelLabel(subject.school_level)}` : ""}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="assign_as_class_teacher" />
                    <span className="text-sm">Assign as class teacher</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="assign_as_subject_teacher" />
                    <span className="text-sm">Assign as subject teacher</span>
                  </label>
                </div>
              </div>

              <label className="grid gap-1">
                <span className="text-sm">Notes</span>
                <textarea className="portal-input min-h-[120px]" name="notes" defaultValue={teacher.notes ?? ""} />
              </label>

              <div className="pt-1">
                <button className="portal-btn portal-btn-primary w-full sm:w-fit" type="submit">
                  Save Profile
                </button>
              </div>
            </form>
          </section>

          <div className="grid gap-6">
            {!portalInfo.hasLogin ? (
              <section className="portal-surface p-6">
                <h2 className="text-lg font-semibold text-slate-900">Create portal login</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Create a login so this teacher can access the portal.
                </p>

                <form action={createTeacherPortalLogin} className="mt-4 grid gap-3">
                  <input type="hidden" name="id" value={teacher.id} />

                  <label className="grid gap-1">
                    <span className="text-sm">Login email</span>
                    <input className="portal-input" type="email" name="email" required />
                  </label>

                  <label className="grid gap-1">
                    <span className="text-sm">Temporary password</span>
                    <input className="portal-input" type="password" name="password" required />
                  </label>

                  <button className="portal-btn portal-btn-primary w-full sm:w-fit" type="submit">
                    Create Portal Login
                  </button>
                </form>
              </section>
            ) : (
              <section className="portal-surface p-6">
                <h2 className="text-lg font-semibold text-slate-900">Portal account</h2>
                <p className="mt-1 text-sm text-slate-600">
                  The old password cannot be viewed again, but you can always see the login email and set a new temporary password.
                </p>

                <div className="mt-4 grid gap-3">
                  <InfoCard label="Login email" value={portalInfo.email ?? "Email not found"} />

                  <form action={resetTeacherPortalPassword} className="grid gap-3">
                    <input type="hidden" name="id" value={teacher.id} />
                    <label className="grid gap-1">
                      <span className="text-sm">New temporary password</span>
                      <input className="portal-input" type="password" name="password" required />
                    </label>
                    <button className="portal-btn portal-btn-primary w-full sm:w-fit" type="submit">
                      Reset Password
                    </button>
                  </form>
                </div>
              </section>
            )}

            <section className="portal-surface p-6">
              <h2 className="text-lg font-semibold text-slate-900">Assignments</h2>

              <div className="mt-4 grid gap-3">
                <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                  <div className="text-sm font-semibold text-slate-900">Subject teacher assignments</div>
                  <div className="mt-3 grid gap-2">
                    {assignments.length > 0 ? (
                      assignments.map((item: any) => (
                        <div key={item.id} className="rounded-xl border border-slate-200 bg-white/70 p-3 text-sm">
                          <div className="font-medium text-slate-900">
                            {item.class_groups?.name ?? "Class"} • {item.subjects?.name ?? "Subject"}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            {item.academic_terms?.name ?? "Term"} • {item.subjects?.code ?? ""}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-slate-500">No subject assignments yet.</div>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                  <div className="text-sm font-semibold text-slate-900">Class teacher assignments</div>
                  <div className="mt-3 grid gap-2">
                    {classTeacherAssignments.length > 0 ? (
                      classTeacherAssignments.map((item: any) => (
                        <div key={item.id} className="rounded-xl border border-slate-200 bg-white/70 p-3 text-sm">
                          <div className="font-medium text-slate-900">
                            {item.class_groups?.name ?? "Class"}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            {item.academic_terms?.name ?? "Term"}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-slate-500">No class teacher assignments yet.</div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="portal-surface p-6">
              <h2 className="text-lg font-semibold text-slate-900">Danger zone</h2>

              <div className="mt-4 flex flex-wrap gap-2">
                <form action={setTeacherActive}>
                  <input type="hidden" name="id" value={teacher.id} />
                  <input type="hidden" name="is_active" value={teacher.is_active ? "false" : "true"} />
                  <button className="portal-btn" type="submit">
                    {teacher.is_active ? "Deactivate" : "Activate"}
                  </button>
                </form>

                <form action={deleteTeacherProfile}>
                  <input type="hidden" name="id" value={teacher.id} />
                  <ConfirmSubmitButton
                    className="portal-btn portal-btn-danger"
                    confirmText={`Delete "${teacher.full_name}" permanently?\n\nThis removes subject assignments, class teacher assignments, grades entered by this teacher, attendance sessions tied to this teacher's assignments, and login details if any.`}
                    title="Delete staff record"
                  >
                    Delete Staff Record
                  </ConfirmSubmitButton>
                </form>
              </div>
            </section>
          </div>
        </div>
      </div>
    </WatermarkedSection>
  );
}
