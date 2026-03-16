"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";

const sb = () => supabaseAdmin();

const REPORT_COLUMNS = [
  "Mid Term 1",
  "End Term 1",
  "Mid Term 2",
  "End Term 2",
  "Mid Term 3",
  "End of Year",
] as const;

function normalizeAssessmentLabel(value: string | null | undefined) {
  const v = String(value ?? "").trim();

  if (REPORT_COLUMNS.includes(v as (typeof REPORT_COLUMNS)[number])) {
    return v as (typeof REPORT_COLUMNS)[number];
  }

  return null;
}

async function getOwnedScope(teacherId: string, teacherAssignmentId: number) {
  const { data, error } = await sb()
    .from("teacher_assignments")
    .select("id, teacher_id, class_id, subject_id, term_id")
    .eq("id", teacherAssignmentId)
    .eq("teacher_id", teacherId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden");
  return data;
}

export async function saveGrades(formData: FormData): Promise<void> {
  const me = await requireRole(["teacher"]);

  const rawAssessment = String(formData.get("assessment") ?? "").trim();
  const normalizedAssessment = normalizeAssessmentLabel(rawAssessment);

  const Schema = z.object({
    teacher_assignment_id: z.coerce.number().int().positive(),
    assessment: z.string().min(1).max(120),
    max_score: z.coerce.number().positive(),
  });

  const parsed = Schema.safeParse({
    teacher_assignment_id: formData.get("teacher_assignment_id"),
    assessment: rawAssessment,
    max_score: Number(formData.get("max_score")),
  });

  const tid = Number(formData.get("teacher_assignment_id") ?? 0);
  const backAssessment = normalizedAssessment ?? "Mid Term 1";
  const back = `/portal/teacher/grading?assignmentId=${tid}&assessment=${encodeURIComponent(backAssessment)}`;

  if (!parsed.success || !normalizedAssessment) {
    redirect(`${back}&err=${encodeURIComponent("Invalid assessment or max score.")}`);
  }

  const scope = await getOwnedScope(me.id, parsed.data.teacher_assignment_id);

  const { data: meta, error: metaErr } = await sb()
    .from("grade_assessments")
    .select("id, finalized_at")
    .eq("term_id", scope.term_id)
    .eq("class_id", scope.class_id)
    .eq("subject_id", scope.subject_id)
    .eq("assessment", normalizedAssessment)
    .maybeSingle();

  if (metaErr) redirect(`${back}&err=${encodeURIComponent(metaErr.message)}`);
  if (meta?.finalized_at) {
    redirect(`${back}&err=${encodeURIComponent("This assessment is finalized and cannot be edited.")}`);
  }

  const { error: upMetaErr } = await sb()
    .from("grade_assessments")
    .upsert(
      {
        term_id: scope.term_id,
        class_id: scope.class_id,
        subject_id: scope.subject_id,
        assessment: normalizedAssessment,
        max_score: parsed.data.max_score,
      },
      { onConflict: "term_id,class_id,subject_id,assessment" }
    );

  if (upMetaErr) redirect(`${back}&err=${encodeURIComponent(upMetaErr.message)}`);

  const rows: any[] = [];
  for (const [k, v] of formData.entries()) {
    if (!k.startsWith("score_")) continue;
    const studentId = k.replace("score_", "");
    const raw = String(v).trim();
    if (raw === "") continue;

    const score = Number(raw);
    if (Number.isNaN(score)) continue;

    rows.push({
      student_id: studentId,
      class_id: scope.class_id,
      subject_id: scope.subject_id,
      term_id: scope.term_id,
      assessment: normalizedAssessment,
      score,
      max_score: parsed.data.max_score,
      updated_by: me.id,
      updated_at: new Date().toISOString(),
    });
  }

  if (rows.length > 0) {
    for (const r of rows) {
      const { data: existing, error: findErr } = await sb()
        .from("grades")
        .select("id")
        .eq("student_id", r.student_id)
        .eq("class_id", r.class_id)
        .eq("subject_id", r.subject_id)
        .eq("term_id", r.term_id)
        .eq("assessment", r.assessment)
        .maybeSingle();

      if (findErr) redirect(`${back}&err=${encodeURIComponent(findErr.message)}`);

      if (existing?.id) {
        const { error: updErr } = await sb().from("grades").update(r).eq("id", existing.id);
        if (updErr) redirect(`${back}&err=${encodeURIComponent(updErr.message)}`);
      } else {
        const { error: insErr } = await sb().from("grades").insert(r);
        if (insErr) redirect(`${back}&err=${encodeURIComponent(insErr.message)}`);
      }
    }
  }

  revalidatePath("/portal/teacher/grading");
  revalidatePath("/portal/student/grades");
  revalidatePath("/portal/parent/grades");
  redirect(`${back}&ok=1`);
}

export async function finalizeAssessment(formData: FormData): Promise<void> {
  const me = await requireRole(["teacher"]);

  const teacherAssignmentId = Number(formData.get("teacher_assignment_id") ?? 0);
  const rawAssessment = String(formData.get("assessment") ?? "").trim();
  const normalizedAssessment = normalizeAssessmentLabel(rawAssessment) ?? "Mid Term 1";

  const back = `/portal/teacher/grading?assignmentId=${teacherAssignmentId}&assessment=${encodeURIComponent(normalizedAssessment)}`;

  if (!teacherAssignmentId || !normalizedAssessment) {
    redirect(`${back}&err=${encodeURIComponent("Missing grading scope.")}`);
  }

  const scope = await getOwnedScope(me.id, teacherAssignmentId);

  const { data: meta, error: metaErr } = await sb()
    .from("grade_assessments")
    .select("id, finalized_at")
    .eq("term_id", scope.term_id)
    .eq("class_id", scope.class_id)
    .eq("subject_id", scope.subject_id)
    .eq("assessment", normalizedAssessment)
    .maybeSingle();

  if (metaErr) redirect(`${back}&err=${encodeURIComponent(metaErr.message)}`);

  if (!meta?.id) {
    redirect(`${back}&err=${encodeURIComponent("Save grades first before finalizing.")}`);
  }

  if (meta.finalized_at) {
    redirect(`${back}&ok=1`);
  }

  const { error } = await sb()
    .from("grade_assessments")
    .update({ finalized_at: new Date().toISOString(), finalized_by: me.id })
    .eq("id", meta.id);

  if (error) redirect(`${back}&err=${encodeURIComponent(error.message)}`);

  revalidatePath("/portal/teacher/grading");
  revalidatePath("/portal/student/grades");
  revalidatePath("/portal/parent/grades");
  redirect(`${back}&ok=1`);
}
