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

export async function listActiveTerms() {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("academic_terms")
    .select("id, name, is_active")
    .eq("is_active", true)
    .order("id", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listClasses() {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("class_groups")
    .select("id, name, level, track_key, is_active, updated_at")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listActiveClasses() {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("class_groups")
    .select("id, name")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listSubjects() {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("subjects")
    .select("id, code, name, track, is_active, updated_at")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listActiveSubjects() {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("subjects")
    .select("id, code, name")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listTeachers() {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("teachers")
    .select("id, full_name")
    .eq("is_active", true)
    .order("full_name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listStudents() {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("students")
    .select("id, full_name")
    .eq("is_active", true)
    .order("full_name", { ascending: true })
    .limit(500);

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
      class_groups:class_id ( id, name ),
      subjects:subject_id ( id, name, code ),
      teachers:teacher_id ( id, full_name )
    `)
    .order("id", { ascending: false })
    .limit(500);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listEnrollments(termId: number, classId: number) {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();

  if (!termId || !classId) return [];

  const { data, error } = await sb
    .from("enrollments")
    .select("id, student_id, students:student_id ( id, full_name )")
    .eq("term_id", termId)
    .eq("class_id", classId)
    .order("id", { ascending: false })
    .limit(500);

  if (error) throw new Error(error.message);
  return data ?? [];
}
