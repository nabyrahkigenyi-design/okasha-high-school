import Link from "next/link";
import { listPoliciesAdmin, getPolicyAdmin } from "./queries";
import PolicyEditor from "./PolicyEditor";

export default async function AdminPoliciesPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const params = await searchParams;

  const items = await listPoliciesAdmin();
  const selectedId = params.id ? Number(params.id) : null;
  const selected = selectedId ? await getPolicyAdmin(selectedId) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">Policies</h1>
            <p className="mt-1 text-sm text-slate-600">Upload PDFs and publish to the website.</p>
          </div>
          <Link className="underline text-sm" href="/portal/admin/policies">
            New policy
          </Link>
        </div>

        <PolicyEditor selected={selected as any} />
      </section>

      <section className="rounded-2xl border bg-white p-5">
        <h2 className="text-lg font-semibold">Documents</h2>
        <p className="mt-1 text-sm text-slate-600">Click an item to edit.</p>

        <div className="mt-3 divide-y">
          {items.map((p: any) => (
            <Link
              key={p.id}
              href={`/portal/admin/policies?id=${p.id}`}
              className="block py-3 hover:bg-[color:var(--ohs-surface)] px-2 rounded-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium text-[color:var(--ohs-charcoal)]">{p.title}</div>
                  <div className="text-xs text-slate-500">
                    {p.category} • {p.is_published ? "published" : "hidden"}
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
