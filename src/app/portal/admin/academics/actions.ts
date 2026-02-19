"use server";

import { z } from "zod";
import { requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

const sb = () => supabaseAdmin();

// -------------------- TERMS --------------------

export async function upsertTerm(formData: FormData): Promise<void> {
  await requireRole(["admin"]);

  const Schema = z.object({
    id: z.string().optional(),
    name: z.string().min(2).max(120),
    starts_on: z.string().min(10).max(10),
    ends_on: z.string().min(10).max(10),
    is_active: z.coerce.boolean().default(false),
  });

  const parsed = Schema.safeParse({
    id: formData.get("id") ? String(formData.get("id")) : undefined,
    name: String(formData.get("name") ?? ""),
    starts_on: String(formData.get("starts_on") ?? ""),
    ends_on: String(formData.get("ends_on") ?? ""),
    is_active: formData.get("is_active") ? true : false,
  });

  if (!parsed.success) return;

  if (parsed.data.is_active) {
    const { error: deactErr } = await sb()
      .from("academic_terms")
      .update({ is_active: false })
      .neq("id", -1);

    if (deactErr) return;
  }

  const payload = {
    name: parsed.data.name,
    starts_on: parsed.data.starts_on,
    ends_on: parsed.data.ends_on,
    is_active: parsed.data.is_active,
  };

  if (parsed.data.id) {
    const { error } = await sb()
      .from("academic_terms")
      .update(payload)
      .eq("id", Number(parsed.data.id));

    if (error) return;
  } else {
    const { error } = await sb().from("academic_terms").insert(payload);
    if (error) return;
  }

  revalidatePath("/portal/admin/academics");
}

export async function deleteTerm(formData: FormData): Promise<void> {
  await requireRole(["admin"]);
  const id = Number(formData.get("id"));
  if (!id) return;

  // Soft delete instead of hard delete
  const { error } = await sb()
    .from("academic_terms")
    .update({ is_active: false })
    .eq("id", id);

  if (error) return;

  revalidatePath("/portal/admin/academics");
}

// -------------------- CLASSES --------------------

export async function upsertClass(formData: FormData): Promise<void> {
  await requireRole(["admin"]);

  const Schema = z.object({
    id: z.string().optional(),
    name: z.string().min(2).max(40),
    level: z.string().min(1).max(10),
    track_key: z.enum(["secular", "islamic"]).default("secular"),
    is_active: z.coerce.boolean().default(true),
  });

  const parsed = Schema.safeParse({
    id: formData.get("id") ? String(formData.get("id")) : undefined,
    name: String(formData.get("name") ?? ""),
    level: String(formData.get("level") ?? ""),
    track_key: String(formData.get("track_key") ?? "secular"),
    is_active: formData.get("is_active") ? true : false,
  });

  if (!parsed.success) return;

  const payload = {
    name: parsed.data.name,
    level: parsed.data.level,
    track_key: parsed.data.track_key,
    is_active: parsed.data.is_active,
  };

  if (parsed.data.id) {
    const { error } = await sb()
      .from("class_groups")
      .update(payload)
      .eq("id", Number(parsed.data.id));
    if (error) return;
  } else {
    const { error } = await sb().from("class_groups").insert(payload);
    if (error) return;
  }

  revalidatePath("/portal/admin/academics");
}

export async function deleteClass(formData: FormData): Promise<void> {
  await requireRole(["admin"]);
  const id = Number(formData.get("id"));
  if (!id) return;

  // Soft delete instead of hard delete
  const { error } = await sb()
    .from("class_groups")
    .update({ is_active: false })
    .eq("id", id);

  if (error) return;

  revalidatePath("/portal/admin/academics");
}

// -------------------- SUBJECTS --------------------

export async function upsertSubject(formData: FormData): Promise<void> {
  await requireRole(["admin"]);

  const Schema = z.object({
    id: z.string().optional(),
    code: z.string().max(20).optional().nullable(),
    name: z.string().min(2).max(120),
    track: z.enum(["secular", "islamic"]).default("secular"),
    is_active: z.coerce.boolean().default(true),
  });

  const parsed = Schema.safeParse({
    id: formData.get("id") ? String(formData.get("id")) : undefined,
    code: formData.get("code") ? String(formData.get("code")) : null,
    name: String(formData.get("name") ?? ""),
    track: String(formData.get("track") ?? "secular"),
    is_active: formData.get("is_active") ? true : false,
  });

  if (!parsed.success) return;

  const payload: any = {
    code: parsed.data.code || null,
    name: parsed.data.name,
    track: parsed.data.track,
    is_active: parsed.data.is_active,
  };

  if (parsed.data.id) {
    const { error } = await sb()
      .from("subjects")
      .update(payload)
      .eq("id", Number(parsed.data.id));
    if (error) return;
  } else {
    const { error } = await sb().from("subjects").insert(payload);
    if (error) return;
  }

  revalidatePath("/portal/admin/academics");
}

export async function deleteSubject(formData: FormData): Promise<void> {
  await requireRole(["admin"]);
  const id = Number(formData.get("id"));
  if (!id) return;

  // Soft delete
  const { error } = await sb()
    .from("subjects")
    .update({ is_active: false })
    .eq("id", id);

  if (error) return;

  revalidatePath("/portal/admin/academics");
}

// -------------------- TEACHER ASSIGNMENTS --------------------

export async function createAssignment(fd: FormData): Promise<void> {
  await requireRole(["admin"]);

  const Schema = z.object({
    term_id: z.coerce.number().int(),
    class_id: z.coerce.number().int(),
    subject_id: z.coerce.number().int(),
    teacher_id: z.string().uuid(),
  });

  const parsed = Schema.safeParse({
    term_id: fd.get("term_id"),
    class_id: fd.get("class_id"),
    subject_id: fd.get("subject_id"),
    teacher_id: fd.get("teacher_id"),
  });

  if (!parsed.success) return;

  const { error } = await sb().from("teacher_assignments").insert(parsed.data);
  if (error) return;

  revalidatePath("/portal/admin/academics");
}

export async function deleteAssignment(fd: FormData): Promise<void> {
  await requireRole(["admin"]);
  const id = Number(fd.get("id"));
  if (!id) return;

  const { error } = await sb().from("teacher_assignments").delete().eq("id", id);
  if (error) return;

  revalidatePath("/portal/admin/academics");
}

// -------------------- STUDENT ENROLLMENTS --------------------

export async function addEnrollment(formData: FormData): Promise<void> {
  await requireRole(["admin"]);

  const student_id = String(formData.get("student_id")); // UUID
  const class_id = Number(formData.get("class_id")); // bigint
  const term_id = Number(formData.get("term_id")); // bigint

  if (!student_id || !class_id || !term_id) return;

  // Check foreign keys
  const { data: student } = await sb()
    .from("students")
    .select("id")
    .eq("id", student_id)
    .eq("is_active", true)
    .single();

  if (!student) return;

  const { data: classRow } = await sb()
    .from("class_groups")
    .select("id")
    .eq("id", class_id)
    .eq("is_active", true)
    .single();

  if (!classRow) return;

  const { data: term } = await sb()
    .from("academic_terms")
    .select("id")
    .eq("id", term_id)
    // NOTE: your original logic checks is_active=true; keep it:
    .eq("is_active", true)
    .single();

  if (!term) return;

  const { error } = await sb().from("enrollments").insert({
    student_id,
    class_id,
    term_id,
  });

  if (error) return;

  revalidatePath("/portal/admin/academics?tab=enrollments");
}

export async function deleteEnrollment(fd: FormData): Promise<void> {
  await requireRole(["admin"]);
  const id = Number(fd.get("id"));
  if (!id) return;

  const { error } = await sb().from("enrollments").delete().eq("id", id);
  if (error) return;

  revalidatePath("/portal/admin/academics?tab=enrollments");
}
