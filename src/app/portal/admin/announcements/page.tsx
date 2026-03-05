import Link from "next/link";
import { ToastGate } from "@/components/ToastGate";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import { createAdminAnnouncement, deleteAdminAnnouncement } from "./actions";
import { listAnnouncements, listClasses, listTerms } from "./queries";

export default async function AdminAnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<{ termId?: string; ok?: string; err?: string }>;
}) {
  const params = await searchParams;
  const terms = await listTerms();
  const classes = await listClasses();

  const termId = params.termId ? Number(params.termId) : (terms.find((t: any) => t.is_active)?.id ?? terms[0]?.id ?? null);

  const items = await listAnnouncements(termId ?? undefined);

  return (
    <div className="grid gap-6">
      <ToastGate ok={params.ok} err={params.err} okText="Announcement posted." />

      <section className="portal-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="portal-title">Announcements</h1>
            <p className="portal-subtitle">Post term-wide or class announcements (term-specific).</p>
          </div>
          <Link className="portal-btn" href="/portal/admin/dashboard">Admin Dashboard</Link>
        </div>

        <form action={createAdminAnnouncement} className="mt-4 grid gap-3">
          <label className="grid gap-1 max-w-xl">
            <span className="text-sm">Term</span>
            <select className="portal-select" name="term_id" defaultValue={termId ?? undefined}>
              {terms.map((t: any) => (
                <option key={t.id} value={t.id}>
                  {t.name} {t.is_active ? "(active)" : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 max-w-xl">
            <span className="text-sm">Class (optional)</span>
            <select className="portal-select" name="class_id" defaultValue="">
              <option value="">Whole school (for this term)</option>
              {classes.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name} • {c.level} • {c.track_key}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 max-w-xl">
            <span className="text-sm">Title</span>
            <input className="portal-input" name="title" required placeholder="School assembly on Monday" />
          </label>

          <label className="grid gap-1 max-w-xl">
            <span className="text-sm">Message</span>
            <textarea className="portal-input min-h-[120px]" name="body" required placeholder="Write the announcement..." />
          </label>

          <button className="portal-btn portal-btn-primary w-fit" type="submit">
            Post
          </button>
        </form>
      </section>

      <section className="portal-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Recent posts</h2>

          <form method="get" className="flex flex-wrap items-end gap-2">
            <label className="grid gap-1">
              <span className="text-sm">Filter by term</span>
              <select className="portal-select" name="termId" defaultValue={termId ?? undefined}>
                {terms.map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {t.name} {t.is_active ? "(active)" : ""}
                  </option>
                ))}
              </select>
            </label>
            <button className="portal-btn" type="submit">Apply</button>
          </form>
        </div>

        <div className="mt-4 grid gap-3">
          {items.map((a: any) => (
            <div key={a.id} className="rounded-2xl border bg-white/70 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">
                    {a.title}
                  </div>
                  <div className="text-xs text-slate-500">
                    {a.class_id ? `Class ID: ${a.class_id}` : "Whole school"} •{" "}
                    {a.created_at ? new Date(a.created_at).toLocaleString() : ""}
                  </div>
                </div>

                <form action={deleteAdminAnnouncement}>
                  <input type="hidden" name="id" value={a.id} />
                  <input type="hidden" name="term_id" value={termId ?? ""} />
                  <ConfirmSubmitButton
                    className="portal-btn portal-btn-danger"
                    confirmText={`Delete announcement "${a.title}"?`}
                  >
                    Delete
                  </ConfirmSubmitButton>
                </form>
              </div>

              <div className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{a.body}</div>
            </div>
          ))}

          {items.length === 0 ? (
            <div className="text-sm portal-muted">No announcements posted yet.</div>
          ) : null}
        </div>
      </section>
    </div>
  );
}