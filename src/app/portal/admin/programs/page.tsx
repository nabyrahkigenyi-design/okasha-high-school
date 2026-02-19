import Link from "next/link";
import ProgramEditor from "./ProgramEditor";
import { listTracksAdmin, listProgramItemsAdmin, getProgramItemAdmin } from "./queries";

export default async function AdminProgramsPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const params = await searchParams;

  const tracks = await listTracksAdmin();
  const items = await listProgramItemsAdmin();
  const selectedId = params.id ? Number(params.id) : null;
  const selected = selectedId ? await getProgramItemAdmin(selectedId) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">Programs</h1>
            <p className="mt-1 text-sm text-slate-600">
              Create program items and assign them to Secular or Islamic tracks.
            </p>
          </div>
          <Link className="underline text-sm" href="/portal/admin/programs">
            New item
          </Link>
        </div>

        <div className="mt-3 rounded-xl border bg-[color:var(--ohs-surface)] p-3 text-sm text-slate-600">
          <div className="font-medium text-slate-700">Tracks</div>
          <ul className="mt-1 list-disc pl-5">
            {tracks.map((t: any) => (
              <li key={t.id}>
                {t.key}: {t.title}
              </li>
            ))}
          </ul>
        </div>

        <ProgramEditor selected={selected as any} />
      </section>

      <section className="rounded-2xl border bg-white p-5">
        <h2 className="text-lg font-semibold">Items</h2>
        <p className="mt-1 text-sm text-slate-600">Click an item to edit.</p>

        <div className="mt-3 divide-y">
          {items.map((p: any) => (
            <Link
              key={p.id}
              href={`/portal/admin/programs?id=${p.id}`}
              className="block py-3 hover:bg-[color:var(--ohs-surface)] px-2 rounded-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium text-[color:var(--ohs-charcoal)]">{p.title}</div>
                  <div className="text-xs text-slate-500">
                    {p.track_key} • {p.is_published ? "published" : "hidden"}
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  {p.updated_at ? new Date(p.updated_at).toLocaleDateString() : ""}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
