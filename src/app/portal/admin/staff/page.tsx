import Link from "next/link";
import { listStaffAdmin, getStaffAdmin } from "./queries";
import StaffEditor from "./StaffEditor";

export default async function AdminStaffPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const params = await searchParams;

  const staff = await listStaffAdmin();
  const selectedId = params.id ? Number(params.id) : null;
  const selected = selectedId ? await getStaffAdmin(selectedId) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">Staff</h1>
            <p className="mt-1 text-sm text-slate-600">Manage staff members shown on the public website.</p>
          </div>
          <Link className="underline text-sm" href="/portal/admin/staff">
            New staff
          </Link>
        </div>

        <StaffEditor selected={selected as any} />
      </section>

      <section className="rounded-2xl border bg-white p-5">
        <h2 className="text-lg font-semibold">Staff list</h2>
        <p className="mt-1 text-sm text-slate-600">Click a person to edit.</p>

        <div className="mt-3 divide-y">
          {staff.map((s: any) => (
            <Link
              key={s.id}
              href={`/portal/admin/staff?id=${s.id}`}
              className="block py-3 hover:bg-[color:var(--ohs-surface)] px-2 rounded-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium text-[color:var(--ohs-charcoal)]">
                    {s.full_name}
                  </div>
                  <div className="text-xs text-slate-500">
                    {s.role_title}
                    {s.department ? ` • ${s.department}` : ""} •{" "}
                    {s.is_published ? "published" : "hidden"}
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  {s.updated_at ? new Date(s.updated_at).toLocaleDateString() : ""}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
