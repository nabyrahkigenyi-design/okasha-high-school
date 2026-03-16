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

export async function listClasses(opts?: {
  includeInactive?: boolean;
  q?: string;
  schoolLevel?: string;
}) {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();

  let query = sb
    .from("class_groups")
    .select("id, name, level, school_level, stream, track_key, is_active, updated_at")
    .order("school_level", { ascending: true, nullsFirst: false })
    .order("level", { ascending: true })
    .order("stream", { ascending: true, nullsFirst: false })
    .order("name", { ascending: true });

  if (!opts?.includeInactive) query = query.eq("is_active", true);

  const q = (opts?.q ?? "").trim();
  const schoolLevel = (opts?.schoolLevel ?? "").trim();

  if (q) {
    query = query.or(
      `name.ilike.%${q}%,level.ilike.%${q}%,stream.ilike.%${q}%,school_level.ilike.%${q}%`
    );
  }

  if (schoolLevel) query = query.eq("school_level", schoolLevel);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listSubjects(opts?: {
  includeInactive?: boolean;
  q?: string;
  schoolLevel?: string;
}) {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();

  let query = sb
    .from("subjects")
    .select("id, code, name, track, school_level, subject_category, is_active, updated_at")
    .order("school_level", { ascending: true, nullsFirst: false })
    .order("name", { ascending: true });

  if (!opts?.includeInactive) query = query.eq("is_active", true);

  const q = (opts?.q ?? "").trim();
  const schoolLevel = (opts?.schoolLevel ?? "").trim();

  if (q) {
    query = query.or(
      `name.ilike.%${q}%,code.ilike.%${q}%,school_level.ilike.%${q}%,subject_category.ilike.%${q}%`
    );
  }

  if (schoolLevel) query = query.eq("school_level", schoolLevel);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listTeachers(opts?: { q?: string }) {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();

  let query = sb
    .from("teachers")
    .select("id, full_name, department, staff_no")
    .eq("is_active", true)
    .order("full_name", { ascending: true });

  const q = (opts?.q ?? "").trim();
  if (q) query = query.or(`full_name.ilike.%${q}%,department.ilike.%${q}%,staff_no.ilike.%${q}%`);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listStudents(opts?: { q?: string; limit?: number }) {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();

  let query = sb
    .from("students")
    .select("id, full_name, student_no, school_level, class_level, stream, subject_combination")
    .eq("is_active", true)
    .order("full_name", { ascending: true });

  const q = (opts?.q ?? "").trim();
  if (q) {
    query = query.or(
      `full_name.ilike.%${q}%,student_no.ilike.%${q}%,class_level.ilike.%${q}%,subject_combination.ilike.%${q}%`
    );
  }

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
      class_groups:class_id ( id, name, level, school_level, stream, track_key ),
      subjects:subject_id ( id, name, code, track, school_level, subject_category ),
      teachers:teacher_id ( id, full_name, department, staff_no )
    `)
    .order("id", { ascending: false })
    .limit(500);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listClassTeachers() {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();

  const { data, error } = await sb
    .from("class_teachers")
    .select(`
      id,
      term_id,
      class_id,
      teacher_id,
      created_at,
      academic_terms:term_id ( id, name ),
      class_groups:class_id ( id, name, level, school_level, stream, track_key ),
      teachers:teacher_id ( id, full_name, department, staff_no )
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
    .select(`
      id,
      student_id,
      students:student_id (
        id,
        full_name,
        student_no,
        school_level,
        class_level,
        stream,
        subject_combination
      )
    `)
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
