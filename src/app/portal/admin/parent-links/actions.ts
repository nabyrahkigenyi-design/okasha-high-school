"use server";

import { z } from "zod";
import { requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const sb = () => supabaseAdmin();

export async function addParentStudentLink(fd: FormData) {
  await requireRole(["admin"]);

  const Schema = z.object({
    parent_id: z.string().uuid(),
    student_id: z.string().uuid(),
  });

  const parsed = Schema.safeParse({
    parent_id: String(fd.get("parent_id") ?? ""),
    student_id: String(fd.get("student_id") ?? ""),
  });

  const back = `/portal/admin/parent-links?parentId=${encodeURIComponent(String(fd.get("parent_id") ?? ""))}`;

  if (!parsed.success) redirect(`${back}&err=${encodeURIComponent("Missing or invalid parent/student id.")}`);

  const { error } = await sb().from("parent_students").insert({
    parent_id: parsed.data.parent_id,
    student_id: parsed.data.student_id,
  });

  if (error) redirect(`${back}&err=${encodeURIComponent(error.message)}`);

  revalidatePath("/portal/admin/parent-links");
  redirect(`${back}&ok=1`);
}

export async function removeParentStudentLink(fd: FormData) {
  await requireRole(["admin"]);

  const parent_id = String(fd.get("parent_id") ?? "");
  const student_id = String(fd.get("student_id") ?? "");

  const back = `/portal/admin/parent-links?parentId=${encodeURIComponent(parent_id)}`;

  if (!parent_id || !student_id) redirect(`${back}&err=${encodeURIComponent("Missing ids.")}`);

  const { error } = await sb()
    .from("parent_students")
    .delete()
    .eq("parent_id", parent_id)
    .eq("student_id", student_id);

  if (error) redirect(`${back}&err=${encodeURIComponent(error.message)}`);

  revalidatePath("/portal/admin/parent-links");
  redirect(`${back}&ok=1`);
}