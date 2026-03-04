import Link from "next/link";
import { WatermarkedSection } from "@/components/WatermarkedSection";
import { ToastGate } from "@/components/ToastGate";
import AdmissionEditor from "./AdmissionEditor";
import { listAdmissionsAdmin, getAdmissionsAdmin } from "./queries";

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

function PrimaryBadge({ primary }: { primary: boolean }) {
  return (
    <span className={primary ? "portal-badge portal-badge-islamic" : "portal-badge"}>
      {primary ? "Primary" : "Secondary"}
    </span>
  );
}

export default async function AdminAdmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; ok?: string; err?: string }>;
}) {
  const params = await searchParams;

  const items = await listAdmissionsAdmin();
  const selectedId = params.id ? Number(params.id) : null;
  const selected = selectedId ? await getAdmissionsAdmin(selectedId) : null;

  return (
    <WatermarkedSection tone="portal" variant="mixed">
      <ToastGate ok={params.ok} err={params.err} okText="Saved." />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Editor */}
        <section className="portal-surface p-6">
          <SectionTitle
            title="Admissions"
            subtitle="Upload admission PDFs and publish to the admissions page."
            right={
              <Link className="portal-btn" href="/portal/admin/admissions">
                New doc
              </Link>
            }
          />

          {selected ? (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <Pill>Editing</Pill>
              <PublishBadge published={Boolean((selected as any).is_published)} />
              <PrimaryBadge primary={Boolean((selected as any).is_primary)} />
            </div>
          ) : (
            <div className="mt-3 text-sm text-slate-600">
              Upload a new document or select one from the list to edit.
            </div>
          )}

          <div className="mt-5">
            <AdmissionEditor selected={selected as any} />
          </div>
        </section>

        {/* Documents list */}
        <section className="portal-surface p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Documents</h2>
              <p className="mt-1 text-sm text-slate-600">Click a document to edit.</p>
            </div>
            <div className="flex items-center gap-2">
              <Pill>{items.length} total</Pill>
            </div>
          </div>

          <div className="mt-4 divide-y rounded-xl border bg-white/70">
            {items.map((d: any) => {
              const isSelected = selectedId === Number(d.id);
              const href = `/portal/admin/admissions?id=${d.id}`;
              const updated = d.updated_at ? new Date(d.updated_at).toLocaleDateString() : "";

              return (
                <Link
                  key={d.id}
                  href={href}
                  className={`block px-3 py-3 transition ${
                    isSelected ? "bg-[color:var(--ohs-surface)]" : "hover:bg-[color:var(--ohs-surface)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="font-medium text-[color:var(--ohs-charcoal)] truncate">
                          {d.title}
                        </div>
                        <PublishBadge published={Boolean(d.is_published)} />
                        <PrimaryBadge primary={Boolean(d.is_primary)} />
                      </div>

                      <div className="mt-1 text-xs text-slate-500 truncate">
                        {d.is_primary ? "Primary document (main admissions file)" : "Secondary document"}
                      </div>
                    </div>

                    <div className="shrink-0 text-xs text-slate-500">{updated}</div>
                  </div>
                </Link>
              );
            })}

            {items.length === 0 ? (
              <div className="px-3 py-10 text-sm text-slate-600">
                No admissions documents yet. Click <span className="font-semibold">New doc</span> to upload one.
              </div>
            ) : null}
          </div>

          <div className="mt-4 rounded-xl border bg-white/70 p-3 text-xs text-slate-600">
            Tip: Mark the main admissions PDF as <span className="font-semibold">Primary</span>. Keep older documents hidden.
          </div>
        </section>
      </div>
    </WatermarkedSection>
  );
}