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

    if (deactErr) redirect(`/portal/admin/academics?tab=terms&err=${encodeURIComponent(deactErr.message)}`);
  }

  const payload = {
    name: parsed.data.name,
    starts_on: parsed.data.starts_on,
    ends_on: parsed.data.ends_on,
    is_active: parsed.data.is_active,
  };

  if (parsed.data.id) {
    const { error } = await sb().from("academic_terms").update(payload).eq("id", Number(parsed.data.id));
    if (error) redirect(`/portal/admin/academics?tab=terms&err=${encodeURIComponent(error.message)}`);
  } else {
    const { error } = await sb().from("academic_terms").insert(payload);
    if (error) redirect(`/portal/admin/academics?tab=terms&err=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/portal/admin/academics");
  redirect("/portal/admin/academics?tab=terms&ok=1");
}

export async function setActiveTerm(fd: FormData): Promise<void> {
  await requireRole(["admin"]);
  const id = Number(fd.get("id"));
  if (!id) return;

  const { error: deactErr } = await sb()
    .from("academic_terms")
    .update({ is_active: false })
    .neq("id", -1);

  if (deactErr) redirect(`/portal/admin/academics?tab=terms&err=${encodeURIComponent(deactErr.message)}`);

  const { error } = await sb().from("academic_terms").update({ is_active: true }).eq("id", id);
  if (error) redirect(`/portal/admin/academics?tab=terms&err=${encodeURIComponent(error.message)}`);

  revalidatePath("/portal/admin/academics");
  redirect("/portal/admin/academics?tab=terms&ok=1");
}

export async function promoteStudentsToActiveTerm(): Promise<void> {
  await requireRole(["admin"]);

  const supabase = sb();

  const { data: activeTerm, error: activeTermError } = await supabase
    .from("academic_terms")
    .select("id, name")
    .eq("is_active", true)
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (activeTermError) {
    redirect(`/portal/admin/academics?tab=terms&err=${encodeURIComponent(activeTermError.message)}`);
  }

  if (!activeTerm) {
    redirect(`/portal/admin/academics?tab=terms&err=${encodeURIComponent("No active term found.")}`);
  }

  const { data: previousTerm, error: previousTermError } = await supabase
    .from("academic_terms")
    .select("id, name")
    .neq("id", activeTerm.id)
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (previousTermError) {
    redirect(`/portal/admin/academics?tab=terms&err=${encodeURIComponent(previousTermError.message)}`);
  }

  if (!previousTerm) {
    redirect(`/portal/admin/academics?tab=terms&err=${encodeURIComponent("No previous term found to promote from.")}`);
  }

  const { data: sourceEnrollments, error: sourceError } = await supabase
    .from("enrollments")
    .select(`
      id,
      student_id,
      class_id,
      students:student_id (
        id,
        full_name,
        status,
        is_active
      ),
      class_groups:class_id (
        id,
        name,
        level,
        school_level,
        stream,
        track_key,
        is_active
      )
    `)
    .eq("term_id", previousTerm.id);

  if (sourceError) {
    redirect(`/portal/admin/academics?tab=terms&err=${encodeURIComponent(sourceError.message)}`);
  }

  const { data: classes, error: classesError } = await supabase
    .from("class_groups")
    .select("id, name, level, school_level, stream, track_key, is_active")
    .eq("is_active", true);

  if (classesError) {
    redirect(`/portal/admin/academics?tab=terms&err=${encodeURIComponent(classesError.message)}`);
  }

  const targetClassMap = new Map<string, number>();

  for (const cls of classes ?? []) {
    const levelRes = await supabase.rpc("next_class_level", { p_level: cls.level });
    const normalizedCurrent = String(cls.level ?? "").trim().toUpperCase();

    if (levelRes.error) {
      redirect(`/portal/admin/academics?tab=terms&err=${encodeURIComponent(levelRes.error.message)}`);
    }

    // We actually need map by current class -> next class, so build from classes directly below
    // handled later
    void normalizedCurrent;
  }

  for (const fromClass of classes ?? []) {
    const nextLevelRes = await supabase.rpc("next_class_level", { p_level: fromClass.level });

    if (nextLevelRes.error) {
      redirect(`/portal/admin/academics?tab=terms&err=${encodeURIComponent(nextLevelRes.error.message)}`);
    }

    const nextLevel = String(nextLevelRes.data ?? "").trim().toUpperCase();
    if (!nextLevel) continue;

    const target = (classes ?? []).find(
      (candidate: any) =>
        String(candidate.level ?? "").trim().toUpperCase() === nextLevel &&
        String(candidate.stream ?? "") === String(fromClass.stream ?? "") &&
        String(candidate.track_key ?? "") === String(fromClass.track_key ?? "")
    );

    if (target?.id) {
      targetClassMap.set(String(fromClass.id), target.id);
    }
  }

  let promoted = 0;
  let carried = 0;
  let skipped = 0;

  for (const row of sourceEnrollments ?? []) {
    const student: any = row.students;
    const oldClass: any = row.class_groups;

    if (!student?.id || !oldClass?.id) {
      skipped += 1;
      continue;
    }

    const status = String(student.status ?? "").toLowerCase().trim();

    if (status === "withdrawn" || status === "graduated" || student.is_active === false) {
      skipped += 1;
      continue;
    }

    const level = String(oldClass.level ?? "").trim().toUpperCase();

    // manual transition classes
    if (level === "P7" || level === "S4" || level === "S6") {
      skipped += 1;
      continue;
    }

    const targetClassId = targetClassMap.get(String(oldClass.id));

    if (!targetClassId) {
      // no next class match found, skip for manual handling
      skipped += 1;
      continue;
    }

    const { data: existing, error: existingError } = await supabase
      .from("enrollments")
      .select("id")
      .eq("student_id", student.id)
      .eq("term_id", activeTerm.id)
      .maybeSingle();

    if (existingError) {
      redirect(`/portal/admin/academics?tab=terms&err=${encodeURIComponent(existingError.message)}`);
    }

    if (existing?.id) {
      const { error: updateError } = await supabase
        .from("enrollments")
        .update({ class_id: targetClassId })
        .eq("id", existing.id);

      if (updateError) {
        redirect(`/portal/admin/academics?tab=terms&err=${encodeURIComponent(updateError.message)}`);
      }

      promoted += 1;
    } else {
      const { error: insertError } = await supabase
        .from("enrollments")
        .insert({
          student_id: student.id,
          class_id: targetClassId,
          term_id: activeTerm.id,
        });

      if (insertError) {
        redirect(`/portal/admin/academics?tab=terms&err=${encodeURIComponent(insertError.message)}`);
      }

      promoted += 1;
    }

    const targetClass = (classes ?? []).find((c: any) => c.id === targetClassId);

    if (targetClass) {
      const schoolLevel = String(targetClass.school_level ?? "").trim() || null;
      const classLevel = targetClass.level ?? null;
      const stream = targetClass.stream ?? null;
      const track = targetClass.track_key ?? null;

      const { error: studentUpdateError } = await supabase
        .from("students")
        .update({
          school_level: schoolLevel,
          class_level: classLevel,
          stream,
          track,
          updated_at: new Date().toISOString(),
        })
        .eq("id", student.id);

      if (studentUpdateError) {
        redirect(`/portal/admin/academics?tab=terms&err=${encodeURIComponent(studentUpdateError.message)}`);
      }

      carried += 1;
    }
  }

  revalidatePath("/portal/admin/academics");
  revalidatePath("/portal/admin/students");
  revalidatePath("/portal/student/dashboard");
  revalidatePath("/portal/student/attendance");
  revalidatePath("/portal/student/grades");
  revalidatePath("/portal/student/timetable");
  revalidatePath("/portal/student/assignments");
  revalidatePath("/portal/student/announcements");

  redirect(
    `/portal/admin/academics?tab=terms&ok=${encodeURIComponent(
      `Promotion complete. Promoted ${promoted}, synced ${carried}, skipped ${skipped}.`
    )}`
  );
}

export async function deleteTerm(formData: FormData): Promise<void> {
  await requireRole(["admin"]);
  const id = Number(formData.get("id"));
  if (!id) return;

  const { error: delErr } = await sb().from("academic_terms").delete().eq("id", id);

  if (delErr) {
    const { error: archErr } = await sb().from("academic_terms").update({ is_active: false }).eq("id", id);

    revalidatePath("/portal/admin/academics");

    const msg = archErr
      ? `Failed to delete term: ${delErr.message}. Also failed to archive: ${archErr.message}`
      : `Term is in use and cannot be deleted. Archived instead. (${delErr.message})`;

    redirect(`/portal/admin/academics?tab=terms&err=${encodeURIComponent(msg)}`);
  }

  revalidatePath("/portal/admin/academics");
  redirect("/portal/admin/academics?tab=terms&ok=1");
}

// -------------------- CLASSES --------------------

export async function upsertClass(formData: FormData): Promise<void> {
  await requireRole(["admin"]);

  const Schema = z.object({
    id: z.string().optional(),
    name: z.string().min(2).max(80),
    level: z.string().min(1).max(20),
    school_level: z.enum(["primary", "o-level", "a-level"]),
    stream: z.string().max(40).optional().nullable(),
    track_key: z.enum(["secular", "islamic"]).default("secular"),
    is_active: z.coerce.boolean().default(true),
  });

  const parsed = Schema.safeParse({
    id: formData.get("id") ? String(formData.get("id")) : undefined,
    name: String(formData.get("name") ?? ""),
    level: String(formData.get("level") ?? ""),
    school_level: String(formData.get("school_level") ?? "o-level"),
    stream: formData.get("stream") ? String(formData.get("stream")) : null,
    track_key: String(formData.get("track_key") ?? "secular"),
    is_active: formData.get("is_active") ? true : false,
  });

  if (!parsed.success) return;

  const payload = {
    name: parsed.data.name,
    level: parsed.data.level.trim().toUpperCase(),
    school_level: parsed.data.school_level,
    stream: parsed.data.stream || null,
    track_key: parsed.data.track_key,
    is_active: parsed.data.is_active,
  };

  if (parsed.data.id) {
    const { error } = await sb().from("class_groups").update(payload).eq("id", Number(parsed.data.id));
    if (error) redirect(`/portal/admin/academics?tab=classes&err=${encodeURIComponent(error.message)}`);
  } else {
    const { error } = await sb().from("class_groups").insert(payload);
    if (error) redirect(`/portal/admin/academics?tab=classes&err=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/portal/admin/academics");
  redirect("/portal/admin/academics?tab=classes&ok=1");
}

export async function setClassActive(fd: FormData): Promise<void> {
  await requireRole(["admin"]);
  const id = Number(fd.get("id"));
  const is_active = String(fd.get("is_active")) === "true";
  if (!id) return;

  const { error } = await sb().from("class_groups").update({ is_active }).eq("id", id);
  if (error) redirect(`/portal/admin/academics?tab=classes&err=${encodeURIComponent(error.message)}`);

  revalidatePath("/portal/admin/academics");
  redirect("/portal/admin/academics?tab=classes&ok=1");
}

export async function deleteClass(formData: FormData): Promise<void> {
  await requireRole(["admin"]);
  const id = Number(formData.get("id"));
  if (!id) return;

  const { error: delErr } = await sb().from("class_groups").delete().eq("id", id);

  if (delErr) {
    const { error: archErr } = await sb().from("class_groups").update({ is_active: false }).eq("id", id);

    revalidatePath("/portal/admin/academics");

    const msg = archErr
      ? `Failed to delete class: ${delErr.message}. Also failed to archive: ${archErr.message}`
      : `Class is in use and cannot be deleted. Archived instead. (${delErr.message})`;

    redirect(`/portal/admin/academics?tab=classes&err=${encodeURIComponent(msg)}`);
  }

  revalidatePath("/portal/admin/academics");
  redirect("/portal/admin/academics?tab=classes&ok=1");
}

// -------------------- SUBJECTS --------------------

export async function upsertSubject(formData: FormData): Promise<void> {
  await requireRole(["admin"]);

  const Schema = z.object({
    id: z.string().optional(),
    code: z.string().max(20).optional().nullable(),
    name: z.string().min(2).max(120),
    track: z.enum(["secular", "islamic"]).default("secular"),
    school_level: z.enum(["primary", "o-level", "a-level"]),
    subject_category: z.string().max(60).optional().nullable(),
    is_active: z.coerce.boolean().default(true),
  });

  const parsed = Schema.safeParse({
    id: formData.get("id") ? String(formData.get("id")) : undefined,
    code: formData.get("code") ? String(formData.get("code")) : null,
    name: String(formData.get("name") ?? ""),
    track: String(formData.get("track") ?? "secular"),
    school_level: String(formData.get("school_level") ?? "o-level"),
    subject_category: formData.get("subject_category") ? String(formData.get("subject_category")) : null,
    is_active: formData.get("is_active") ? true : false,
  });

  if (!parsed.success) return;

  const payload = {
    code: parsed.data.code || null,
    name: parsed.data.name,
    track: parsed.data.track,
    school_level: parsed.data.school_level,
    subject_category: parsed.data.subject_category || null,
    is_active: parsed.data.is_active,
  };

  if (parsed.data.id) {
    const { error } = await sb().from("subjects").update(payload).eq("id", Number(parsed.data.id));
    if (error) redirect(`/portal/admin/academics?tab=subjects&err=${encodeURIComponent(error.message)}`);

    revalidatePath("/portal/admin/academics");
    redirect("/portal/admin/academics?tab=subjects&ok=1");
  }

  if (payload.code) {
    const { data: existing, error: findErr } = await sb()
      .from("subjects")
      .select("id")
      .eq("code", payload.code)
      .maybeSingle();

    if (findErr) redirect(`/portal/admin/academics?tab=subjects&err=${encodeURIComponent(findErr.message)}`);

    if (existing?.id) {
      const { error: updErr } = await sb().from("subjects").update({ ...payload, is_active: true }).eq("id", existing.id);
      if (updErr) redirect(`/portal/admin/academics?tab=subjects&err=${encodeURIComponent(updErr.message)}`);

      revalidatePath("/portal/admin/academics");
      redirect("/portal/admin/academics?tab=subjects&ok=1");
    }
  }

  const { error } = await sb().from("subjects").insert(payload);
  if (error) redirect(`/portal/admin/academics?tab=subjects&err=${encodeURIComponent(error.message)}`);

  revalidatePath("/portal/admin/academics");
  redirect("/portal/admin/academics?tab=subjects&ok=1");
}

export async function setSubjectActive(fd: FormData): Promise<void> {
  await requireRole(["admin"]);
  const id = Number(fd.get("id"));
  const is_active = String(fd.get("is_active")) === "true";
  if (!id) return;

  const { error } = await sb().from("subjects").update({ is_active }).eq("id", id);
  if (error) redirect(`/portal/admin/academics?tab=subjects&err=${encodeURIComponent(error.message)}`);

  revalidatePath("/portal/admin/academics");
  redirect("/portal/admin/academics?tab=subjects&ok=1");
}

export async function deleteSubject(formData: FormData): Promise<void> {
  await requireRole(["admin"]);
  const id = Number(formData.get("id"));
  if (!id) return;

  const { error: delErr } = await sb().from("subjects").delete().eq("id", id);

  if (delErr) {
    const { error: archErr } = await sb().from("subjects").update({ is_active: false }).eq("id", id);

    revalidatePath("/portal/admin/academics");

    const msg = archErr
      ? `Failed to delete subject: ${delErr.message}. Also failed to archive: ${archErr.message}`
      : `Subject is in use and cannot be deleted. Archived instead. (${delErr.message})`;

    redirect(`/portal/admin/academics?tab=subjects&err=${encodeURIComponent(msg)}`);
  }

  revalidatePath("/portal/admin/academics");
  redirect("/portal/admin/academics?tab=subjects&ok=1");
}

// -------------------- SUBJECT TEACHER ASSIGNMENTS --------------------

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
  if (error) redirect(`/portal/admin/academics?tab=assignments&err=${encodeURIComponent(error.message)}`);

  revalidatePath("/portal/admin/academics");
  redirect("/portal/admin/academics?tab=assignments&ok=1");
}

export async function deleteAssignment(fd: FormData): Promise<void> {
  await requireRole(["admin"]);
  const id = Number(fd.get("id"));
  if (!id) return;

  const { error } = await sb().from("teacher_assignments").delete().eq("id", id);
  if (error) redirect(`/portal/admin/academics?tab=assignments&err=${encodeURIComponent(error.message)}`);

  revalidatePath("/portal/admin/academics");
  redirect("/portal/admin/academics?tab=assignments&ok=1");
}

// -------------------- CLASS TEACHERS --------------------

export async function upsertClassTeacher(fd: FormData): Promise<void> {
  await requireRole(["admin"]);

  const Schema = z.object({
    term_id: z.coerce.number().int(),
    class_id: z.coerce.number().int(),
    teacher_id: z.string().uuid(),
  });

  const parsed = Schema.safeParse({
    term_id: fd.get("term_id"),
    class_id: fd.get("class_id"),
    teacher_id: fd.get("teacher_id"),
  });

  if (!parsed.success) return;

  const { data: existing, error: findErr } = await sb()
    .from("class_teachers")
    .select("id")
    .eq("term_id", parsed.data.term_id)
    .eq("class_id", parsed.data.class_id)
    .maybeSingle();

  if (findErr) {
    redirect(`/portal/admin/academics?tab=class-teachers&err=${encodeURIComponent(findErr.message)}`);
  }

  if (existing?.id) {
    const { error } = await sb()
      .from("class_teachers")
      .update({ teacher_id: parsed.data.teacher_id })
      .eq("id", existing.id);

    if (error) {
      redirect(`/portal/admin/academics?tab=class-teachers&err=${encodeURIComponent(error.message)}`);
    }
  } else {
    const { error } = await sb().from("class_teachers").insert(parsed.data);
    if (error) {
      redirect(`/portal/admin/academics?tab=class-teachers&err=${encodeURIComponent(error.message)}`);
    }
  }

  revalidatePath("/portal/admin/academics");
  redirect("/portal/admin/academics?tab=class-teachers&ok=1");
}

export async function deleteClassTeacher(fd: FormData): Promise<void> {
  await requireRole(["admin"]);
  const id = Number(fd.get("id"));
  if (!id) return;

  const { error } = await sb().from("class_teachers").delete().eq("id", id);
  if (error) redirect(`/portal/admin/academics?tab=class-teachers&err=${encodeURIComponent(error.message)}`);

  revalidatePath("/portal/admin/academics");
  redirect("/portal/admin/academics?tab=class-teachers&ok=1");
}

// -------------------- ENROLLMENTS --------------------

export async function addEnrollment(formData: FormData): Promise<void> {
  await requireRole(["admin"]);

  const student_id = String(formData.get("student_id") ?? "");
  const class_id = Number(formData.get("class_id"));
  const term_id = Number(formData.get("term_id"));

  const backUrl = `/portal/admin/academics?tab=enrollments&termId=${term_id}&classId=${class_id}`;

  if (!student_id || !class_id || !term_id) {
    redirect(`${backUrl}&err=${encodeURIComponent("Missing student, class, or term.")}`);
  }

  const { data: existing, error: existingErr } = await sb()
    .from("enrollments")
    .select("id")
    .eq("student_id", student_id)
    .eq("term_id", term_id)
    .maybeSingle();

  if (existingErr) redirect(`${backUrl}&err=${encodeURIComponent(existingErr.message)}`);

  if (existing) {
    const { error: updErr } = await sb().from("enrollments").update({ class_id }).eq("id", existing.id);
    if (updErr) redirect(`${backUrl}&err=${encodeURIComponent(updErr.message)}`);

    revalidatePath("/portal/admin/academics");
    redirect(`${backUrl}&ok=1`);
  }

  const { error } = await sb().from("enrollments").insert({ student_id, class_id, term_id });
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
