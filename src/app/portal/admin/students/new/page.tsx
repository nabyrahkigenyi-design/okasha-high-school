import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { WatermarkedSection } from "@/components/WatermarkedSection";
import { ToastGate } from "@/components/ToastGate";
import { createStudentProfile } from "./actions";
import StudentPhotoField from "../StudentPhotoField";

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

export default async function AdminNewStudentPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; err?: string }>;
}) {
  await requireRole(["admin"]);
  const sp = await searchParams;

  return (
    <WatermarkedSection tone="portal" variant="mixed">
      <ToastGate ok={sp.ok} err={sp.err} okText="Student created." />

      <div className="grid gap-6">
        <section className="portal-surface p-6">
          <SectionTitle
            title="Register Student"
            subtitle="Create a permanent student record and assign an official student ID."
            right={
              <>
                <Link className="portal-btn" href="/portal/admin/students">
                  Back to Students
                </Link>
                <Link className="portal-btn" href="/portal/admin/users">
                  Users
                </Link>
              </>
            }
          />
        </section>

        <section className="portal-surface p-6">
          <form action={createStudentProfile} className="grid gap-6">
            <div className="grid gap-4">
              <h2 className="text-lg font-semibold text-slate-900">Student identity</h2>

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
                <input className="portal-input" name="full_name" placeholder="Full official name" required />
              </label>

              <div className="grid gap-4 md:grid-cols-3">
                <label className="grid gap-1">
                  <span className="text-sm">Date of birth</span>
                  <input className="portal-input" type="date" name="date_of_birth" />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm">Sex</span>
                  <select className="portal-select" name="sex" defaultValue="">
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </label>

                <label className="grid gap-1">
                  <span className="text-sm">Religion</span>
                  <input className="portal-input" name="religion" placeholder="Religion" />
                </label>
              </div>
            </div>

            <div className="grid gap-4">
              <h2 className="text-lg font-semibold text-slate-900">Home background</h2>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-1">
                  <span className="text-sm">Home village / town</span>
                  <input className="portal-input" name="home_village" placeholder="Village or town" />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm">District</span>
                  <input className="portal-input" name="district" placeholder="District" />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-1">
                  <span className="text-sm">Nationality</span>
                  <input className="portal-input" name="nationality" placeholder="Nationality" />
                </label>

                <div className="grid gap-1">
                  <span className="text-sm">Student photo</span>
                  <StudentPhotoField />
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <h2 className="text-lg font-semibold text-slate-900">School placement</h2>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <label className="grid gap-1">
                  <span className="text-sm">School level</span>
                  <select className="portal-select" name="school_level" defaultValue="o-level" required>
                    <option value="primary">Primary</option>
                    <option value="o-level">O-Level</option>
                    <option value="a-level">A-Level</option>
                  </select>
                </label>

                <label className="grid gap-1">
                  <span className="text-sm">Track</span>
                  <select className="portal-select" name="track" defaultValue="">
                    <option value="">Select</option>
                    <option value="secular">Secular</option>
                    <option value="islamic">Islamic</option>
                  </select>
                </label>

                <label className="grid gap-1">
                  <span className="text-sm">Class level</span>
                  <input className="portal-input" name="class_level" placeholder="P5, S1, S5..." />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm">Stream</span>
                  <input className="portal-input" name="stream" placeholder="A, B..." />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <label className="grid gap-1">
                  <span className="text-sm">Admission year</span>
                  <input
                    className="portal-input"
                    type="number"
                    name="admission_year"
                    defaultValue={new Date().getFullYear()}
                    required
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm">Graduation year</span>
                  <input className="portal-input" type="number" name="graduation_year" placeholder="Optional" />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm">Admission date</span>
                  <input className="portal-input" type="date" name="admission_date" />
                </label>
              </div>

              <label className="grid gap-1">
                <span className="text-sm">Former school</span>
                <input className="portal-input" name="former_school" placeholder="Previous school" />
              </label>

              <label className="grid gap-1">
                <span className="text-sm">Notes</span>
                <textarea
                  className="portal-input min-h-[120px]"
                  name="notes"
                  placeholder="Additional registration notes..."
                />
              </label>
            </div>

            <div className="grid gap-4">
              <h2 className="text-lg font-semibold text-slate-900">Portal access (optional for now)</h2>

              <label className="flex items-center gap-2">
                <input type="checkbox" name="create_portal_user" value="1" />
                <span className="text-sm">Create a portal login for this student now</span>
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-1">
                  <span className="text-sm">Email</span>
                  <input className="portal-input" type="email" name="email" placeholder="student@example.com" />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm">Temporary password</span>
                  <input className="portal-input" type="password" name="password" placeholder="Minimum 8 characters" />
                </label>
              </div>

              <div className="rounded-xl border bg-white/70 p-3 text-xs text-slate-600">
                Student IDs are generated automatically by school level:
                Primary → S2026-P001, O-Level → S2026-1001, A-Level → S2026-2001.
              </div>
            </div>

            <div className="pt-2">
              <button className="portal-btn portal-btn-primary w-full sm:w-fit" type="submit">
                Register student
              </button>
            </div>
          </form>
        </section>
      </div>
    </WatermarkedSection>
  );
}