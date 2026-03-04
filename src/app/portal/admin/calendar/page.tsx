import Link from "next/link";
import { WatermarkedSection } from "@/components/WatermarkedSection";
import { ToastGate } from "@/components/ToastGate";
import CalendarEditor from "./CalendarEditor";
import { listCalendarAdmin, getCalendarAdmin } from "./queries";

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

export default async function AdminCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; ok?: string; err?: string }>;
}) {
  const params = await searchParams;

  const events = await listCalendarAdmin();
  const selectedId = params.id ? Number(params.id) : null;
  const selected = selectedId ? await getCalendarAdmin(selectedId) : null;

  return (
    <WatermarkedSection tone="portal" variant="mixed">
      <ToastGate ok={params.ok} err={params.err} okText="Saved." />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Editor */}
        <section className="portal-surface p-6">
          <SectionTitle
            title="Calendar"
            subtitle="Manage public calendar events."
            right={
              <Link className="portal-btn" href="/portal/admin/calendar">
                New event
              </Link>
            }
          />

          {selected ? (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <Pill>Editing</Pill>
              <PublishBadge published={Boolean((selected as any).is_published)} />
              {(selected as any).category ? <Pill>{String((selected as any).category)}</Pill> : null}
            </div>
          ) : (
            <div className="mt-3 text-sm text-slate-600">
              Create a new event or select one from the list to edit.
            </div>
          )}

          <div className="mt-5">
            <CalendarEditor selected={selected as any} />
          </div>
        </section>

        {/* Events list */}
        <section className="portal-surface p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Events</h2>
              <p className="mt-1 text-sm text-slate-600">Click an event to edit.</p>
            </div>
            <div className="flex items-center gap-2">
              <Pill>{events.length} total</Pill>
            </div>
          </div>

          <div className="mt-4 divide-y rounded-xl border bg-white/70">
            {events.map((e: any) => {
              const isSelected = selectedId === Number(e.id);
              const href = `/portal/admin/calendar?id=${e.id}`;
              const updated = e.updated_at ? new Date(e.updated_at).toLocaleDateString() : "";

              const dateLine =
                e.starts_on && e.ends_on
                  ? `${e.starts_on} → ${e.ends_on}`
                  : e.starts_on
                    ? String(e.starts_on)
                    : "";

              return (
                <Link
                  key={e.id}
                  href={href}
                  className={`block px-3 py-3 transition ${
                    isSelected ? "bg-[color:var(--ohs-surface)]" : "hover:bg-[color:var(--ohs-surface)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="font-medium text-[color:var(--ohs-charcoal)] truncate">
                          {e.title}
                        </div>
                        <PublishBadge published={Boolean(e.is_published)} />
                        {e.category ? <Pill>{String(e.category)}</Pill> : null}
                      </div>

                      <div className="mt-1 text-xs text-slate-500 truncate">
                        {dateLine}
                      </div>
                    </div>

                    <div className="shrink-0 text-xs text-slate-500">{updated}</div>
                  </div>
                </Link>
              );
            })}

            {events.length === 0 ? (
              <div className="px-3 py-10 text-sm text-slate-600">
                No events yet. Click <span className="font-semibold">New event</span> to create one.
              </div>
            ) : null}
          </div>

          <div className="mt-4 rounded-xl border bg-white/70 p-3 text-xs text-slate-600">
            Tip: Publish only events you want visible on the public Calendar page.
          </div>
        </section>
      </div>
    </WatermarkedSection>
  );
}