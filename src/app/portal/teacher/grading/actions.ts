"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";

const sb = () => supabaseAdmin();

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

  const Schema = z.object({
    teacher_assignment_id: z.coerce.number().int().positive(),
    assessment: z.string().min(1).max(120),
    max_score: z.coerce.number().positive(),
  });

  const parsed = Schema.safeParse({
    teacher_assignment_id: formData.get("teacher_assignment_id"),
    assessment: String(formData.get("assessment") ?? "").trim(),
    max_score: Number(formData.get("max_score")),
  });

  const tid = Number(formData.get("teacher_assignment_id") ?? 0);
  const assessment = String(formData.get("assessment") ?? "").trim();
  const back = `/portal/teacher/grading?assignmentId=${tid}&assessment=${encodeURIComponent(assessment)}`;

  if (!parsed.success) {
    redirect(`${back}&err=${encodeURIComponent("Invalid assessment/max score.")}`);
  }

  const scope = await getOwnedScope(me.id, parsed.data.teacher_assignment_id);

  // block if finalized
  const { data: meta, error: metaErr } = await sb()
    .from("grade_assessments")
    .select("id, finalized_at")
    .eq("term_id", scope.term_id)
    .eq("class_id", scope.class_id)
    .eq("subject_id", scope.subject_id)
    .eq("assessment", parsed.data.assessment)
    .maybeSingle();

  if (metaErr) redirect(`${back}&err=${encodeURIComponent(metaErr.message)}`);
  if (meta?.finalized_at) redirect(`${back}&err=${encodeURIComponent("This assessment is finalized and cannot be edited.")}`);

  // upsert assessment meta (max_score)
  const { error: upMetaErr } = await sb()
    .from("grade_assessments")
    .upsert(
      {
        term_id: scope.term_id,
        class_id: scope.class_id,
        subject_id: scope.subject_id,
        assessment: parsed.data.assessment,
        max_score: parsed.data.max_score,
      },
      { onConflict: "term_id,class_id,subject_id,assessment" }
    );

  if (upMetaErr) redirect(`${back}&err=${encodeURIComponent(upMetaErr.message)}`);

  // upsert grades
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
      assessment: parsed.data.assessment,
      score,
      max_score: parsed.data.max_score,
      updated_by: me.id,
      updated_at: new Date().toISOString(),
    });
  }

  if (rows.length > 0) {
    // safest: upsert if you add unique constraint; otherwise insert/update loop.
    // If you don't have a unique constraint, keep as insert/update loop.
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
  redirect(`${back}&ok=1`);
}

export async function finalizeAssessment(formData: FormData): Promise<void> {
  const me = await requireRole(["teacher"]);

  const teacherAssignmentId = Number(formData.get("teacher_assignment_id") ?? 0);
  const assessment = String(formData.get("assessment") ?? "").trim();
  const back = `/portal/teacher/grading?assignmentId=${teacherAssignmentId}&assessment=${encodeURIComponent(assessment)}`;

  if (!teacherAssignmentId || !assessment) redirect(`${back}&err=${encodeURIComponent("Missing scope.")}`);

  const scope = await getOwnedScope(me.id, teacherAssignmentId);

  const { data: meta, error: metaErr } = await sb()
    .from("grade_assessments")
    .select("id, finalized_at")
    .eq("term_id", scope.term_id)
    .eq("class_id", scope.class_id)
    .eq("subject_id", scope.subject_id)
    .eq("assessment", assessment)
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
  redirect(`${back}&ok=1`);
}