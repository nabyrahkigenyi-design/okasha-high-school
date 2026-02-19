import Link from "next/link";
import AdmissionEditor from "./AdmissionEditor";
import { listAdmissionsAdmin, getAdmissionsAdmin } from "./queries";

export default async function AdminAdmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const params = await searchParams;

  const items = await listAdmissionsAdmin();
  const selectedId = params.id ? Number(params.id) : null;
  const selected = selectedId ? await getAdmissionsAdmin(selectedId) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">Admissions</h1>
            <p className="mt-1 text-sm text-slate-600">Upload admission PDFs and publish to the admissions page.</p>
          </div>
          <Link className="underline text-sm" href="/portal/admin/admissions">
            New doc
          </Link>
        </div>

        <AdmissionEditor selected={selected as any} />
      </section>

      <section className="rounded-2xl border bg-white p-5">
        <h2 className="text-lg font-semibold">Documents</h2>
        <p className="mt-1 text-sm text-slate-600">Click a document to edit.</p>

        <div className="mt-3 divide-y">
          {items.map((d: any) => (
            <Link
              key={d.id}
              href={`/portal/admin/admissions?id=${d.id}`}
              className="block py-3 hover:bg-[color:var(--ohs-surface)] px-2 rounded-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium text-[color:var(--ohs-charcoal)]">{d.title}</div>
                  <div className="text-xs text-slate-500">
                    {d.is_primary ? "primary" : "secondary"} • {d.is_published ? "published" : "hidden"}
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  {d.updated_at ? new Date(d.updated_at).toLocaleDateString() : ""}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
