import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getTeacherAssignmentById, getTeacherAssignments } from "../queries";

export async function listAssignmentOptions() {
  return getTeacherAssignments();
}

export async function getSelectedAssignmentOrNull(assignmentId: number) {
  if (!assignmentId) return null;
  return getTeacherAssignmentById(assignmentId);
}

export async function listMyAssignmentsForScope(assignmentId: number) {
  const scope = await getTeacherAssignmentById(assignmentId);
  if (!scope) return [];

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("assignments")
    .select("id, title, description, due_at, attachment_url, created_at, created_by")
    .eq("term_id", scope.term_id)
    .eq("class_id", scope.class_id)
    .eq("subject_id", scope.subject_id)
    .eq("created_by", scope.teacher_id)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) throw new Error(error.message);
  return data ?? [];
}