import Link from "next/link";
import { ToastGate } from "@/components/ToastGate";
import { createTeacherAnnouncement, deleteTeacherAnnouncement } from "./actions";
import { listMyAssignmentScopes, listMyAnnouncements } from "./queries";

type Rel<T> = T | T[] | null | undefined;

function one<T>(v: Rel<T>): T | null {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

function TrackBadge({ track }: { track?: string | null }) {
  const islamic = track === "islamic";

  return (
    <span className={`portal-badge ${islamic ? "portal-badge-islamic" : "portal-badge-secular"}`}>
      {islamic ? "Islamic Theology" : "Secular"}
    </span>
  );
}

function InfoPill({ text }: { text: string }) {
  return <span className="portal-badge">{text}</span>;
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

      <section className="portal-surface p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h1 className="portal-title">Announcements</h1>
            <p className="portal-subtitle">
              Post updates for one of your assigned class and term scopes.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link className="portal-btn" href="/portal/teacher/dashboard">
              Dashboard
            </Link>
          </div>
        </div>

        <form method="get" className="mt-4 grid max-w-2xl gap-3 md:grid-cols-[1fr_auto]">
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

          <div className="flex items-end">
            <button className="portal-btn portal-btn-primary w-full md:w-auto" type="submit">
              Open
            </button>
          </div>
        </form>

        {selected ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white/75 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="text-base font-semibold text-slate-900">
                  {term?.name ?? `Term ${selected.term_id}`} • {cg?.name ?? `Class ${selected.class_id}`}
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  Level: {cg?.level ?? "—"}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <TrackBadge track={cg?.track_key} />
                <InfoPill text={`${items.length} post${items.length === 1 ? "" : "s"}`} />
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white/60 p-4 text-sm text-slate-600">
            No teaching assignments found. Ask admin to assign you to a class and subject.
          </div>
        )}
      </section>

      {selected ? (
        <>
          <section className="portal-surface p-4 sm:p-5">
            <h2 className="text-lg font-semibold text-slate-900">Post new announcement</h2>

            <form action={createTeacherAnnouncement} className="mt-4 grid gap-3">
              <input type="hidden" name="teacher_assignment_id" value={selected.id} />

              <label className="grid gap-1">
                <span className="text-sm">Title</span>
                <input
                  className="portal-input"
                  name="title"
                  required
                  placeholder="Reminder: Homework due Friday"
                />
              </label>

              <label className="grid gap-1">
                <span className="text-sm">Message</span>
                <textarea
                  className="portal-input min-h-[120px]"
                  name="body"
                  required
                  placeholder="Write the announcement..."
                />
              </label>

              <button className="portal-btn portal-btn-primary w-full sm:w-fit" type="submit">
                Post announcement
              </button>
            </form>
          </section>

          <section className="portal-surface p-4 sm:p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-slate-900">My posts</h2>
              <span className="portal-badge">{items.length} total</span>
            </div>

            {items.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white/60 p-4 text-sm text-slate-600">
                No announcements posted yet for this class and term.
              </div>
            ) : (
              <div className="mt-4 grid gap-3">
                {items.map((a: any) => (
                  <div
                    key={a.id}
                    className="rounded-2xl border border-slate-200 bg-white/80 p-4"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="text-base font-semibold text-slate-900">{a.title}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          {a.created_at ? new Date(a.created_at).toLocaleString() : ""}
                        </div>
                        <div className="mt-3 whitespace-pre-wrap text-sm text-slate-700">
                          {a.body}
                        </div>
                      </div>

                      <form action={deleteTeacherAnnouncement}>
                        <input type="hidden" name="id" value={a.id} />
                        <input type="hidden" name="scope" value={selected.id} />
                        <button className="portal-btn portal-btn-danger w-full sm:w-auto" type="submit">
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}