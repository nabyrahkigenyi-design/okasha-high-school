import { requireRole } from "@/lib/auth/require-role";

export default async function TeacherDashboard() {
  const me = await requireRole(["teacher"]);
  return (
    <div className="rounded-2xl border bg-white p-5">
      <h1 className="text-xl font-semibold">Teacher Dashboard</h1>
      <p className="mt-2 text-slate-600">Welcome, {me.full_name}. (Placeholder)</p>
    </div>
  );
}