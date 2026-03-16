import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { WatermarkedSection } from "@/components/WatermarkedSection";
import { ToastGate } from "@/components/ToastGate";
import { supabaseAdmin } from "@/lib/supabase/admin";
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
  const sb = supabaseAdmin();

  const [{ data: terms, error: termsError }, { data: classes, error: classesError }] =
    await Promise.all([
      sb
        .from("academic_terms")
        .select("id, name, is_active")
        .order("id", { ascending: false })
        .limit(100),
      sb
        .from("class_groups")
        .select("id, name, level, stream, track_key, is_active")
        .eq("is_active", true)
        .order("level", { ascending: true })
        .order("stream", { ascending: true, nullsFirst: false })
        .order("name", { ascending: true })
        .limit(300),
    ]);

  if (termsError) throw new Error(termsError.message);
  if (classesError) throw new Error(classesError.message);

  const activeTermId = terms?.find((t: any) => t.is_active)?.id ?? terms?.[0]?.id ?? "";
  const defaultClassId = classes?.[0]?.id ?? "";

  return (
    <WatermarkedSection tone="portal" variant="mixed">
      <ToastGate ok={sp.ok} err={sp.err} okText="Student created." />

      <div className="grid gap-6">
        <section className="portal-surface p-6">
          <SectionTitle
            title="Register Student"
            subtitle="Create a permanent student record, assign a student ID, and enroll the student into a real class."
            right={
              <>
                <Link className="portal-btn" href="/portal/admin/students">
                  Back to Students
                </Link>
                <Link className="portal-btn" href="/portal/admin/academics?tab=enrollments">
                  Enrollments
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
              <h2 className="text-lg font-semibold text-slate-900">Academic placement</h2>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-1">
                  <span className="text-sm">Term</span>
                  <select className="portal-select" name="term_id" defaultValue={String(activeTermId)} required>
                    {(terms ?? []).map((t: any) => (
                      <option key={t.id} value={t.id}>
                        {t.name} {t.is_active ? "(active)" : ""}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-1">
                  <span className="text-sm">Class</span>
                  <select className="portal-select" name="class_id" defaultValue={String(defaultClassId)} required>
                    {(classes ?? []).map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                        {c.level ? ` • ${c.level}` : ""}
                        {c.stream ? ` • Stream ${c.stream}` : ""}
                        {c.track_key === "islamic" ? " • Islamic" : " • Secular"}
                      </option>
                    ))}
                  </select>
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

              <div className="rounded-xl border bg-white/70 p-3 text-xs text-slate-600">
                The selected class will be used to create the student’s real enrollment for the chosen term.
                School level, track, class level, and stream will be derived from that class automatically.
              </div>
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
