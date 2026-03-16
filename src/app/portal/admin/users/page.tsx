import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { WatermarkedSection } from "@/components/WatermarkedSection";
import { ToastGate } from "@/components/ToastGate";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import { adminCreateUser, adminDeactivateUser, adminPurgeUser } from "./actions";

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

function roleLabel(role: string) {
  switch (role) {
    case "admin":
      return "Admins";
    case "teacher":
      return "Teachers";
    case "parent":
      return "Parents";
    case "student":
      return "Students";
    default:
      return "All";
  }
}

function tabClass(activeRole: string, current: string) {
  return `portal-tab ${activeRole === current ? "portal-tab-active" : ""}`;
}

function makeHref(role: string, q: string, show: string) {
  const sp = new URLSearchParams();
  if (role !== "all") sp.set("role", role);
  if (q) sp.set("q", q);
  if (show !== "active") sp.set("show", show);
  const qs = sp.toString();
  return qs ? `/portal/admin/users?${qs}` : "/portal/admin/users";
}

function printHref(role: string, q: string, show: string) {
  const sp = new URLSearchParams();
  if (role !== "all") sp.set("role", role);
  if (q) sp.set("q", q);
  if (show !== "active") sp.set("show", show);
  const qs = sp.toString();
  return qs ? `/portal/admin/users/print?${qs}` : "/portal/admin/users/print";
}

function UserRow({ u }: { u: any }) {
  return (
    <div className="px-4 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="font-medium text-slate-900 truncate">
          {u.full_name} {!u.is_active ? <span className="text-xs text-red-700">• inactive</span> : null}
        </div>
        <div className="mt-1 text-xs text-slate-500 truncate">
          {u.role_key} • {u.id}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {u.is_active ? (
          <form action={adminDeactivateUser}>
            <input type="hidden" name="id" value={u.id} />
            <ConfirmSubmitButton
              className="portal-btn"
              confirmText={`Deactivate "${u.full_name}"?\n\nThey will not appear in the default list, but data remains.`}
              title="Deactivate user"
            >
              Deactivate
            </ConfirmSubmitButton>
          </form>
        ) : null}

        <form action={adminPurgeUser}>
          <input type="hidden" name="id" value={u.id} />
          <ConfirmSubmitButton
            className="portal-btn portal-btn-danger"
            confirmText={`Delete "${u.full_name}" completely?\n\nThis removes the user account and linked role records.`}
            title="Delete user permanently"
          >
            Delete
          </ConfirmSubmitButton>
        </form>
      </div>
    </div>
  );
}

function GroupCard({
  title,
  roleKey,
  items,
  total,
  q,
  show,
}: {
  title: string;
  roleKey: "admin" | "teacher" | "parent" | "student";
  items: any[];
  total: number;
  q: string;
  show: string;
}) {
  return (
    <section className="portal-surface p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-600">
            Showing {items.length} of {total}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Pill>{total} total</Pill>
          <Link className="portal-btn" href={makeHref(roleKey, q, show)}>
            View all
          </Link>
        </div>
      </div>

      <div className="mt-4 divide-y rounded-xl border bg-white/70">
        {items.length > 0 ? (
          items.map((u) => <UserRow key={u.id} u={u} />)
        ) : (
          <div className="px-4 py-8 text-sm text-slate-600">No users found in this category.</div>
        )}
      </div>
    </section>
  );
}

export default async function AdminUsers({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; err?: string; role?: string; q?: string; show?: string }>;
}) {
  await requireRole(["admin"]);
  const params = await searchParams;

  const role = (params.role ?? "all") as "all" | "admin" | "teacher" | "parent" | "student";
  const q = (params.q ?? "").trim();
  const show = params.show ?? "active";

  const sb = supabaseAdmin();

  let baseQuery = sb
    .from("profiles")
    .select("id, full_name, role_key, is_active, created_at")
    .order("created_at", { ascending: false });

  if (show !== "all") baseQuery = baseQuery.eq("is_active", true);
  if (q.length > 0) baseQuery = baseQuery.ilike("full_name", `%${q}%`);

  if (role !== "all") {
    const { data: users } = await baseQuery.eq("role_key", role).limit(300);

    return (
      <WatermarkedSection tone="portal" variant="mixed">
        <ToastGate ok={params.ok} err={params.err} okText="Done." />

        <div className="grid gap-6">
          <section className="portal-surface p-6">
            <SectionTitle
              title="Users"
              subtitle="Create, search, deactivate, and permanently delete users."
              right={<Link className="portal-btn" href={printHref(role, q, show)}>Print / Save PDF</Link>}
            />

            <div className="portal-tabs mt-4">
              <Link className={tabClass(role, "all")} href={makeHref("all", q, show)}>
                All
              </Link>
              <Link className={tabClass(role, "admin")} href={makeHref("admin", q, show)}>
                Admins
              </Link>
              <Link className={tabClass(role, "teacher")} href={makeHref("teacher", q, show)}>
                Teachers
              </Link>
              <Link className={tabClass(role, "parent")} href={makeHref("parent", q, show)}>
                Parents
              </Link>
              <Link className={tabClass(role, "student")} href={makeHref("student", q, show)}>
                Students
              </Link>
            </div>

            <form className="mt-4 flex flex-wrap gap-2" action="/portal/admin/users" method="get">
              <input type="hidden" name="role" value={role} />

              <input
                name="q"
                defaultValue={q}
                className="portal-input w-full sm:w-72"
                placeholder="Search name..."
              />

              <select name="show" defaultValue={show} className="portal-select">
                <option value="active">Active only</option>
                <option value="all">Include inactive</option>
              </select>

              <button className="portal-btn" type="submit">
                Filter
              </button>

              {(q || show !== "active") ? (
              <Link className="portal-btn" href="/portal/admin/users">
                Clear
              </Link>
                ) : null}


              <div className="ml-auto flex items-center gap-2">
                <Pill>{roleLabel(role)}</Pill>
                <Pill>{show === "all" ? "Active + inactive" : "Active only"}</Pill>
                <Pill>{(users ?? []).length} shown</Pill>
              </div>
            </form>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="portal-surface p-6">
              <h2 className="text-lg font-semibold text-slate-900">Create user</h2>
              <p className="mt-1 text-sm text-slate-600">
                Create a new portal account. Use a temporary password and ask the user to change it.
              </p>

              <form action={adminCreateUser} className="mt-4 grid gap-3">
                <label className="grid gap-1">
                  <span className="text-sm">Full name</span>
                  <input className="portal-input" name="full_name" placeholder="Full name" required />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm">Email</span>
                  <input className="portal-input" name="email" placeholder="Email" type="email" required />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm">Temporary password</span>
                  <input className="portal-input" name="password" placeholder="Temp password" type="password" required />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm">Role</span>
                  <select className="portal-select" name="role_key" defaultValue={role}>
                    <option value="student">Student</option>
                    <option value="parent">Parent</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>

                <div className="pt-1">
                  <button className="portal-btn portal-btn-primary" type="submit">
                    Create
                  </button>
                </div>

                <div className="rounded-xl border bg-white/70 p-3 text-xs text-slate-600">
                  Students, teachers, and parents are automatically created in their linked tables.
                </div>
              </form>
            </section>

            <section className="portal-surface p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{roleLabel(role)}</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Deactivate hides a user. Delete removes the user account and linked records.
                  </p>
                </div>
                <Pill>Max 300</Pill>
              </div>

              <div className="mt-4 divide-y rounded-xl border bg-white/70">
                {(users ?? []).map((u) => (
                  <UserRow key={u.id} u={u} />
                ))}

                {(users ?? []).length === 0 ? (
                  <div className="px-4 py-8 text-sm text-slate-600">No users found.</div>
                ) : null}
              </div>
            </section>
          </div>
        </div>
      </WatermarkedSection>
    );
  }

  const [admins, teachers, parents, students] = await Promise.all([
    baseQuery.eq("role_key", "admin").limit(8),
    baseQuery.eq("role_key", "teacher").limit(8),
    baseQuery.eq("role_key", "parent").limit(8),
    baseQuery.eq("role_key", "student").limit(8),
  ]);

  const [adminCount, teacherCount, parentCount, studentCount] = await Promise.all([
    sb.from("profiles").select("id", { count: "exact", head: true }).eq("role_key", "admin").then((r) => r.count ?? 0),
    sb.from("profiles").select("id", { count: "exact", head: true }).eq("role_key", "teacher").then((r) => r.count ?? 0),
    sb.from("profiles").select("id", { count: "exact", head: true }).eq("role_key", "parent").then((r) => r.count ?? 0),
    sb.from("profiles").select("id", { count: "exact", head: true }).eq("role_key", "student").then((r) => r.count ?? 0),
  ]);

  return (
    <WatermarkedSection tone="portal" variant="mixed">
      <ToastGate ok={params.ok} err={params.err} okText="Done." />

      <div className="grid gap-6">
        <section className="portal-surface p-6">
          <SectionTitle
            title="Users"
            subtitle="Create, search, deactivate, and permanently delete users."
            right={<Link className="portal-btn" href={printHref(role, q, show)}>Print / Save PDF</Link>}
          />

          <div className="portal-tabs mt-4">
            <Link className={tabClass(role, "all")} href={makeHref("all", q, show)}>
              All
            </Link>
            <Link className={tabClass(role, "admin")} href={makeHref("admin", q, show)}>
              Admins
            </Link>
            <Link className={tabClass(role, "teacher")} href={makeHref("teacher", q, show)}>
              Teachers
            </Link>
            <Link className={tabClass(role, "parent")} href={makeHref("parent", q, show)}>
              Parents
            </Link>
            <Link className={tabClass(role, "student")} href={makeHref("student", q, show)}>
              Students
            </Link>
          </div>

          <form className="mt-4 flex flex-wrap gap-2" action="/portal/admin/users" method="get">
            <input
              name="q"
              defaultValue={q}
              className="portal-input w-full sm:w-72"
              placeholder="Search name..."
            />

            <select name="show" defaultValue={show} className="portal-select">
              <option value="active">Active only</option>
              <option value="all">Include inactive</option>
            </select>

            <button className="portal-btn" type="submit">
              Filter
            </button>

            {(q || show !== "active") ? (
              <Link className="portal-btn" href="/portal/admin/users">
                Clear
              </Link>
            ) : null}

            <div className="ml-auto flex items-center gap-2">
              <Pill>Grouped view</Pill>
              <Pill>{show === "all" ? "Active + inactive" : "Active only"}</Pill>
              <Pill>
                {adminCount + teacherCount + parentCount + studentCount} total
              </Pill>
            </div>
          </form>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="portal-surface p-6">
            <h2 className="text-lg font-semibold text-slate-900">Create user</h2>
            <p className="mt-1 text-sm text-slate-600">
              Create a new portal account. Use a temporary password and ask the user to change it.
            </p>

            <form action={adminCreateUser} className="mt-4 grid gap-3">
              <label className="grid gap-1">
                <span className="text-sm">Full name</span>
                <input className="portal-input" name="full_name" placeholder="Full name" required />
              </label>

              <label className="grid gap-1">
                <span className="text-sm">Email</span>
                <input className="portal-input" name="email" placeholder="Email" type="email" required />
              </label>

              <label className="grid gap-1">
                <span className="text-sm">Temporary password</span>
                <input className="portal-input" name="password" placeholder="Temp password" type="password" required />
              </label>

              <label className="grid gap-1">
                <span className="text-sm">Role</span>
                <select className="portal-select" name="role_key" defaultValue="student">
                  <option value="student">Student</option>
                  <option value="parent">Parent</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </label>

              <div className="pt-1">
                <button className="portal-btn portal-btn-primary" type="submit">
                  Create
                </button>
              </div>

              <div className="rounded-xl border bg-white/70 p-3 text-xs text-slate-600">
                Students, teachers, and parents are automatically created in their linked tables.
              </div>
            </form>
          </section>

          <section className="portal-surface p-6">
            <h2 className="text-lg font-semibold text-slate-900">Overview</h2>
            <p className="mt-1 text-sm text-slate-600">
              Quick category summary. Open a category to manage all records.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border bg-white/70 p-4">
                <div className="text-sm font-semibold text-slate-900">Admins</div>
                <div className="mt-2 text-2xl font-bold text-[color:var(--ohs-charcoal)]">{adminCount}</div>
              </div>
              <div className="rounded-2xl border bg-white/70 p-4">
                <div className="text-sm font-semibold text-slate-900">Teachers</div>
                <div className="mt-2 text-2xl font-bold text-[color:var(--ohs-charcoal)]">{teacherCount}</div>
              </div>
              <div className="rounded-2xl border bg-white/70 p-4">
                <div className="text-sm font-semibold text-slate-900">Parents</div>
                <div className="mt-2 text-2xl font-bold text-[color:var(--ohs-charcoal)]">{parentCount}</div>
              </div>
              <div className="rounded-2xl border bg-white/70 p-4">
                <div className="text-sm font-semibold text-slate-900">Students</div>
                <div className="mt-2 text-2xl font-bold text-[color:var(--ohs-charcoal)]">{studentCount}</div>
              </div>
            </div>
          </section>
        </div>

        <div className="grid gap-6">
          <GroupCard title="Admins" roleKey="admin" items={admins.data ?? []} total={adminCount} q={q} show={show} />
          <GroupCard title="Teachers" roleKey="teacher" items={teachers.data ?? []} total={teacherCount} q={q} show={show} />
          <GroupCard title="Parents" roleKey="parent" items={parents.data ?? []} total={parentCount} q={q} show={show} />
          <GroupCard title="Students" roleKey="student" items={students.data ?? []} total={studentCount} q={q} show={show} />
        </div>
      </div>
    </WatermarkedSection>
  );
}
