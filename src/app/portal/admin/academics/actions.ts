"use server";

import { z } from "zod";
import { requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

  const student_id = String(formData.get("student_id") ?? "");
  const class_id = Number(formData.get("class_id"));
  const term_id = Number(formData.get("term_id"));

  const backUrl = `/portal/admin/academics?tab=enrollments&termId=${term_id}&classId=${class_id}`;

  if (!student_id || !class_id || !term_id) {
    redirect(`${backUrl}&err=${encodeURIComponent("Missing student, class, or term.")}`);
  }

  // Validate student/class/term (keep your checks if you want)
  // NOTE: If you want to enroll into inactive terms, remove is_active=true
  const { data: term, error: termErr } = await sb()
    .from("academic_terms")
    .select("id")
    .eq("id", term_id)
    .eq("is_active", true)
    .single();
  if (termErr || !term) redirect(`${backUrl}&err=${encodeURIComponent(termErr?.message ?? "Term not active.")}`);

  // Does an enrollment already exist for this student+term?
  const { data: existing, error: existingErr } = await sb()
    .from("enrollments")
    .select("id, class_id")
    .eq("student_id", student_id)
    .eq("term_id", term_id)
    .maybeSingle();

  if (existingErr) {
    redirect(`${backUrl}&err=${encodeURIComponent(existingErr.message)}`);
  }

  if (existing) {
    // Move student to the selected class for this term
    const { error: updErr } = await sb()
      .from("enrollments")
      .update({ class_id })
      .eq("id", existing.id);

    if (updErr) redirect(`${backUrl}&err=${encodeURIComponent(updErr.message)}`);

    revalidatePath("/portal/admin/academics");
    redirect(`${backUrl}&ok=1`);
  }

  // Otherwise create new enrollment
  const { error } = await sb().from("enrollments").insert({
    student_id,
    class_id,
    term_id,
  });

  if (error) redirect(`${backUrl}&err=${encodeURIComponent(error.message)}`);

  revalidatePath("/portal/admin/academics");
  redirect(`${backUrl}&ok=1`);
}

export async function deleteEnrollment(fd: FormData): Promise<void> {
  await requireRole(["admin"]);

  const id = Number(fd.get("id"));
  const term_id = Number(fd.get("term_id"));
  const class_id = Number(fd.get("class_id"));

  const backUrl = `/portal/admin/academics?tab=enrollments&termId=${term_id}&classId=${class_id}`;

  if (!id) redirect(`${backUrl}&err=${encodeURIComponent("Missing enrollment id.")}`);

  const { error } = await sb().from("enrollments").delete().eq("id", id);
  if (error) redirect(`${backUrl}&err=${encodeURIComponent(error.message)}`);

  revalidatePath("/portal/admin/academics");
  redirect(`${backUrl}&ok=1`);
}