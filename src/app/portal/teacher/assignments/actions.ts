"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";

const sb = () => supabaseAdmin();

async function assertTeachingScope(teacherId: string, assignmentId: number) {
  const { data, error } = await sb()
    .from("teacher_assignments")
    .select("id, term_id, class_id, subject_id, teacher_id")
    .eq("id", assignmentId)
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
    attachment_url: z.string().url().optional().or(z.literal("")),
  });

  const parsed = Schema.safeParse({
    teacher_assignment_id: formData.get("teacher_assignment_id"),
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    due_at: String(formData.get("due_at") ?? ""),
    attachment_url: String(formData.get("attachment_url") ?? ""),
  });

  const fallbackId = Number(formData.get("teacher_assignment_id") ?? 0);
  const back = `/portal/teacher/assignments${fallbackId ? `?assignmentId=${fallbackId}` : ""}`;

  if (!parsed.success) {
    redirect(`${back}&err=${encodeURIComponent("Please fill in all required fields correctly.")}`);
  }

  const scope = await assertTeachingScope(me.id, parsed.data.teacher_assignment_id);

  const { error } = await sb().from("assignments").insert({
    class_id: scope.class_id,
    subject_id: scope.subject_id,
    term_id: scope.term_id,
    title: parsed.data.title,
    description: parsed.data.description,
    due_at: parsed.data.due_at,
    attachment_url: parsed.data.attachment_url || null,
    created_by: me.id,
  });

  if (error) {
    redirect(`${back}&err=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/portal/teacher/assignments");
  redirect(`${back}&ok=1`);
}

export async function deleteTeacherAssignmentItem(formData: FormData): Promise<void> {
  const me = await requireRole(["teacher"]);

  const id = Number(formData.get("id"));
  const teacherAssignmentId = Number(formData.get("teacher_assignment_id") ?? 0);

  const back = `/portal/teacher/assignments${teacherAssignmentId ? `?assignmentId=${teacherAssignmentId}` : ""}`;

  if (!id) {
    redirect(`${back}&err=${encodeURIComponent("Missing assignment id.")}`);
  }

  const { data: existing, error: findErr } = await sb()
    .from("assignments")
    .select("id, created_by")
    .eq("id", id)
    .maybeSingle();

  if (findErr) {
    redirect(`${back}&err=${encodeURIComponent(findErr.message)}`);
  }

  if (!existing || existing.created_by !== me.id) {
    redirect(`${back}&err=${encodeURIComponent("You cannot delete this assignment.")}`);
  }

  const { error } = await sb().from("assignments").delete().eq("id", id);
  if (error) {
    redirect(`${back}&err=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/portal/teacher/assignments");
  redirect(`${back}&ok=1`);
}