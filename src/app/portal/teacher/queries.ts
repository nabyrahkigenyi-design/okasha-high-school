import "server-only";
import { requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";

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

export async function getTeacherAssignments(opts?: { termId?: number }) {
  const me = await requireRole(["teacher"]);
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
      class_groups:class_id ( id, name, level, track_key ),
      subjects:subject_id ( id, name, code, track )
    `)
    .eq("term_id", activeTerm.id)
    .eq("teacher_id", me.id)
    .order("id", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getTeacherAssignmentById(assignmentId: number) {
  const me = await requireRole(["teacher"]);
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
      class_groups:class_id ( id, name, level, track_key ),
      subjects:subject_id ( id, name, code, track )
    `)
    .eq("id", assignmentId)
    .eq("teacher_id", me.id)
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