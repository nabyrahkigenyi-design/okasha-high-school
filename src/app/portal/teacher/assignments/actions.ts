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

export async function createTeacherAssignment(formData: FormData): Promise<void> {
  const me = await requireRole(["teacher"]);

  const Schema = z.object({
    teacher_assignment_id: z.coerce.number().int().positive(),
    title: z.string().min(2).max(200),
    description: z.string().min(1).max(5000),
    due_at: z.string().min(1),
    attachment_url: z.string().optional(),
  });

  const parsed = Schema.safeParse({
    teacher_assignment_id: formData.get("teacher_assignment_id"),
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    due_at: String(formData.get("due_at") ?? ""),
    attachment_url: String(formData.get("attachment_url") ?? ""),
  });

  const scopeId = Number(formData.get("teacher_assignment_id") ?? 0);
  const back = `/portal/teacher/assignments${scopeId ? `?assignmentId=${scopeId}` : ""}`;

  if (!parsed.success) {
    redirect(`${back}&err=${encodeURIComponent("Invalid assignment fields.")}`);
  }

  const scope = await getOwnedScope(me.id, parsed.data.teacher_assignment_id);

  const cleanedAttachment =
    parsed.data.attachment_url && parsed.data.attachment_url.trim()
      ? parsed.data.attachment_url.trim()
      : null;

  const payload = {
    class_id: scope.class_id,
    subject_id: scope.subject_id,
    term_id: scope.term_id,
    title: parsed.data.title,
    description: parsed.data.description,
    due_at: parsed.data.due_at,
    attachment_url: cleanedAttachment,
    created_by: me.id,
  };

  const { error } = await sb().from("assignments").insert(payload);
  if (error) redirect(`${back}&err=${encodeURIComponent(error.message)}`);

  revalidatePath("/portal/teacher/assignments");
  revalidatePath("/portal/student/assignments");
  redirect(`${back}&ok=1`);
}

export async function deleteTeacherAssignmentItem(formData: FormData): Promise<void> {
  const me = await requireRole(["teacher"]);

  const id = Number(formData.get("id") ?? 0);
  const teacherAssignmentId = Number(formData.get("teacher_assignment_id") ?? 0);
  const back = `/portal/teacher/assignments${teacherAssignmentId ? `?assignmentId=${teacherAssignmentId}` : ""}`;

  if (!id) redirect(`${back}&err=${encodeURIComponent("Missing assignment id.")}`);

  const { data: row, error: findErr } = await sb()
    .from("assignments")
    .select("id, created_by")
    .eq("id", id)
    .maybeSingle();

  if (findErr) redirect(`${back}&err=${encodeURIComponent(findErr.message)}`);
  if (!row || row.created_by !== me.id) redirect(`${back}&err=${encodeURIComponent("Forbidden")}`);

  const { error } = await sb().from("assignments").delete().eq("id", id);
  if (error) redirect(`${back}&err=${encodeURIComponent(error.message)}`);

  revalidatePath("/portal/teacher/assignments");
  revalidatePath("/portal/student/assignments");
  redirect(`${back}&ok=1`);
}