"use server";

import { z } from "zod";
import { requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const sb = () => supabaseAdmin();

function enc(s: string) {
  return encodeURIComponent(s);
}

export async function addParentStudentLink(fd: FormData) {
  await requireRole(["admin"]);

  const Schema = z.object({
    parent_id: z.string().uuid(),
    student_id: z.string().uuid(),
    relation: z.string().trim().max(80).optional().or(z.literal("")),
    back_to_student: z.string().optional().or(z.literal("")),
  });

  const parsed = Schema.safeParse({
    parent_id: String(fd.get("parent_id") ?? ""),
    student_id: String(fd.get("student_id") ?? ""),
    relation: String(fd.get("relation") ?? "").trim(),
    back_to_student: String(fd.get("back_to_student") ?? ""),
  });

  const parentId = String(fd.get("parent_id") ?? "");
  const studentId = String(fd.get("student_id") ?? "");
  const backToStudent = String(fd.get("back_to_student") ?? "");

  const back = backToStudent
    ? `/portal/admin/students/${encodeURIComponent(studentId)}`
    : `/portal/admin/parent-links?parentId=${encodeURIComponent(parentId)}`;

  if (!parsed.success) {
    redirect(`${back}?err=${enc("Missing or invalid parent/student id.")}`);
  }

  const payload: {
    parent_id: string;
    student_id: string;
    relation?: string | null;
  } = {
    parent_id: parsed.data.parent_id,
    student_id: parsed.data.student_id,
  };

  if (parsed.data.relation) {
    payload.relation = parsed.data.relation;
  }

  const { error } = await sb().from("parent_students").insert(payload);

  if (error) {
    redirect(`${back}?err=${enc(error.message)}`);
  }

  revalidatePath("/portal/admin/parent-links");
  revalidatePath(`/portal/admin/students/${parsed.data.student_id}`);
  redirect(`${back}?ok=1`);
}

export async function removeParentStudentLink(fd: FormData) {
  await requireRole(["admin"]);

  const parent_id = String(fd.get("parent_id") ?? "");
  const student_id = String(fd.get("student_id") ?? "");
  const back_to_student = String(fd.get("back_to_student") ?? "");

  const back = back_to_student
    ? `/portal/admin/students/${encodeURIComponent(student_id)}`
    : `/portal/admin/parent-links?parentId=${encodeURIComponent(parent_id)}`;

  if (!parent_id || !student_id) {
    redirect(`${back}?err=${enc("Missing ids.")}`);
  }

  const { error } = await sb()
    .from("parent_students")
    .delete()
    .eq("parent_id", parent_id)
    .eq("student_id", student_id);

  if (error) {
    redirect(`${back}?err=${enc(error.message)}`);
  }

  revalidatePath("/portal/admin/parent-links");
  revalidatePath(`/portal/admin/students/${student_id}`);
  redirect(`${back}?ok=1`);
}