import "server-only";
import { requireRole } from "@/lib/rbac";
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
  const me = await requireRole(["teacher"]);
  const sb = supabaseAdmin();

  const scope = await getTeacherAssignmentById(assignmentId);
  if (!scope) return [];

  const { data, error } = await sb
    .from("assignments")
    .select("id, class_id, subject_id, term_id, title, description, due_at, attachment_url, created_by, created_at")
    .eq("class_id", scope.class_id)
    .eq("subject_id", scope.subject_id)
    .eq("term_id", scope.term_id)
    .eq("created_by", me.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}