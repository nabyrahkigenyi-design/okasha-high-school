import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  getActiveTermOrNull,
  getMyEnrollmentOrNull,
  getStudentOrThrow,
  one,
} from "@/app/portal/student/queries";

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

  // Fetch announcements for this term:
  // - term-wide: class_id is null
  // - class-specific: class_id = student's class_id
  let query = sb
    .from("announcements")
    .select("id, title, body, term_id, class_id, created_at")
    .eq("term_id", termId)
    .order("created_at", { ascending: false })
    .limit(200);

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  const filtered = (data ?? []).filter((a: any) => a.class_id == null || a.class_id === classId);

  const termName = terms?.find((t: any) => t.id === termId)?.name ?? `Term ${termId}`;

  return (
    <div className="grid gap-6">
      <section className="portal-surface p-5">
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

      <section className="portal-surface p-5">
        <h2 className="text-lg font-semibold">Latest</h2>
        <p className="mt-1 text-sm portal-muted">
          Term-wide announcements and your class announcements.
        </p>

        {filtered.length === 0 ? (
          <div className="mt-4 text-sm portal-muted">No announcements yet for this term.</div>
        ) : (
          <div className="mt-4 grid gap-3">
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
      </section>
    </div>
  );
}