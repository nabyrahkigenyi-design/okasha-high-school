import { requireRole } from "@/lib/auth/require-role";

export default async function ParentDashboard() {
  const me = await requireRole(["parent"]);
  return (
    <div className="rounded-2xl border bg-white p-5">
      <h1 className="text-xl font-semibold">Parent Dashboard</h1>
      <p className="mt-2 text-slate-600">Welcome, {me.full_name}. (Placeholder)</p>
    </div>
  );
}