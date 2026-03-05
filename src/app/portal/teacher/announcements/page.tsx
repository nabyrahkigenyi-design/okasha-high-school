import Link from "next/link";
import { ToastGate } from "@/components/ToastGate";
import { createTeacherAnnouncement, deleteTeacherAnnouncement } from "./actions";
import { listMyAssignmentScopes, listMyAnnouncements } from "./queries";

type Rel<T> = T | T[] | null | undefined;
function one<T>(v: Rel<T>): T | null {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

export default async function TeacherAnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string; ok?: string; err?: string }>;
}) {
  const params = await searchParams;
  const scopeId = params.scope ? Number(params.scope) : 0;

  const scopes = await listMyAssignmentScopes();
  const selected = scopeId ? scopes.find((s: any) => s.id === scopeId) : scopes[0] ?? null;

  const term = one(selected?.academic_terms) as any;
  const cg = one(selected?.class_groups) as any;

  const items = selected ? await listMyAnnouncements(selected.term_id, selected.class_id) : [];

  return (
    <div className="grid gap-6">
      <ToastGate ok={params.ok} err={params.err} okText="Announcement posted." />

      <section className="portal-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="portal-title">Announcements</h1>
            <p className="portal-subtitle">
              Post announcements for your assigned classes (term-specific).
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link className="portal-btn" href="/portal/teacher/dashboard">Dashboard</Link>
          </div>
        </div>

        <form method="get" className="mt-4 grid gap-2 max-w-xl">
          <label className="grid gap-1">
            <span className="text-sm">Class / Term scope</span>
            <select className="portal-select" name="scope" defaultValue={selected?.id ?? ""}>
              {scopes.map((s: any) => {
                const t = one(s.academic_terms) as any;
                const c = one(s.class_groups) as any;
                return (
                  <option key={s.id} value={s.id}>
                    {t?.name ?? `Term ${s.term_id}`} • {c?.name ?? `Class ${s.class_id}`}
                  </option>
                );
              })}
            </select>
          </label>
          <button className="portal-btn portal-btn-primary w-fit" type="submit">
            Open
          </button>
        </form>

        {selected ? (
          <div className="mt-4 rounded-xl border bg-white/70 p-4">
            <div className="font-medium">
              {term?.name ?? `Term ${selected.term_id}`} • {cg?.name ?? `Class ${selected.class_id}`}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Track: {cg?.track_key ?? "—"} • Level: {cg?.level ?? "—"}
            </div>
          </div>
        ) : (
          <div className="mt-4 text-sm portal-muted">
            No teaching assignments found. Ask admin to assign you.
          </div>
        )}
      </section>

      {selected ? (
        <>
          <section className="portal-surface p-5">
            <h2 className="text-lg font-semibold">Post new</h2>

            <form action={createTeacherAnnouncement} className="mt-4 grid gap-3">
              <input type="hidden" name="teacher_assignment_id" value={selected.id} />

              <label className="grid gap-1">
                <span className="text-sm">Title</span>
                <input className="portal-input" name="title" required placeholder="Reminder: Homework due Friday" />
              </label>

              <label className="grid gap-1">
                <span className="text-sm">Message</span>
                <textarea className="portal-input min-h-[120px]" name="body" required placeholder="Write the announcement..." />
              </label>

              <button className="portal-btn portal-btn-primary w-fit" type="submit">
                Post announcement
              </button>
            </form>
          </section>

          <section className="portal-surface p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">My posts</h2>
              <span className="portal-badge">{items.length} total</span>
            </div>

            <div className="mt-4 grid gap-3">
              {items.map((a: any) => (
                <div key={a.id} className="rounded-2xl border bg-white/70 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">{a.title}</div>
                      <div className="text-xs text-slate-500">
                        {a.created_at ? new Date(a.created_at).toLocaleString() : ""}
                      </div>
                    </div>

                    <form action={deleteTeacherAnnouncement}>
                      <input type="hidden" name="id" value={a.id} />
                      <input type="hidden" name="scope" value={selected.id} />
                      <button className="portal-btn portal-btn-danger" type="submit">
                        Delete
                      </button>
                    </form>
                  </div>

                  <div className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{a.body}</div>
                </div>
              ))}

              {items.length === 0 ? (
                <div className="text-sm portal-muted">No announcements posted yet for this class/term.</div>
              ) : null}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}