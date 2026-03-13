import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  getActiveTermOrNull,
  getMyEnrollmentOrNull,
  getStudentOrThrow,
  one,
} from "@/app/portal/student/queries";

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border bg-white/70 p-4">
      <div className="text-xs font-semibold tracking-widest text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-bold text-[color:var(--ohs-charcoal)]">{value}</div>
      {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  children,
  right,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <section className="portal-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm portal-muted">{subtitle}</p> : null}
        </div>
        {right ? <div className="flex flex-wrap gap-2">{right}</div> : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default async function StudentAnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<{ termId?: string }>;
}) {
  const params = await searchParams;
  await getStudentOrThrow();
  const sb = supabaseAdmin();

  const { data: terms, error: termErr } = await sb
    .from("academic_terms")
    .select("id, name, is_active")
    .order("id", { ascending: false })
    .limit(50);

  if (termErr) throw new Error(termErr.message);

  const activeTerm = await getActiveTermOrNull();
  const termId =
    params.termId ? Number(params.termId) : activeTerm?.id ?? terms?.[0]?.id ?? null;

  if (!termId) {
    return (
      <div className="portal-surface p-5">
        <h1 className="portal-title">Announcements</h1>
        <p className="portal-subtitle">No academic terms found yet.</p>
      </div>
    );
  }

  const enrollment = await getMyEnrollmentOrNull(termId);
  const cg: any = one(enrollment?.class_groups);
  const classId = enrollment?.class_id ?? null;

  const { data, error } = await sb
    .from("announcements")
    .select("id, title, body, term_id, class_id, created_at")
    .eq("term_id", termId)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) throw new Error(error.message);

  const filtered = (data ?? []).filter(
    (a: any) => a.class_id == null || a.class_id === classId
  );

  const schoolWideCount = filtered.filter((a: any) => a.class_id == null).length;
  const classCount = filtered.filter((a: any) => a.class_id != null).length;
  const termName = terms?.find((t: any) => t.id === termId)?.name ?? `Term ${termId}`;

  return (
    <div className="grid gap-6">
      <section className="portal-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="portal-title">Announcements</h1>
            <p className="portal-subtitle">
              Term: <span className="font-medium">{termName}</span>
              {classId ? (
                <>
                  {" • "}Class: <span className="font-medium">{cg?.name ?? classId}</span>
                </>
              ) : (
                <> • You are not enrolled for this term.</>
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link className="portal-btn" href="/portal/student/dashboard">
              Dashboard
            </Link>
          </div>
        </div>

        <form method="get" className="mt-4 grid gap-2 max-w-md">
          <label className="grid gap-1">
            <span className="text-sm">Term</span>
            <select className="portal-select" name="termId" defaultValue={String(termId)}>
              {(terms ?? []).map((t: any) => (
                <option key={t.id} value={t.id}>
                  {t.name} {t.is_active ? "(active)" : ""}
                </option>
              ))}
            </select>
          </label>
          <button className="portal-btn portal-btn-primary w-fit" type="submit">
            Apply
          </button>
        </form>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Visible notices" value={filtered.length} />
        <StatCard label="School-wide" value={schoolWideCount} />
        <StatCard label="Class notices" value={classCount} />
      </section>

      <SectionCard
        title="Latest announcements"
        subtitle="Term-wide announcements and notices for your class."
        right={
          <span className="portal-badge">
            {filtered.length} item{filtered.length === 1 ? "" : "s"}
          </span>
        }
      >
        {filtered.length === 0 ? (
          <div className="text-sm portal-muted">No announcements yet for this term.</div>
        ) : (
          <div className="grid gap-3">
            {filtered.map((a: any) => (
              <div key={a.id} className="rounded-2xl border bg-white/70 p-4 grid gap-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[color:var(--ohs-charcoal)] truncate">
                      {a.title}
                    </div>
                    <div className="text-xs text-slate-500">
                      {a.class_id ? "Class announcement" : "School-wide"} •{" "}
                      {a.created_at ? new Date(a.created_at).toLocaleString() : ""}
                    </div>
                  </div>
                  <span className="portal-badge">{a.class_id ? "Class" : "School"}</span>
                </div>

                <div className="text-sm text-slate-700 whitespace-pre-wrap">{a.body}</div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}