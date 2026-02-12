import { requireRole } from "@/lib/rbac";
import { adminCreateUser } from "./actions";

export default async function AdminUsers() {
  await requireRole(["admin"]);

  return (
    <div className="rounded-2xl border bg-white p-5">
      <h1 className="text-xl font-semibold">Users</h1>
      <p className="mt-2 text-slate-600">Create users (placeholder UI).</p>

      <form action={adminCreateUser} className="mt-4 grid gap-3 max-w-lg">
        <input className="rounded-lg border px-3 py-2" name="full_name" placeholder="Full name" required />
        <input className="rounded-lg border px-3 py-2" name="email" placeholder="Email" type="email" required />
        <input className="rounded-lg border px-3 py-2" name="password" placeholder="Temp password" type="password" required />
        <select className="rounded-lg border px-3 py-2" name="role_key" defaultValue="student">
          <option value="student">Student</option>
          <option value="parent">Parent</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>

        <button className="rounded-lg px-4 py-2 font-medium text-white" style={{ background: "var(--ohs-dark-green)" }}>
          Create user
        </button>
      </form>
    </div>
  );
}
