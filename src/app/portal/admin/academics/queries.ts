import "server-only";
import { requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function listTerms() {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("academic_terms")
    .select("id, name, starts_on, ends_on, is_active, updated_at")
    .order("id", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listClasses(opts?: { includeInactive?: boolean; q?: string }) {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();

  let query = sb
    .from("class_groups")
    .select("id, name, level, track_key, is_active, updated_at")
    .order("name", { ascending: true });

  if (!opts?.includeInactive) query = query.eq("is_active", true);

  const q = (opts?.q ?? "").trim();
  if (q) {
    // Search by name or level
    query = query.or(`name.ilike.%${q}%,level.ilike.%${q}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listSubjects(opts?: { includeInactive?: boolean; q?: string }) {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();

  let query = sb
    .from("subjects")
    .select("id, code, name, track, is_active, updated_at")
    .order("name", { ascending: true });

  if (!opts?.includeInactive) query = query.eq("is_active", true);

  const q = (opts?.q ?? "").trim();
  if (q) {
    // Search by name or code
    query = query.or(`name.ilike.%${q}%,code.ilike.%${q}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listTeachers(opts?: { q?: string }) {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();

  let query = sb
    .from("teachers")
    .select("id, full_name")
    .eq("is_active", true)
    .order("full_name", { ascending: true });

  const q = (opts?.q ?? "").trim();
  if (q) query = query.ilike("full_name", `%${q}%`);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listStudents(opts?: { q?: string; limit?: number }) {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();

  let query = sb
    .from("students")
    .select("id, full_name")
    .eq("is_active", true)
    .order("full_name", { ascending: true });

  const q = (opts?.q ?? "").trim();
  if (q) query = query.ilike("full_name", `%${q}%`);

  query = query.limit(opts?.limit ?? 500);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listAssignments() {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("teacher_assignments")
    .select(`
      id,
      term_id,
      class_id,
      subject_id,
      teacher_id,
      academic_terms:term_id ( id, name ),
      class_groups:class_id ( id, name, track_key ),
      subjects:subject_id ( id, name, code, track ),
      teachers:teacher_id ( id, full_name )
    `)
    .order("id", { ascending: false })
    .limit(500);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listEnrollments(termId: number, classId: number, limit = 500) {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();

  if (!termId || !classId) return [];

  const { data, error } = await sb
    .from("enrollments")
    .select("id, student_id, students:student_id ( id, full_name )")
    .eq("term_id", termId)
    .eq("class_id", classId)
    .order("id", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getEnrollmentCount(termId: number, classId: number) {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();

  if (!termId || !classId) return 0;

  const { count, error } = await sb
    .from("enrollments")
    .select("id", { count: "exact", head: true })
    .eq("term_id", termId)
    .eq("class_id", classId);

  if (error) throw new Error(error.message);
  return count ?? 0;
}