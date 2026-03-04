import Link from "next/link";
import { WatermarkedSection } from "@/components/WatermarkedSection";
import { ToastGate } from "@/components/ToastGate";
import FeeEditor from "./FeeEditor";
import { listFeesAdmin, getFeeAdmin } from "./queries";

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

export default async function AdminFeesPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; ok?: string; err?: string }>;
}) {
  const params = await searchParams;

  const items = await listFeesAdmin();
  const selectedId = params.id ? Number(params.id) : null;
  const selected = selectedId ? await getFeeAdmin(selectedId) : null;

  return (
    <WatermarkedSection tone="portal" variant="mixed">
      <ToastGate ok={params.ok} err={params.err} okText="Saved." />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Editor */}
        <section className="portal-surface p-6">
          <SectionTitle
            title="Fees"
            subtitle="Manage tuition and fee items shown on the public website."
            right={
              <Link className="portal-btn" href="/portal/admin/fees">
                New item
              </Link>
            }
          />

          {selected ? (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <Pill>Editing</Pill>
              <PublishBadge published={Boolean((selected as any).is_published)} />
              {(selected as any).applies_to ? <Pill>{String((selected as any).applies_to)}</Pill> : null}
            </div>
          ) : (
            <div className="mt-3 text-sm text-slate-600">
              Create a new fee item or select one from the list to edit.
            </div>
          )}

          <div className="mt-5">
            <FeeEditor selected={selected as any} />
          </div>
        </section>

        {/* Fee list */}
        <section className="portal-surface p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Fee items</h2>
              <p className="mt-1 text-sm text-slate-600">Click an item to edit.</p>
            </div>
            <div className="flex items-center gap-2">
              <Pill>{items.length} total</Pill>
            </div>
          </div>

          <div className="mt-4 divide-y rounded-xl border bg-white/70">
            {items.map((f: any) => {
              const isSelected = selectedId === Number(f.id);
              const href = `/portal/admin/fees?id=${f.id}`;
              const updated = f.updated_at ? new Date(f.updated_at).toLocaleDateString() : "";

              return (
                <Link
                  key={f.id}
                  href={href}
                  className={`block px-3 py-3 transition ${
                    isSelected ? "bg-[color:var(--ohs-surface)]" : "hover:bg-[color:var(--ohs-surface)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="font-medium text-[color:var(--ohs-charcoal)] truncate">
                          {f.title}
                        </div>
                        <PublishBadge published={Boolean(f.is_published)} />
                        {f.applies_to ? <Pill>{String(f.applies_to)}</Pill> : null}
                      </div>

                      <div className="mt-1 text-xs text-slate-500 truncate">
                        {f.applies_to ? `Applies to: ${f.applies_to}` : "No scope set"}
                      </div>
                    </div>

                    <div className="shrink-0 text-xs text-slate-500">{updated}</div>
                  </div>
                </Link>
              );
            })}

            {items.length === 0 ? (
              <div className="px-3 py-10 text-sm text-slate-600">
                No fee items yet. Click <span className="font-semibold">New item</span> to create one.
              </div>
            ) : null}
          </div>

          <div className="mt-4 rounded-xl border bg-white/70 p-3 text-xs text-slate-600">
            Tip: Keep “applies to” consistent (e.g. S1–S4, S5–S6, Boarding, Day). Publish only items meant for the public Fees page.
          </div>
        </section>
      </div>
    </WatermarkedSection>
  );
}