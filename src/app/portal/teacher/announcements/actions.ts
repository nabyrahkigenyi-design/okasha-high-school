"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";

const sb = () => supabaseAdmin();

async function assertTeacherScope(teacherId: string, teacherAssignmentId: number) {
  const { data, error } = await sb()
    .from("teacher_assignments")
    .select("id, teacher_id, term_id, class_id")
    .eq("id", teacherAssignmentId)
    .eq("teacher_id", teacherId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden");
  return data;
}

export async function createTeacherAnnouncement(fd: FormData) {
  const me = await requireRole(["teacher"]);

  const Schema = z.object({
    teacher_assignment_id: z.coerce.number().int().positive(),
    title: z.string().min(2).max(160),
    body: z.string().min(2).max(5000),
  });

  const parsed = Schema.safeParse({
    teacher_assignment_id: fd.get("teacher_assignment_id"),
    title: String(fd.get("title") ?? ""),
    body: String(fd.get("body") ?? ""),
  });

  const scopeId = Number(fd.get("teacher_assignment_id") ?? 0);
  const back = `/portal/teacher/announcements${scopeId ? `?scope=${scopeId}` : ""}`;

  if (!parsed.success) {
    redirect(`${back}&err=${encodeURIComponent("Please fill in title and message.")}`);
  }

  const scope = await assertTeacherScope(me.id, parsed.data.teacher_assignment_id);

  const { error } = await sb().from("announcements").insert({
    title: parsed.data.title,
    body: parsed.data.body,
    term_id: scope.term_id,
    class_id: scope.class_id, // teacher announcements are class-specific
    created_by: me.id,
  });

  if (error) redirect(`${back}&err=${encodeURIComponent(error.message)}`);

  revalidatePath("/portal/teacher/announcements");
  redirect(`${back}&ok=1`);
}

export async function deleteTeacherAnnouncement(fd: FormData) {
  const me = await requireRole(["teacher"]);
  const id = Number(fd.get("id") ?? 0);
  const scopeId = Number(fd.get("scope") ?? 0);

  const back = `/portal/teacher/announcements${scopeId ? `?scope=${scopeId}` : ""}`;
  if (!id) redirect(`${back}&err=${encodeURIComponent("Missing announcement id.")}`);

  // ensure the teacher owns it
  const { data, error: findErr } = await sb()
    .from("announcements")
    .select("id, created_by")
    .eq("id", id)
    .maybeSingle();

  if (findErr) redirect(`${back}&err=${encodeURIComponent(findErr.message)}`);
  if (!data || data.created_by !== me.id) redirect(`${back}&err=${encodeURIComponent("Forbidden")}`);

  const { error } = await sb().from("announcements").delete().eq("id", id);
  if (error) redirect(`${back}&err=${encodeURIComponent(error.message)}`);

  revalidatePath("/portal/teacher/announcements");
  redirect(`${back}&ok=1`);
}