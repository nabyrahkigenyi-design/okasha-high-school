import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getTeacherAssignmentById, getTeacherAssignments, listRosterForAssignment } from "../queries";

export async function listGradingOptions() {
  return getTeacherAssignments();
}

export async function getGradingScopeOrNull(assignmentId: number) {
  if (!assignmentId) return null;
  return getTeacherAssignmentById(assignmentId);
}

export async function listStudentsForGrading(assignmentId: number) {
  return listRosterForAssignment(assignmentId);
}

export async function getAssessmentMeta(params: { assignmentId: number; assessment: string }) {
  const scope = await getTeacherAssignmentById(params.assignmentId);
  if (!scope || !params.assessment.trim()) return null;

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("grade_assessments")
    .select("id, max_score, finalized_at, finalized_by")
    .eq("term_id", scope.term_id)
    .eq("class_id", scope.class_id)
    .eq("subject_id", scope.subject_id)
    .eq("assessment", params.assessment.trim())
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ?? null;
}

export async function getGradeMapForScope(params: { assignmentId: number; assessment: string }) {
  const scope = await getTeacherAssignmentById(params.assignmentId);
  if (!scope || !params.assessment.trim()) return new Map<string, { score: string; max_score: string }>();

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("grades")
    .select("student_id, score, max_score")
    .eq("class_id", scope.class_id)
    .eq("subject_id", scope.subject_id)
    .eq("term_id", scope.term_id)
    .eq("assessment", params.assessment.trim());

  if (error) throw new Error(error.message);

  const map = new Map<string, { score: string; max_score: string }>();
  (data ?? []).forEach((row: any) => {
    map.set(row.student_id, {
      score: row.score != null ? String(row.score) : "",
      max_score: row.max_score != null ? String(row.max_score) : "",
    });
  });

  return map;
}