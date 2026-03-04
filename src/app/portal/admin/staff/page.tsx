import Link from "next/link";
import { WatermarkedSection } from "@/components/WatermarkedSection";
import { ToastGate } from "@/components/ToastGate";
import { listStaffAdmin, getStaffAdmin } from "./queries";
import StaffEditor from "./StaffEditor";

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

export default async function AdminStaffPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; ok?: string; err?: string }>;
}) {
  const params = await searchParams;

  const staff = await listStaffAdmin();
  const selectedId = params.id ? Number(params.id) : null;
  const selected = selectedId ? await getStaffAdmin(selectedId) : null;

  return (
    <WatermarkedSection tone="portal" variant="mixed">
      <ToastGate ok={params.ok} err={params.err} okText="Saved." />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Editor */}
        <section className="portal-surface p-6">
          <SectionTitle
            title="Staff"
            subtitle="Manage staff members shown on the public website."
            right={
              <Link className="portal-btn" href="/portal/admin/staff">
                New staff
              </Link>
            }
          />

          {selected ? (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <Pill>Editing</Pill>
              <PublishBadge published={Boolean((selected as any).is_published)} />
              {(selected as any).department ? <Pill>{String((selected as any).department)}</Pill> : null}
            </div>
          ) : (
            <div className="mt-3 text-sm text-slate-600">
              Create a new staff member or select one from the list to edit.
            </div>
          )}

          <div className="mt-5">
            <StaffEditor selected={selected as any} />
          </div>
        </section>

        {/* Staff list */}
        <section className="portal-surface p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Staff list</h2>
              <p className="mt-1 text-sm text-slate-600">Click a person to edit.</p>
            </div>
            <div className="flex items-center gap-2">
              <Pill>{staff.length} total</Pill>
            </div>
          </div>

          <div className="mt-4 divide-y rounded-xl border bg-white/70">
            {staff.map((s: any) => {
              const isSelected = selectedId === Number(s.id);
              const href = `/portal/admin/staff?id=${s.id}`;
              const updated = s.updated_at ? new Date(s.updated_at).toLocaleDateString() : "";

              return (
                <Link
                  key={s.id}
                  href={href}
                  className={`block px-3 py-3 transition ${
                    isSelected ? "bg-[color:var(--ohs-surface)]" : "hover:bg-[color:var(--ohs-surface)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="font-medium text-[color:var(--ohs-charcoal)] truncate">
                          {s.full_name}
                        </div>
                        <PublishBadge published={Boolean(s.is_published)} />
                      </div>

                      <div className="mt-1 text-xs text-slate-500 truncate">
                        {s.role_title}
                        {s.department ? ` • ${s.department}` : ""}
                      </div>
                    </div>

                    <div className="shrink-0 text-xs text-slate-500">{updated}</div>
                  </div>
                </Link>
              );
            })}

            {staff.length === 0 ? (
              <div className="px-3 py-10 text-sm text-slate-600">
                No staff yet. Click <span className="font-semibold">New staff</span> to create one.
              </div>
            ) : null}
          </div>

          <div className="mt-4 rounded-xl border bg-white/70 p-3 text-xs text-slate-600">
            Tip: Publish only staff you want visible on the public Staff page. Add a photo for a professional look.
          </div>
        </section>
      </div>
    </WatermarkedSection>
  );
}