import "server-only";
import { requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function searchParents(q: string) {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();

  let query = sb.from("parents").select("id, full_name").order("full_name", { ascending: true }).limit(50);
  const qq = (q ?? "").trim();
  if (qq) query = query.ilike("full_name", `%${qq}%`);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function searchStudents(q: string) {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();

  let query = sb
    .from("students")
    .select("id, full_name, admission_no")
    .eq("is_active", true)
    .order("full_name", { ascending: true })
    .limit(80);

  const qq = (q ?? "").trim();
  if (qq) query = query.or(`full_name.ilike.%${qq}%,admission_no.ilike.%${qq}%`);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listLinks(parentId: string) {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();

  if (!parentId) return [];

  const { data, error } = await sb
    .from("parent_students")
    .select("parent_id, student_id, students:student_id ( id, full_name, admission_no )")
    .eq("parent_id", parentId)
    .limit(200);

  if (error) throw new Error(error.message);
  return data ?? [];
}