// src/app/portal/admin/news/page.tsx

import Link from "next/link";
import { WatermarkedSection } from "@/components/WatermarkedSection";
import { ToastGate } from "@/components/ToastGate";
import { listNewsAdmin, getNewsAdmin } from "./queries";
import NewsEditor from "./NewsEditor";

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="portal-badge">{children}</span>;
}

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

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "published"
      ? "portal-badge portal-badge-secular"
      : status === "draft"
        ? "portal-badge"
        : "portal-badge";

  const label = status === "published" ? "Published" : status === "draft" ? "Draft" : status;

  return <span className={cls}>{label}</span>;
}

export default async function AdminNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; ok?: string; err?: string }>;
}) {
  const params = await searchParams;

  const posts = await listNewsAdmin();
  const selectedId = params.id ? Number(params.id) : null;
  const selected = selectedId ? await getNewsAdmin(selectedId) : null;

  return (
    <WatermarkedSection tone="portal" variant="mixed">
      {/* If your news actions already redirect with ok/err, this will show toasts automatically */}
      <ToastGate ok={params.ok} err={params.err} okText="Saved." />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Editor */}
        <section className="portal-surface p-6">
          <SectionTitle
            title="News"
            subtitle="Create, edit, and publish posts."
            right={
              <Link className="portal-btn" href="/portal/admin/news">
                New post
              </Link>
            }
          />

          {selected ? (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <Pill>Editing</Pill>
              <StatusBadge status={String((selected as any).status ?? "draft")} />
              <Pill>/news/{String((selected as any).slug ?? "")}</Pill>
            </div>
          ) : (
            <div className="mt-3 text-sm text-slate-600">
              Create a new post, or select one from the list to edit.
            </div>
          )}

          <div className="mt-5">
            <NewsEditor selected={selected as any} />
          </div>
        </section>

        {/* Posts list */}
        <section className="portal-surface p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Posts</h2>
              <p className="mt-1 text-sm text-slate-600">Click a post to edit.</p>
            </div>
            <div className="flex items-center gap-2">
              <Pill>{posts.length} total</Pill>
            </div>
          </div>

          <div className="mt-4 divide-y rounded-xl border bg-white/70">
            {posts.map((p: any) => {
              const isSelected = selectedId === Number(p.id);
              const href = `/portal/admin/news?id=${p.id}`;
              const updated = p.updated_at ? new Date(p.updated_at).toLocaleDateString() : "";

              return (
                <Link
                  key={p.id}
                  href={href}
                  className={`block px-3 py-3 transition ${
                    isSelected ? "bg-[color:var(--ohs-surface)]" : "hover:bg-[color:var(--ohs-surface)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="font-medium text-[color:var(--ohs-charcoal)] truncate">
                          {p.title}
                        </div>
                        <StatusBadge status={String(p.status)} />
                      </div>

                      <div className="mt-1 text-xs text-slate-500 truncate">
                        /news/{p.slug}
                      </div>
                    </div>

                    <div className="shrink-0 text-xs text-slate-500">{updated}</div>
                  </div>
                </Link>
              );
            })}

            {posts.length === 0 ? (
              <div className="px-3 py-10 text-sm text-slate-600">
                No posts yet. Click <span className="font-semibold">New post</span> to create one.
              </div>
            ) : null}
          </div>

          <div className="mt-4 rounded-xl border bg-white/70 p-3 text-xs text-slate-600">
            Tip: Keep titles short and use clear slugs. Publish only after adding a cover image (recommended).
          </div>
        </section>
      </div>
    </WatermarkedSection>
  );
}