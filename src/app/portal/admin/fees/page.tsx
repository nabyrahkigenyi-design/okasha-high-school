import Link from "next/link";
import FeeEditor from "./FeeEditor";
import { listFeesAdmin, getFeeAdmin } from "./queries";

export default async function AdminFeesPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const params = await searchParams;

  const items = await listFeesAdmin();
  const selectedId = params.id ? Number(params.id) : null;
  const selected = selectedId ? await getFeeAdmin(selectedId) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">Fees</h1>
            <p className="mt-1 text-sm text-slate-600">Manage tuition and fee items shown on the public website.</p>
          </div>
          <Link className="underline text-sm" href="/portal/admin/fees">
            New item
          </Link>
        </div>

        <FeeEditor selected={selected as any} />
      </section>

      <section className="rounded-2xl border bg-white p-5">
        <h2 className="text-lg font-semibold">Fee items</h2>
        <p className="mt-1 text-sm text-slate-600">Click an item to edit.</p>

        <div className="mt-3 divide-y">
          {items.map((f: any) => (
            <Link
              key={f.id}
              href={`/portal/admin/fees?id=${f.id}`}
              className="block py-3 hover:bg-[color:var(--ohs-surface)] px-2 rounded-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium text-[color:var(--ohs-charcoal)]">{f.title}</div>
                  <div className="text-xs text-slate-500">
                    {f.applies_to} • {f.is_published ? "published" : "hidden"}
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  {f.updated_at ? new Date(f.updated_at).toLocaleDateString() : ""}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
