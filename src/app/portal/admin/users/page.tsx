import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { adminCreateUser, adminDeactivateUser, adminPurgeUser } from "./actions";

export default async function AdminUsers({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; err?: string; role?: string; q?: string; show?: string }>;
}) {
  await requireRole(["admin"]);
  const params = await searchParams;

  const role = (params.role ?? "all") as "all" | "admin" | "teacher" | "parent" | "student";
  const q = (params.q ?? "").trim();
  const show = params.show ?? "active"; // active | all

  const sb = supabaseAdmin();

  let query = sb
    .from("profiles")
    .select("id, full_name, role_key, is_active, created_at")
    .order("created_at", { ascending: false })
    .limit(300);

  if (role !== "all") query = query.eq("role_key", role);
  if (show !== "all") query = query.eq("is_active", true);
  if (q.length > 0) query = query.ilike("full_name", `%${q}%`);

  const { data: users } = await query;

  const tab = (k: string) =>
    `rounded-xl px-3 py-2 text-sm font-medium transition ${
      role === k ? "bg-[color:var(--ohs-surface)] border" : "hover:bg-slate-50 border border-transparent"
    }`;

  const makeHref = (nextRole: string) => {
    const sp = new URLSearchParams();
    if (nextRole !== "all") sp.set("role", nextRole);
    if (q) sp.set("q", q);
    if (show !== "active") sp.set("show", show);
    return `/portal/admin/users?${sp.toString()}`;
  };

  const printHref = () => {
    const sp = new URLSearchParams();
    if (role !== "all") sp.set("role", role);
    if (q) sp.set("q", q);
    if (show !== "active") sp.set("show", show);
    return `/portal/admin/users/print?${sp.toString()}`;
  };

  return (
    <div className="grid gap-6">
      <div className="rounded-2xl border bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">Users</h1>
            <p className="mt-1 text-sm text-slate-600">
              Create, search, deactivate, and export users.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={printHref()}
              className="rounded-xl border bg-white px-3 py-2 text-sm hover:bg-[color:var(--ohs-surface)]"
            >
              Print / Save PDF
            </Link>
          </div>
        </div>

        {params.ok ? (
          <div className="mt-3 rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-800">
            Done.
          </div>
        ) : null}

        {params.err ? (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
            {decodeURIComponent(params.err)}
          </div>
        ) : null}

        {/* Tabs */}
        <div className="mt-4 flex flex-wrap gap-2">
          <Link className={tab("all")} href={makeHref("all")}>All</Link>
          <Link className={tab("admin")} href={makeHref("admin")}>Admins</Link>
          <Link className={tab("teacher")} href={makeHref("teacher")}>Teachers</Link>
          <Link className={tab("parent")} href={makeHref("parent")}>Parents</Link>
          <Link className={tab("student")} href={makeHref("student")}>Students</Link>
        </div>

        {/* Filters */}
        <form className="mt-4 flex flex-wrap gap-2" action="/portal/admin/users" method="get">
          <input type="hidden" name="role" value={role} />
          <input
            name="q"
            defaultValue={q}
            className="rounded-xl border px-3 py-2 text-sm w-64"
            placeholder="Search name..."
          />
          <select name="show" defaultValue={show} className="rounded-xl border px-3 py-2 text-sm">
            <option value="active">Active only</option>
            <option value="all">Include inactive</option>
          </select>

          <button className="rounded-xl border bg-white px-3 py-2 text-sm hover:bg-[color:var(--ohs-surface)]">
            Filter
          </button>
        </form>

        {/* Create */}
        <div className="mt-6 grid gap-3 lg:grid-cols-2">
          <div className="rounded-2xl border bg-[color:var(--ohs-surface)] p-4">
            <h2 className="font-semibold">Create user</h2>
            <form action={adminCreateUser} className="mt-3 grid gap-3">
              <input className="rounded-lg border px-3 py-2" name="full_name" placeholder="Full name" required />
              <input className="rounded-lg border px-3 py-2" name="email" placeholder="Email" type="email" required />
              <input className="rounded-lg border px-3 py-2" name="password" placeholder="Temp password" type="password" required />

              <select className="rounded-lg border px-3 py-2" name="role_key" defaultValue="student">
                <option value="student">Student</option>
                <option value="parent">Parent</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>

              <button className="rounded-xl px-4 py-2 font-medium text-white" style={{ background: "var(--ohs-dark-green)" }}>
                Create
              </button>

              <p className="text-xs text-slate-600">
                Students/teachers/parents are now automatically created in their tables (fixes enrollments & assignments).
              </p>
            </form>
          </div>

          {/* List */}
          <div className="rounded-2xl border bg-white p-4">
            <h2 className="font-semibold">Users list</h2>
            <p className="mt-1 text-xs text-slate-500">
              Deactivate hides user from default list. Purge deletes only if user has no linked records.
            </p>

            <div className="mt-3 divide-y">
              {(users ?? []).map((u) => (
                <div key={u.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium">
                      {u.full_name}{" "}
                      {!u.is_active ? <span className="text-xs text-red-600">(inactive)</span> : null}
                    </div>
                    <div className="text-xs text-slate-500">{u.role_key} • {u.id}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    {u.is_active ? (
                      <form action={adminDeactivateUser}>
                        <input type="hidden" name="id" value={u.id} />
                        <button className="text-sm underline text-slate-700 hover:text-slate-950" type="submit">
                          Deactivate
                        </button>
                      </form>
                    ) : null}

                    <form action={adminPurgeUser}>
                      <input type="hidden" name="id" value={u.id} />
                      <button className="text-sm underline text-red-600 hover:text-red-800" type="submit">
                        Purge
                      </button>
                    </form>
                  </div>
                </div>
              ))}

              {(users ?? []).length === 0 ? (
                <div className="py-6 text-sm text-slate-600">No users found.</div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}