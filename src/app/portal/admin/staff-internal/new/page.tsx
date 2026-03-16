import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { WatermarkedSection } from "@/components/WatermarkedSection";
import { ToastGate } from "@/components/ToastGate";
import { upsertTeacherProfile } from "../actions";
import {
  listStaffTitles,
  listTermsForStaffForm,
  listClassesForStaffForm,
  listSubjectsForStaffForm,
} from "../queries";
import TeacherPhotoField from "../TeacherPhotoField";

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

function schoolLevelLabel(value: string | null | undefined) {
  if (value === "primary") return "Primary";
  if (value === "o-level") return "O-level";
  if (value === "a-level") return "A-level";
  return value ?? "—";
}

export default async function AdminNewStaffInternalPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; err?: string }>;
}) {
  await requireRole(["admin"]);
  const sp = await searchParams;

  const [titles, terms, classes, subjects] = await Promise.all([
    listStaffTitles(),
    listTermsForStaffForm(),
    listClassesForStaffForm(),
    listSubjectsForStaffForm(),
  ]);

  const defaultTermId = terms.find((t: any) => t.is_active)?.id ?? terms[0]?.id ?? "";

  return (
    <WatermarkedSection tone="portal" variant="mixed">
      <ToastGate ok={sp.ok} err={sp.err} okText="Saved." />

      <div className="grid gap-6">
        <section className="portal-surface p-6">
          <SectionTitle
            title="Register Staff"
            subtitle="Create a new internal teacher or staff record."
            right={
              <Link className="portal-btn" href="/portal/admin/staff-internal">
                Back to Staff Internal
              </Link>
            }
          />
        </section>

        <section className="portal-surface p-6">
          <form action={upsertTeacherProfile} className="grid gap-6">
            <div className="grid gap-4">
              <h2 className="text-lg font-semibold text-slate-900">Personal details</h2>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-1">
                  <span className="text-sm">First name</span>
                  <input className="portal-input" name="first_name" placeholder="First name" />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm">Last name</span>
                  <input className="portal-input" name="last_name" placeholder="Last name" />
                </label>
              </div>

              <label className="grid gap-1">
                <span className="text-sm">Other names</span>
                <input className="portal-input" name="other_names" placeholder="Other names" />
              </label>

              <label className="grid gap-1">
                <span className="text-sm">Full name</span>
                <input
                  className="portal-input"
                  name="full_name"
                  placeholder="Full official name"
                  required
                />
              </label>

              <div className="grid gap-4 md:grid-cols-3">
                <label className="grid gap-1">
                  <span className="text-sm">Sex</span>
                  <select className="portal-select" name="sex" defaultValue="">
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </label>

                <label className="grid gap-1">
                  <span className="text-sm">Phone</span>
                  <input className="portal-input" name="phone" placeholder="Phone" />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm">Email</span>
                  <input className="portal-input" name="email" placeholder="Email" />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <label className="grid gap-1">
                  <span className="text-sm">Date of birth</span>
                  <input className="portal-input" type="date" name="date_of_birth" />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm">National ID</span>
                  <input className="portal-input" name="national_id" placeholder="National ID" />
                </label>

                <div className="grid gap-1">
                  <span className="text-sm">Teacher photo</span>
                  <TeacherPhotoField />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-1">
                  <span className="text-sm">Residence</span>
                  <input className="portal-input" name="residence" placeholder="Residence" />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm">Qualification</span>
                  <input className="portal-input" name="qualification" placeholder="Qualification" />
                </label>
              </div>
            </div>

            <div className="grid gap-4">
              <h2 className="text-lg font-semibold text-slate-900">Work details</h2>

              <div className="grid gap-4 md:grid-cols-3">
                <label className="grid gap-1">
                  <span className="text-sm">Staff number</span>
                  <input className="portal-input" name="staff_no" placeholder="Staff number" />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm">Title</span>
                  <select className="portal-select" name="title_id" defaultValue="">
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
                  <input className="portal-input" name="department" placeholder="Department" />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <label className="grid gap-1">
                  <span className="text-sm">Employment type</span>
                  <input
                    className="portal-input"
                    name="employment_type"
                    placeholder="Full-time, Part-time..."
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm">Salary amount</span>
                  <input
                    className="portal-input"
                    type="number"
                    step="0.01"
                    min="0"
                    name="salary_amount"
                    placeholder="0.00"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm">Salary frequency</span>
                  <input className="portal-input" name="salary_frequency" placeholder="Monthly" />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-1">
                  <span className="text-sm">Subjects summary</span>
                  <input
                    className="portal-input"
                    name="subjects_summary"
                    placeholder="Biology, Chemistry..."
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm">Classes summary</span>
                  <input
                    className="portal-input"
                    name="classes_summary"
                    placeholder="Senior 1 B, Senior 2 C..."
                  />
                </label>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="secular_role" />
                  <span className="text-sm">Secular teacher</span>
                </label>

                <label className="flex items-center gap-2">
                  <input type="checkbox" name="theology_role" />
                  <span className="text-sm">Theology teacher</span>
                </label>

                <label className="flex items-center gap-2">
                  <input type="checkbox" name="is_muslim" />
                  <span className="text-sm">Muslim</span>
                </label>

                <label className="flex items-center gap-2">
                  <input type="checkbox" name="is_active" defaultChecked />
                  <span className="text-sm">Active</span>
                </label>
              </div>
            </div>

            <div className="grid gap-4">
              <h2 className="text-lg font-semibold text-slate-900">Portal access (optional now)</h2>

              <label className="flex items-center gap-2">
                <input type="checkbox" name="create_portal_user" value="1" />
                <span className="text-sm">Create a portal login for this teacher now</span>
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-1">
                  <span className="text-sm">Login email</span>
                  <input
                    className="portal-input"
                    type="email"
                    name="login_email"
                    placeholder="teacher@example.com"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm">Temporary password</span>
                  <input
                    className="portal-input"
                    type="password"
                    name="login_password"
                    placeholder="Minimum 8 characters"
                  />
                </label>
              </div>
            </div>

            <div className="grid gap-4">
              <h2 className="text-lg font-semibold text-slate-900">Academic assignment (optional)</h2>
              <p className="text-sm text-slate-600">
                Assign this staff member academically now so the teacher portal can immediately reflect class and subject responsibility.
              </p>

              <div className="grid gap-4 md:grid-cols-3">
                <label className="grid gap-1">
                  <span className="text-sm">Term</span>
                  <select className="portal-select" name="assignment_term_id" defaultValue={String(defaultTermId)}>
                    <option value="">No assignment now</option>
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

              <div className="rounded-xl border bg-white/70 p-3 text-xs text-slate-600">
                You can leave this section empty and assign the teacher later from Academics.
              </div>
            </div>

            <label className="grid gap-1">
              <span className="text-sm">Notes</span>
              <textarea
                className="portal-input min-h-[120px]"
                name="notes"
                placeholder="Extra staff notes..."
              />
            </label>

            <div className="pt-1">
              <button className="portal-btn portal-btn-primary w-full sm:w-fit" type="submit">
                Create Staff Record
              </button>
            </div>
          </form>
        </section>
      </div>
    </WatermarkedSection>
  );
}
