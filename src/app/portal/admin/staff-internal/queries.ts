import "server-only";
import { requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function listStaffTitles() {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();

  const { data, error } = await sb
    .from("staff_titles")
    .select("id, title_name, sort_order, is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("title_name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listTeachers(opts?: {
  q?: string;
  includeInactive?: boolean;
  titleId?: string;
}) {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();

  let query = sb
    .from("teachers")
    .select(`
      id,
      staff_no,
      department,
      full_name,
      is_active,
      updated_at,
      user_id,
      first_name,
      last_name,
      other_names,
      sex,
      phone,
      email,
      photo_url,
      date_of_birth,
      national_id,
      residence,
      qualification,
      employment_type,
      salary_amount,
      salary_frequency,
      title_id,
      is_muslim,
      notes,
      created_at,
      subjects_summary,
      classes_summary,
      theology_role,
      secular_role,
      staff_titles:title_id (
        id,
        title_name
      )
    `)
    .order("created_at", { ascending: false })
    .limit(500);

  if (!opts?.includeInactive) {
    query = query.eq("is_active", true);
  }

  const q = (opts?.q ?? "").trim();
  const titleId = (opts?.titleId ?? "").trim();

  if (q) {
    query = query.or(
      [
        `full_name.ilike.%${q}%`,
        `staff_no.ilike.%${q}%`,
        `department.ilike.%${q}%`,
        `phone.ilike.%${q}%`,
        `email.ilike.%${q}%`,
        `qualification.ilike.%${q}%`,
        `subjects_summary.ilike.%${q}%`,
        `classes_summary.ilike.%${q}%`,
      ].join(",")
    );
  }

  if (titleId) {
    query = query.eq("title_id", Number(titleId));
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return data ?? [];
}

export async function getTeacherById(id: string) {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();

  const { data, error } = await sb
    .from("teachers")
    .select(`
      id,
      staff_no,
      department,
      full_name,
      is_active,
      updated_at,
      user_id,
      first_name,
      last_name,
      other_names,
      sex,
      phone,
      email,
      photo_url,
      date_of_birth,
      national_id,
      residence,
      qualification,
      employment_type,
      salary_amount,
      salary_frequency,
      title_id,
      is_muslim,
      notes,
      created_at,
      subjects_summary,
      classes_summary,
      theology_role,
      secular_role,
      staff_titles:title_id (
        id,
        title_name
      )
    `)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ?? null;
}

export async function getTeacherStats() {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();

  const [totalRes, activeRes, inactiveRes, theologyRes, secularRes] = await Promise.all([
    sb.from("teachers").select("id", { count: "exact", head: true }),
    sb.from("teachers").select("id", { count: "exact", head: true }).eq("is_active", true),
    sb.from("teachers").select("id", { count: "exact", head: true }).eq("is_active", false),
    sb.from("teachers").select("id", { count: "exact", head: true }).eq("theology_role", true),
    sb.from("teachers").select("id", { count: "exact", head: true }).eq("secular_role", true),
  ]);

  return {
    total: totalRes.count ?? 0,
    active: activeRes.count ?? 0,
    inactive: inactiveRes.count ?? 0,
    theology: theologyRes.count ?? 0,
    secular: secularRes.count ?? 0,
  };
}

export async function listTeacherAssignmentsForTeacher(teacherId: string) {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();

  if (!teacherId) return [];

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
      subjects:subject_id ( id, name, code, school_level, subject_category )
    `)
    .eq("teacher_id", teacherId)
    .order("id", { ascending: false })
    .limit(300);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listClassTeacherAssignmentsForTeacher(teacherId: string) {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();

  if (!teacherId) return [];

  const { data, error } = await sb
    .from("class_teachers")
    .select(`
      id,
      term_id,
      class_id,
      teacher_id,
      created_at,
      academic_terms:term_id ( id, name ),
      class_groups:class_id ( id, name, level, school_level, stream, track_key )
    `)
    .eq("teacher_id", teacherId)
    .order("id", { ascending: false })
    .limit(200);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listTermsForStaffForm() {
  await requireRole(["admin"]);
  const { data, error } = await supabaseAdmin()
    .from("academic_terms")
    .select("id, name, is_active")
    .order("id", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listClassesForStaffForm() {
  await requireRole(["admin"]);
  const { data, error } = await supabaseAdmin()
    .from("class_groups")
    .select("id, name, school_level, track_key, is_active")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listSubjectsForStaffForm() {
  await requireRole(["admin"]);
  const { data, error } = await supabaseAdmin()
    .from("subjects")
    .select("id, code, name, school_level, is_active")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}
