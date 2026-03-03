import { requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";
import PrintControls from "./PrintControls";

function fmt(d?: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleString();
}

export default async function PrintUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; q?: string; show?: string }>;
}) {
  await requireRole(["admin"]);
  const params = await searchParams;

  const role = (params.role ?? "all") as "all" | "admin" | "teacher" | "parent" | "student";
  const q = (params.q ?? "").trim();
  const show = params.show ?? "active";

  const sb = supabaseAdmin();

  let query = sb
    .from("profiles")
    .select("id, full_name, role_key, is_active, created_at")
    .order("role_key", { ascending: true })
    .order("full_name", { ascending: true })
    .limit(2000);

  if (role !== "all") query = query.eq("role_key", role);
  if (show !== "all") query = query.eq("is_active", true);
  if (q.length > 0) query = query.ilike("full_name", `%${q}%`);

  const { data: users } = await query;

  return (
    <main className="mx-auto max-w-4xl p-6 bg-white">
      <style>{`
        @media print {
          .no-print { display: none; }
          body { background: white !important; }
        }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; }
        th { background: #f3f4f6; text-align: left; }
      `}</style>

      <PrintControls />

      <h1 className="text-lg font-semibold">Okasha High School — Users List</h1>
      <p className="text-sm text-slate-600">
        Filter: role={role}, show={show}, search={q || "-"} • Generated: {new Date().toLocaleString()}
      </p>

      <table className="mt-4">
        <thead>
          <tr>
            <th>#</th>
            <th>Full name</th>
            <th>Role</th>
            <th>Status</th>
            <th>Created</th>
            <th>ID</th>
          </tr>
        </thead>
        <tbody>
          {(users ?? []).map((u, idx) => (
            <tr key={u.id}>
              <td>{idx + 1}</td>
              <td>{u.full_name}</td>
              <td>{u.role_key}</td>
              <td>{u.is_active ? "active" : "inactive"}</td>
              <td>{fmt(u.created_at)}</td>
              <td style={{ fontFamily: "monospace" }}>{u.id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}