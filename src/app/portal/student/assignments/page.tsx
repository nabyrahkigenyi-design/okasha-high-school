import { supabaseAdmin } from "@/lib/supabase/admin";
import { getActiveTermOrNull, getMyEnrollmentOrNull, getStudentOrThrow, one } from "../queries";

export default async function StudentAssignmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ termId?: string }>;
}) {
  const params = await searchParams;
  const student = await getStudentOrThrow();
  const sb = supabaseAdmin();

  const { data: terms, error: termErr } = await sb
    .from("academic_terms")
    .select("id, name, is_active")
    .order("id", { ascending: false })
    .limit(50);

  if (termErr) throw new Error(termErr.message);

  const activeTerm = await getActiveTermOrNull();
  const termId = params.termId ? Number(params.termId) : activeTerm?.id ?? terms?.[0]?.id ?? null;

  if (!termId) {
    return (
      <div className="portal-surface p-5">
        <h1 className="portal-title">Assignments</h1>
        <p className="portal-subtitle">No academic terms found yet.</p>
      </div>
    );
  }

  const enrollment = await getMyEnrollmentOrNull(termId);
  const cg: any = one(enrollment?.class_groups);

  if (!enrollment?.class_id) {
    return (
      <div className="grid gap-6">
        <section className="portal-surface p-5">
          <h1 className="portal-title">Assignments</h1>
          <p className="portal-subtitle">View assignments for your class and term.</p>

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

        <section className="portal-surface p-5 text-sm portal-muted">
          You are not enrolled in a class for this term.
        </section>
      </div>
    );
  }

  const { data: items, error: itemsErr } = await sb
    .from("assignments")
    .select("id, title, description, due_at, attachment_url, created_at")
    .eq("term_id", termId)
    .eq("class_id", enrollment.class_id)
    .order("due_at", { ascending: true })
    .limit(200);

  if (itemsErr) throw new Error(itemsErr.message);

  return (
    <div className="grid gap-6">
      <section className="portal-surface p-5">
        <h1 className="portal-title">Assignments</h1>
        <p className="portal-subtitle">
          Term: <span className="font-medium">{terms?.find((t: any) => t.id === termId)?.name ?? termId}</span>
          {" • "}
          Class: <span className="font-medium">{cg?.name ?? enrollment.class_id}</span>
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
        <h2 className="text-lg font-semibold">Available assignments</h2>
        <p className="mt-1 text-sm portal-muted">
          Open attachments if provided. (Submissions can be added later.)
        </p>

        {(items ?? []).length === 0 ? (
          <div className="mt-4 text-sm portal-muted">No assignments posted yet.</div>
        ) : (
          <div className="mt-4 grid gap-3">
            {(items ?? []).map((a: any) => {
              const due = a.due_at ? new Date(a.due_at) : null;
              const isLate = due ? due.getTime() < Date.now() : false;

              return (
                <div key={a.id} className="rounded-2xl border bg-white/70 p-4 grid gap-2">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[color:var(--ohs-charcoal)] truncate">{a.title}</div>
                      <div className="text-xs text-slate-500">
                        Due: {due ? due.toLocaleString() : "No due date"} {isLate ? "• past due" : ""}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {a.attachment_url ? (
                        <a className="portal-btn" href={a.attachment_url} target="_blank" rel="noreferrer">
                          Open file
                        </a>
                      ) : (
                        <span className="portal-badge">No file</span>
                      )}
                    </div>
                  </div>

                  {a.description ? (
                    <div className="text-sm text-slate-700 whitespace-pre-wrap">{a.description}</div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}