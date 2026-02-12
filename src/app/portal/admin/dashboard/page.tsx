import { requireRole } from "@/lib/rbac";

export default async function AdminDashboard() {
  const me = await requireRole(["admin"]);

  return (
    <div className="rounded-2xl border bg-white p-5">
      <h1 className="text-xl font-semibold">Admin Dashboard</h1>
      <p className="mt-2 text-slate-600">Welcome, {me.full_name}.</p>
    </div>
  );
}
