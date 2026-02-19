import "server-only";
import { requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function getAssignmentOrNull(assignmentId: number) {
  const me = await requireRole(["teacher"]);
  const sb = supabaseAdmin();

  const { data, error } = await sb
    .from("teacher_assignments")
    .select("id, term_id, class_id, subject_id, teacher_id")
    .eq("id", assignmentId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data || data.teacher_id !== me.id) return null;
  return data;
}

export async function listEnrolledStudents(termId: number, classId: number) {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("enrollments")
    .select("student_id, students:student_id ( id, full_name )")
    .eq("term_id", termId)
    .eq("class_id", classId)
    .order("student_id", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map((r: any) => ({ id: r.students.id, full_name: r.students.full_name }));
}

export async function getSession(assignmentId: number, date: string) {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("attendance_sessions")
    .select("id, assignment_id, session_date")
    .eq("assignment_id", assignmentId)
    .eq("session_date", date)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ?? null;
}

export async function getMarks(sessionId: number) {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("attendance_marks")
    .select("student_id, status, note")
    .eq("session_id", sessionId);

  if (error) throw new Error(error.message);
  const map = new Map<string, { status: string; note: string | null }>();
  (data ?? []).forEach((m: any) => map.set(m.student_id, { status: m.status, note: m.note }));
  return map;
}
