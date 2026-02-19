import "server-only";
import { requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function getActiveTermId() {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("academic_terms")
    .select("id")
    .eq("is_active", true)
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data?.id ?? null;
}

export async function listMyAssignments() {
  const me = await requireRole(["teacher"]); // this is profile
  const sb = supabaseAdmin();

  const termId = await getActiveTermId();
  if (!termId) return [];

  // 🔥 Step 1: get teachers.id using profile id
  const { data: teacherRow, error: teacherErr } = await sb
    .from("teachers")
    .select("id")
    .eq("id", me.id)  // because teachers.id = profiles.id in your setup
    .maybeSingle();

  if (teacherErr) throw new Error(teacherErr.message);
  if (!teacherRow) return [];

  // 🔥 Step 2: use teachers.id
  const { data, error } = await sb
    .from("teacher_assignments")
    .select(`
      id,
      term_id,
      class_groups!teacher_assignments_class_id_fkey (
        id,
        name,
        level
      ),
      subjects!teacher_assignments_subject_id_fkey (
        id,
        name,
        track
      )
    `)
    .eq("term_id", termId)
    .eq("teacher_id", teacherRow.id) // ✅ CORRECT
    .order("id", { ascending: true });

  if (error) throw new Error(error.message);

  return data ?? [];
}
