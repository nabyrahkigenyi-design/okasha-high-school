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

  const makeHref = (nextRole: string) => {
    const sp = new URLSearchParams();
    if (nextRole !== "all") sp.set("role", nextRole);
    if (q) sp.set("q", q);
    if (show !== "active") sp.set("show", show);
    const qs = sp.toString();
    return qs ? `/portal/admin/users?${qs}` : "/portal/admin/users";
  };

  const printHref = () => {
    const sp = new URLSearchParams();
    if (role !== "all") sp.set("role", role);
    if (q) sp.set("q", q);
    if (show !== "active") sp.set("show", show);
    const qs = sp.toString();
    return qs ? `/portal/admin/users/print?${qs}` : "/portal/admin/users/print";
  };

  const tabClass = (k: string) => `portal-tab ${role === k ? "portal-tab-active" : ""}`;

  // Toast message based on actions
  const okText =
    params.ok && role === "all"
      ? "Done."
      : params.ok
        ? "Done."
        : "Done.";

  return (
    <WatermarkedSection tone="portal" variant="mixed">
      <ToastGate ok={params.ok} err={params.err} okText={okText} />

      <div className="grid gap-6">
        {/* Header */}
        <section className="portal-surface p-6">
          <SectionTitle
            title="Users"
            subtitle="Create, search, deactivate, and export users."
            right={
              <>
                <Link className="portal-btn" href={printHref()}>
                  Print / Save PDF
                </Link>
              </>
            }
          />

          {/* Tabs */}
          <div className="portal-tabs mt-4">
            <Link className={tabClass("all")} href={makeHref("all")}>
              All
            </Link>
            <Link className={tabClass("admin")} href={makeHref("admin")}>
              Admins
            </Link>
            <Link className={tabClass("teacher")} href={makeHref("teacher")}>
              Teachers
            </Link>
            <Link className={tabClass("parent")} href={makeHref("parent")}>
              Parents
            </Link>
            <Link className={tabClass("student")} href={makeHref("student")}>
              Students
            </Link>
          </div>

          {/* Filters */}
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

            {(q || show !== "active" || role !== "all") ? (
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

        {/* Content grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Create */}
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
                <input
                  className="portal-input"
                  name="password"
                  placeholder="Temp password"
                  type="password"
                  required
                />
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
                Students/teachers/parents are automatically created in their tables to support
                enrollments and assignments.
              </div>
            </form>
          </section>

          {/* List */}
          <section className="portal-surface p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Users list</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Deactivate hides a user from the default list. Purge deletes only if no linked records exist.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Pill>Max 300</Pill>
              </div>
            </div>

            <div className="mt-4 divide-y rounded-xl border bg-white/70">
              {(users ?? []).map((u) => (
                <div key={u.id} className="px-3 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium text-slate-900 truncate">
                      {u.full_name}{" "}
                      {!u.is_active ? <span className="text-xs text-red-700">• inactive</span> : null}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
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
                        confirmText={`Purge "${u.full_name}"?\n\nThis will DELETE the profile if it has no linked records.\nRecommended: Deactivate instead.`}
                        title="Purge user"
                      >
                        Purge
                      </ConfirmSubmitButton>
                    </form>
                  </div>
                </div>
              ))}

              {(users ?? []).length === 0 ? (
                <div className="px-3 py-8 text-sm text-slate-600">No users found.</div>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </WatermarkedSection>
  );
}