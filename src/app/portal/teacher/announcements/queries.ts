import "server-only";
import { requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function listMyAssignmentScopes() {
  const me = await requireRole(["teacher"]);
  const sb = supabaseAdmin();

  const { data, error } = await sb
    .from("teacher_assignments")
    .select(`
      id,
      term_id,
      class_id,
      academic_terms:term_id ( id, name ),
      class_groups:class_id ( id, name, level, track_key )
    `)
    .eq("teacher_id", me.id)
    .order("term_id", { ascending: false })
    .limit(300);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listMyAnnouncements(termId?: number, classId?: number) {
  const me = await requireRole(["teacher"]);
  const sb = supabaseAdmin();

  let q = sb
    .from("announcements")
    .select("id, title, body, term_id, class_id, created_by, created_at")
    .eq("created_by", me.id)
    .order("created_at", { ascending: false })
    .limit(200);

  if (termId) q = q.eq("term_id", termId);
  if (classId) q = q.eq("class_id", classId);

  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return data ?? [];
}