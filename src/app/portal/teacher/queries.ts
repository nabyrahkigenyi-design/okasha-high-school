import "server-only";
import { requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";

export async function getActiveTerm() {
  const sb = supabaseAdmin();

  const { data, error } = await sb
    .from("academic_terms")
    .select("id, name, starts_on, ends_on, is_active")
    .eq("is_active", true)
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ?? null;
}

export async function getTeacherOrThrow() {
  const me: any = await requireRole(["teacher"]);
  const sb = supabaseAdmin();

  // 1) New model: teachers.user_id = auth/profile id
  const { data: byUserId, error: byUserIdErr } = await sb
    .from("teachers")
    .select(`
      id,
      user_id,
      staff_no,
      department,
      full_name,
      is_active,
      updated_at,
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
      secular_role
    `)
    .eq("user_id", me.id)
    .maybeSingle();

  if (byUserIdErr) throw new Error(byUserIdErr.message);
  if (byUserId?.id) return byUserId;

  // 2) Legacy model: teachers.id = auth/profile id
  const { data: byLegacyId, error: byLegacyIdErr } = await sb
    .from("teachers")
    .select(`
      id,
      user_id,
      staff_no,
      department,
      full_name,
      is_active,
      updated_at,
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
      secular_role
    `)
    .eq("id", me.id)
    .maybeSingle();

  if (byLegacyIdErr) throw new Error(byLegacyIdErr.message);
  if (byLegacyId?.id) return byLegacyId;

  // 3) Fallback via auth session
  try {
    const sbServer = await supabaseServer();
    const {
      data: { user },
    } = await sbServer.auth.getUser();

    if (user?.id) {
      const { data: byAuth, error: byAuthErr } = await sb
        .from("teachers")
        .select(`
          id,
          user_id,
          staff_no,
          department,
          full_name,
          is_active,
          updated_at,
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
          secular_role
        `)
        .or(`user_id.eq.${user.id},id.eq.${user.id}`)
        .maybeSingle();

      if (byAuthErr) throw new Error(byAuthErr.message);
      if (byAuth?.id) return byAuth;
    }
  } catch {
    // ignore fallback failures
  }

  throw new Error("Teacher profile not found");
}

export async function getTeacherAssignments(opts?: { termId?: number }) {
  const teacher = await getTeacherOrThrow();
  const sb = supabaseAdmin();

  const activeTerm = opts?.termId ? { id: opts.termId } : await getActiveTerm();
  if (!activeTerm?.id) return [];

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
      subjects:subject_id ( id, name, code, track, school_level, subject_category )
    `)
    .eq("term_id", activeTerm.id)
    .eq("teacher_id", teacher.id)
    .order("id", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getTeacherAssignmentById(assignmentId: number) {
  const teacher = await getTeacherOrThrow();
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
      subjects:subject_id ( id, name, code, track, school_level, subject_category )
    `)
    .eq("id", assignmentId)
    .eq("teacher_id", teacher.id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ?? null;
}

export async function listRosterForAssignment(assignmentId: number) {
  const assignment = await getTeacherAssignmentById(assignmentId);
  if (!assignment) return [];

  const sb = supabaseAdmin();

  const { data, error } = await sb
    .from("enrollments")
    .select("student_id, students:student_id ( id, full_name )")
    .eq("term_id", assignment.term_id)
    .eq("class_id", assignment.class_id)
    .order("student_id", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row: any) => ({
    id: row.students?.id ?? row.student_id,
    full_name: row.students?.full_name ?? "Student",
  }));
}
