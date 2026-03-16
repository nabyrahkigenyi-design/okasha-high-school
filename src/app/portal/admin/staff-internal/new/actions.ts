"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";

const sb = () => supabaseAdmin();

function enc(s: string) {
  return encodeURIComponent(s);
}

const TeacherSchema = z.object({
  id: z.string().uuid().optional(),
  first_name: z.string().trim().max(80).optional().or(z.literal("")),
  last_name: z.string().trim().max(80).optional().or(z.literal("")),
  other_names: z.string().trim().max(120).optional().or(z.literal("")),
  full_name: z.string().trim().min(2).max(160),

  staff_no: z.string().trim().max(60).optional().or(z.literal("")),
  title_id: z.coerce.number().int().positive().optional().nullable(),
  department: z.string().trim().max(120).optional().or(z.literal("")),

  sex: z.string().trim().max(20).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  email: z.string().trim().max(160).optional().or(z.literal("")),
  photo_url: z.string().trim().max(1000).optional().or(z.literal("")),
  date_of_birth: z.string().optional().or(z.literal("")),
  national_id: z.string().trim().max(80).optional().or(z.literal("")),
  residence: z.string().trim().max(200).optional().or(z.literal("")),

  qualification: z.string().trim().max(200).optional().or(z.literal("")),
  employment_type: z.string().trim().max(80).optional().or(z.literal("")),
  salary_amount: z.coerce.number().nonnegative().optional().nullable(),
  salary_frequency: z.string().trim().max(40).optional().or(z.literal("")),

  is_muslim: z.boolean().optional(),
  theology_role: z.boolean().optional(),
  secular_role: z.boolean().optional(),

  subjects_summary: z.string().trim().max(500).optional().or(z.literal("")),
  classes_summary: z.string().trim().max(500).optional().or(z.literal("")),
  notes: z.string().trim().max(5000).optional().or(z.literal("")),

  is_active: z.boolean().default(true),

  assignment_term_id: z.coerce.number().int().positive().optional().nullable(),
  assignment_class_id: z.coerce.number().int().positive().optional().nullable(),
  assignment_subject_id: z.coerce.number().int().positive().optional().nullable(),
  assign_as_class_teacher: z.boolean().optional(),
  assign_as_subject_teacher: z.boolean().optional(),
});

const CreateTeacherPortalLoginSchema = z.object({
  id: z.string().uuid(),
  email: z.string().trim().email(),
  password: z.string().trim().min(8).max(200),
});

const ResetTeacherPortalPasswordSchema = z.object({
  id: z.string().uuid(),
  password: z.string().trim().min(8).max(200),
});

async function ensureAcademicAssignments(args: {
  teacherId: string;
  termId: number | null;
  classId: number | null;
  subjectId: number | null;
  assignAsClassTeacher: boolean;
  assignAsSubjectTeacher: boolean;
  back: string;
}) {
  const {
    teacherId,
    termId,
    classId,
    subjectId,
    assignAsClassTeacher,
    assignAsSubjectTeacher,
    back,
  } = args;

  if (!termId || !classId) return;

  if (assignAsClassTeacher) {
    const existingClassTeacher = await sb()
      .from("class_teachers")
      .select("id")
      .eq("term_id", termId)
      .eq("class_id", classId)
      .maybeSingle();

    if (existingClassTeacher.error) {
      redirect(`${back}?err=${enc(existingClassTeacher.error.message)}`);
    }

    if (existingClassTeacher.data?.id) {
      const { error } = await sb()
        .from("class_teachers")
        .update({ teacher_id: teacherId })
        .eq("id", existingClassTeacher.data.id);

      if (error) {
        redirect(`${back}?err=${enc(error.message)}`);
      }
    } else {
      const { error } = await sb().from("class_teachers").insert({
        term_id: termId,
        class_id: classId,
        teacher_id: teacherId,
      });

      if (error) {
        redirect(`${back}?err=${enc(error.message)}`);
      }
    }
  }

  if (assignAsSubjectTeacher && subjectId) {
    const existingAssignment = await sb()
      .from("teacher_assignments")
      .select("id")
      .eq("term_id", termId)
      .eq("class_id", classId)
      .eq("subject_id", subjectId)
      .eq("teacher_id", teacherId)
      .maybeSingle();

    if (existingAssignment.error) {
      redirect(`${back}?err=${enc(existingAssignment.error.message)}`);
    }

    if (!existingAssignment.data?.id) {
      const { error } = await sb().from("teacher_assignments").insert({
        term_id: termId,
        class_id: classId,
        subject_id: subjectId,
        teacher_id: teacherId,
      });

      if (error) {
        redirect(`${back}?err=${enc(error.message)}`);
      }
    }
  }
}

export async function upsertTeacherProfile(formData: FormData) {
  await requireRole(["admin"]);

  const parsed = TeacherSchema.safeParse({
    id: formData.get("id") ? String(formData.get("id")) : undefined,
    first_name: String(formData.get("first_name") ?? "").trim(),
    last_name: String(formData.get("last_name") ?? "").trim(),
    other_names: String(formData.get("other_names") ?? "").trim(),
    full_name: String(formData.get("full_name") ?? "").trim(),

    staff_no: String(formData.get("staff_no") ?? "").trim(),
    title_id: formData.get("title_id") ? Number(formData.get("title_id")) : null,
    department: String(formData.get("department") ?? "").trim(),

    sex: String(formData.get("sex") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    photo_url: String(formData.get("photo_url") ?? "").trim(),
    date_of_birth: String(formData.get("date_of_birth") ?? "").trim(),
    national_id: String(formData.get("national_id") ?? "").trim(),
    residence: String(formData.get("residence") ?? "").trim(),

    qualification: String(formData.get("qualification") ?? "").trim(),
    employment_type: String(formData.get("employment_type") ?? "").trim(),
    salary_amount: formData.get("salary_amount")
      ? Number(formData.get("salary_amount"))
      : null,
    salary_frequency: String(formData.get("salary_frequency") ?? "").trim(),

    is_muslim: formData.get("is_muslim") ? true : false,
    theology_role: formData.get("theology_role") ? true : false,
    secular_role: formData.get("secular_role") ? true : false,

    subjects_summary: String(formData.get("subjects_summary") ?? "").trim(),
    classes_summary: String(formData.get("classes_summary") ?? "").trim(),
    notes: String(formData.get("notes") ?? "").trim(),

    is_active: formData.get("is_active") ? true : false,

    assignment_term_id: formData.get("assignment_term_id")
      ? Number(formData.get("assignment_term_id"))
      : null,
    assignment_class_id: formData.get("assignment_class_id")
      ? Number(formData.get("assignment_class_id"))
      : null,
    assignment_subject_id: formData.get("assignment_subject_id")
      ? Number(formData.get("assignment_subject_id"))
      : null,
    assign_as_class_teacher: formData.get("assign_as_class_teacher") ? true : false,
    assign_as_subject_teacher: formData.get("assign_as_subject_teacher") ? true : false,
  });

  const rawId = String(formData.get("id") ?? "").trim();
  const back = rawId ? `/portal/admin/staff-internal/${rawId}` : "/portal/admin/staff-internal/new";

  if (!parsed.success) {
    redirect(`${back}?err=${enc(parsed.error.issues.map((i) => i.message).join(", "))}`);
  }

  const data = parsed.data;

  const payload = {
    first_name: data.first_name || null,
    last_name: data.last_name || null,
    other_names: data.other_names || null,
    full_name: data.full_name,

    staff_no: data.staff_no || null,
    title_id: data.title_id ?? null,
    department: data.department || null,

    sex: data.sex || null,
    phone: data.phone || null,
    email: data.email || null,
    photo_url: data.photo_url || null,
    date_of_birth: data.date_of_birth || null,
    national_id: data.national_id || null,
    residence: data.residence || null,

    qualification: data.qualification || null,
    employment_type: data.employment_type || null,
    salary_amount: data.salary_amount ?? null,
    salary_frequency: data.salary_frequency || null,

    is_muslim: data.is_muslim ?? false,
    theology_role: data.theology_role ?? false,
    secular_role: data.secular_role ?? false,

    subjects_summary: data.subjects_summary || null,
    classes_summary: data.classes_summary || null,
    notes: data.notes || null,

    is_active: data.is_active,
    updated_at: new Date().toISOString(),
  };

  if (data.id) {
    const { error } = await sb().from("teachers").update(payload).eq("id", data.id);
    if (error) {
      redirect(`${back}?err=${enc(error.message)}`);
    }

    await ensureAcademicAssignments({
      teacherId: data.id,
      termId: data.assignment_term_id ?? null,
      classId: data.assignment_class_id ?? null,
      subjectId: data.assignment_subject_id ?? null,
      assignAsClassTeacher: data.assign_as_class_teacher ?? false,
      assignAsSubjectTeacher: data.assign_as_subject_teacher ?? false,
      back,
    });

    revalidatePath("/portal/admin/staff-internal");
    revalidatePath(`/portal/admin/staff-internal/${data.id}`);
    revalidatePath("/portal/admin/academics");
    redirect(`/portal/admin/staff-internal/${data.id}?ok=${enc("Staff profile updated.")}`);
  }

  const newId = crypto.randomUUID();

  const { error } = await sb().from("teachers").insert({
    id: newId,
    user_id: null,
    ...payload,
    created_at: new Date().toISOString(),
  });

  if (error) {
    redirect(`/portal/admin/staff-internal/new?err=${enc(error.message)}`);
  }

  await ensureAcademicAssignments({
    teacherId: newId,
    termId: data.assignment_term_id ?? null,
    classId: data.assignment_class_id ?? null,
    subjectId: data.assignment_subject_id ?? null,
    assignAsClassTeacher: data.assign_as_class_teacher ?? false,
    assignAsSubjectTeacher: data.assign_as_subject_teacher ?? false,
    back: `/portal/admin/staff-internal/${newId}`,
  });

  revalidatePath("/portal/admin/staff-internal");
  revalidatePath("/portal/admin/academics");
  redirect(`/portal/admin/staff-internal/${newId}?ok=${enc("Staff profile created.")}`);
}

export async function setTeacherActive(formData: FormData) {
  await requireRole(["admin"]);

  const id = String(formData.get("id") ?? "").trim();
  const isActive = String(formData.get("is_active") ?? "") === "true";

  if (!id) {
    redirect(`/portal/admin/staff-internal?err=${enc("Missing teacher id.")}`);
  }

  const { error } = await sb()
    .from("teachers")
    .update({
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    redirect(`/portal/admin/staff-internal?err=${enc(error.message)}`);
  }

  revalidatePath("/portal/admin/staff-internal");
  revalidatePath(`/portal/admin/staff-internal/${id}`);
  revalidatePath("/portal/admin/academics");
  redirect(`/portal/admin/staff-internal/${id}?ok=${enc("Staff status updated.")}`);
}

export async function createTeacherPortalLogin(formData: FormData) {
  await requireRole(["admin"]);

  const parsed = CreateTeacherPortalLoginSchema.safeParse({
    id: String(formData.get("id") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? "").trim(),
  });

  const rawId = String(formData.get("id") ?? "").trim();
  const back = rawId ? `/portal/admin/staff-internal/${rawId}` : "/portal/admin/staff-internal";

  if (!parsed.success) {
    redirect(`${back}?err=${enc(parsed.error.issues.map((i) => i.message).join(", "))}`);
  }

  const teacherRes = await sb()
    .from("teachers")
    .select("id, user_id, full_name, is_active")
    .eq("id", parsed.data.id)
    .maybeSingle();

  if (teacherRes.error) {
    redirect(`${back}?err=${enc(teacherRes.error.message)}`);
  }
  if (!teacherRes.data) {
    redirect(`${back}?err=${enc("Teacher not found.")}`);
  }
  if (teacherRes.data.user_id) {
    redirect(`${back}?err=${enc("This teacher already has a portal login.")}`);
  }

  const created = await sb().auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
  });

  if (created.error || !created.data.user) {
    redirect(`${back}?err=${enc(created.error?.message ?? "Failed to create portal login.")}`);
  }

  const newUserId = created.data.user.id;

  const { error: profileError } = await sb().from("profiles").upsert({
    id: newUserId,
    full_name: teacherRes.data.full_name,
    role_key: "teacher",
    is_active: teacherRes.data.is_active ?? true,
  });

  if (profileError) {
    await sb().auth.admin.deleteUser(newUserId);
    redirect(`${back}?err=${enc(profileError.message)}`);
  }

  const { error: updateTeacherError } = await sb()
    .from("teachers")
    .update({
      user_id: newUserId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.id);

  if (updateTeacherError) {
    await sb().from("profiles").delete().eq("id", newUserId);
    await sb().auth.admin.deleteUser(newUserId);
    redirect(`${back}?err=${enc(updateTeacherError.message)}`);
  }

  revalidatePath("/portal/admin/staff-internal");
  revalidatePath(back);
  revalidatePath("/portal/admin/academics");
  redirect(`${back}?ok=${enc("Teacher portal login created.")}`);
}

export async function resetTeacherPortalPassword(formData: FormData) {
  await requireRole(["admin"]);

  const parsed = ResetTeacherPortalPasswordSchema.safeParse({
    id: String(formData.get("id") ?? "").trim(),
    password: String(formData.get("password") ?? "").trim(),
  });

  const rawId = String(formData.get("id") ?? "").trim();
  const back = rawId ? `/portal/admin/staff-internal/${rawId}` : "/portal/admin/staff-internal";

  if (!parsed.success) {
    redirect(`${back}?err=${enc(parsed.error.issues.map((i) => i.message).join(", "))}`);
  }

  const teacherRes = await sb()
    .from("teachers")
    .select("id, user_id")
    .eq("id", parsed.data.id)
    .maybeSingle();

  if (teacherRes.error) {
    redirect(`${back}?err=${enc(teacherRes.error.message)}`);
  }
  if (!teacherRes.data) {
    redirect(`${back}?err=${enc("Teacher not found.")}`);
  }
  if (!teacherRes.data.user_id) {
    redirect(`${back}?err=${enc("This teacher does not have a portal login yet.")}`);
  }

  const reset = await sb().auth.admin.updateUserById(teacherRes.data.user_id, {
    password: parsed.data.password,
  });

  if (reset.error) {
    redirect(`${back}?err=${enc(reset.error.message)}`);
  }

  revalidatePath(back);
  redirect(`${back}?ok=${enc("Teacher password reset successfully.")}`);
}

export async function deleteTeacherProfile(formData: FormData) {
  await requireRole(["admin"]);

  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    redirect(`/portal/admin/staff-internal?err=${enc("Missing teacher id.")}`);
  }

  const [classTeacherDelete, assignmentDelete] = await Promise.all([
    sb().from("class_teachers").delete().eq("teacher_id", id),
    sb().from("teacher_assignments").delete().eq("teacher_id", id),
  ]);

  if (classTeacherDelete.error) {
    redirect(`/portal/admin/staff-internal?err=${enc(classTeacherDelete.error.message)}`);
  }
  if (assignmentDelete.error) {
    redirect(`/portal/admin/staff-internal?err=${enc(assignmentDelete.error.message)}`);
  }

  const teacherRes = await sb()
    .from("teachers")
    .select("id, user_id")
    .eq("id", id)
    .maybeSingle();

  if (teacherRes.error) {
    redirect(`/portal/admin/staff-internal?err=${enc(teacherRes.error.message)}`);
  }

  const userId = teacherRes.data?.user_id ?? null;

  const { error: teacherDeleteError } = await sb().from("teachers").delete().eq("id", id);
  if (teacherDeleteError) {
    redirect(`/portal/admin/staff-internal?err=${enc(teacherDeleteError.message)}`);
  }

  if (userId) {
    const { error: profileDeleteError } = await sb().from("profiles").delete().eq("id", userId);
    if (profileDeleteError) {
      redirect(`/portal/admin/staff-internal?err=${enc(profileDeleteError.message)}`);
    }

    const authDelete = await sb().auth.admin.deleteUser(userId);
    if (authDelete.error) {
      redirect(`/portal/admin/staff-internal?err=${enc(authDelete.error.message)}`);
    }
  }

  revalidatePath("/portal/admin/staff-internal");
  revalidatePath("/portal/admin/academics");
  redirect(`/portal/admin/staff-internal?ok=${enc("Staff profile deleted.")}`);
}
