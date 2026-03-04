import Link from "next/link";
import { WatermarkedSection } from "@/components/WatermarkedSection";
import { ToastGate } from "@/components/ToastGate";
import ProgramEditor from "./ProgramEditor";
import { listTracksAdmin, listProgramItemsAdmin, getProgramItemAdmin } from "./queries";

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

function PublishBadge({ published }: { published: boolean }) {
  return (
    <span className={published ? "portal-badge portal-badge-secular" : "portal-badge"}>
      {published ? "Published" : "Hidden"}
    </span>
  );
}

function TrackBadge({ trackKey }: { trackKey: string }) {
  const isIslamic = trackKey === "islamic";
  return (
    <span className={isIslamic ? "portal-badge portal-badge-islamic" : "portal-badge portal-badge-secular"}>
      {isIslamic ? "Islamic" : "Secular"}
    </span>
  );
}

export default async function AdminProgramsPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; ok?: string; err?: string }>;
}) {
  const params = await searchParams;

  const tracks = await listTracksAdmin();
  const items = await listProgramItemsAdmin();
  const selectedId = params.id ? Number(params.id) : null;
  const selected = selectedId ? await getProgramItemAdmin(selectedId) : null;

  return (
    <WatermarkedSection tone="portal" variant="mixed">
      <ToastGate ok={params.ok} err={params.err} okText="Saved." />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Editor */}
        <section className="portal-surface p-6">
          <SectionTitle
            title="Programs"
            subtitle="Create program items and assign them to Secular or Islamic tracks."
            right={
              <Link className="portal-btn" href="/portal/admin/programs">
                New item
              </Link>
            }
          />

          {/* Tracks card */}
          <div className="mt-4 rounded-2xl border bg-white/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">Tracks</div>
                <div className="mt-1 text-xs text-slate-500">
                  These are used to separate Secular vs Islamic Theology programs.
                </div>
              </div>
              <Pill>{tracks.length} total</Pill>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {tracks.map((t: any) => (
                <span key={t.id} className="portal-badge">
                  <span className="font-mono">{t.key}</span>: {t.title}
                </span>
              ))}
            </div>
          </div>

          {selected ? (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <Pill>Editing</Pill>
              <PublishBadge published={Boolean((selected as any).is_published)} />
              {(selected as any).track_key ? <TrackBadge trackKey={String((selected as any).track_key)} /> : null}
            </div>
          ) : (
            <div className="mt-3 text-sm text-slate-600">
              Create a new program item or select one from the list to edit.
            </div>
          )}

          <div className="mt-5">
            <ProgramEditor selected={selected as any} />
          </div>
        </section>

        {/* Items list */}
        <section className="portal-surface p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Items</h2>
              <p className="mt-1 text-sm text-slate-600">Click an item to edit.</p>
            </div>
            <div className="flex items-center gap-2">
              <Pill>{items.length} total</Pill>
            </div>
          </div>

          <div className="mt-4 divide-y rounded-xl border bg-white/70">
            {items.map((p: any) => {
              const isSelected = selectedId === Number(p.id);
              const href = `/portal/admin/programs?id=${p.id}`;
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
                        <PublishBadge published={Boolean(p.is_published)} />
                        {p.track_key ? <TrackBadge trackKey={String(p.track_key)} /> : null}
                      </div>

                      <div className="mt-1 text-xs text-slate-500 truncate">
                        Track: {p.track_key}
                      </div>
                    </div>

                    <div className="shrink-0 text-xs text-slate-500">{updated}</div>
                  </div>
                </Link>
              );
            })}

            {items.length === 0 ? (
              <div className="px-3 py-10 text-sm text-slate-600">
                No program items yet. Click <span className="font-semibold">New item</span> to create one.
              </div>
            ) : null}
          </div>

          <div className="mt-4 rounded-xl border bg-white/70 p-3 text-xs text-slate-600">
            Tip: Keep titles short and clear. Publish only items meant for the public Programs page.
          </div>
        </section>
      </div>
    </WatermarkedSection>
  );
}