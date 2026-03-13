import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getActiveTermOrNull, getMyEnrollmentOrNull, getStudentOrThrow, one } from "../queries";

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

export default async function StudentAssignmentsPage({
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

  const now = Date.now();

  const totalAssignments = (items ?? []).length;
  const overdueCount = (items ?? []).filter((a: any) => {
    if (!a.due_at) return false;
    return new Date(a.due_at).getTime() < now;
  }).length;
  const withFilesCount = (items ?? []).filter((a: any) => !!a.attachment_url).length;

  const termName = terms?.find((t: any) => t.id === termId)?.name ?? termId;

  return (
    <div className="grid gap-6">
      <section className="portal-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="portal-title">Assignments</h1>
            <p className="portal-subtitle">
              Term: <span className="font-medium">{termName}</span>
              {" • "}
              Class: <span className="font-medium">{cg?.name ?? enrollment.class_id}</span>
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
        <StatCard label="Assignments" value={totalAssignments} />
        <StatCard label="With files" value={withFilesCount} />
        <StatCard label="Past due" value={overdueCount} hint="Based on due date" />
      </section>

      <SectionCard
        title="Available assignments"
        subtitle="Open attachments if provided. Submission upload can be added later."
        right={
          <span className="portal-badge">
            {totalAssignments} item{totalAssignments === 1 ? "" : "s"}
          </span>
        }
      >
        {(items ?? []).length === 0 ? (
          <div className="text-sm portal-muted">No assignments posted yet.</div>
        ) : (
          <div className="grid gap-3">
            {(items ?? []).map((a: any) => {
              const due = a.due_at ? new Date(a.due_at) : null;
              const isLate = due ? due.getTime() < now : false;

              return (
                <div key={a.id} className="rounded-2xl border bg-white/70 p-4 grid gap-2">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-sm font-semibold text-[color:var(--ohs-charcoal)] truncate">
                          {a.title}
                        </div>
                        {isLate ? <span className="portal-badge">Past due</span> : null}
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        Due: {due ? due.toLocaleString() : "No due date"}
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        Posted: {a.created_at ? new Date(a.created_at).toLocaleString() : "—"}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {a.attachment_url ? (
                        <a
                          className="portal-btn"
                          href={a.attachment_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open file
                        </a>
                      ) : (
                        <span className="portal-badge">No file</span>
                      )}
                    </div>
                  </div>

                  {a.description ? (
                    <div className="text-sm text-slate-700 whitespace-pre-wrap">
                      {a.description}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>
    </div>
  );
}