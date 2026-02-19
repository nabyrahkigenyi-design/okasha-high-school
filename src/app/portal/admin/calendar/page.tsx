import Link from "next/link";
import CalendarEditor from "./CalendarEditor";
import { listCalendarAdmin, getCalendarAdmin } from "./queries";

export default async function AdminCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const params = await searchParams;

  const events = await listCalendarAdmin();
  const selectedId = params.id ? Number(params.id) : null;
  const selected = selectedId ? await getCalendarAdmin(selectedId) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">Calendar</h1>
            <p className="mt-1 text-sm text-slate-600">Manage public calendar events.</p>
          </div>
          <Link className="underline text-sm" href="/portal/admin/calendar">
            New event
          </Link>
        </div>

        <CalendarEditor selected={selected as any} />
      </section>

      <section className="rounded-2xl border bg-white p-5">
        <h2 className="text-lg font-semibold">Events</h2>
        <p className="mt-1 text-sm text-slate-600">Click an event to edit.</p>

        <div className="mt-3 divide-y">
          {events.map((e: any) => (
            <Link
              key={e.id}
              href={`/portal/admin/calendar?id=${e.id}`}
              className="block py-3 hover:bg-[color:var(--ohs-surface)] px-2 rounded-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium text-[color:var(--ohs-charcoal)]">{e.title}</div>
                  <div className="text-xs text-slate-500">
                    {e.starts_on}
                    {e.ends_on ? ` → ${e.ends_on}` : ""} • {e.category} • {e.is_published ? "published" : "hidden"}
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  {e.updated_at ? new Date(e.updated_at).toLocaleDateString() : ""}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
