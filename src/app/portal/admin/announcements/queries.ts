import "server-only";
import { requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function listTerms() {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("academic_terms")
    .select("id, name, is_active")
    .order("id", { ascending: false })
    .limit(50);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listClasses() {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("class_groups")
    .select("id, name, level, track_key, is_active")
    .eq("is_active", true)
    .order("name", { ascending: true })
    .limit(300);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listAnnouncements(termId?: number) {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();

  let q = sb
    .from("announcements")
    .select("id, title, body, term_id, class_id, created_by, created_at")
    .order("created_at", { ascending: false })
    .limit(300);

  if (termId) q = q.eq("term_id", termId);

  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return data ?? [];
}