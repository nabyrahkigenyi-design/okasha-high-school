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

const StudentProfileSchema = z.object({
  id: z.string().uuid(),
  first_name: z.string().trim().max(80).optional().or(z.literal("")),
  last_name: z.string().trim().max(80).optional().or(z.literal("")),
  other_names: z.string().trim().max(120).optional().or(z.literal("")),
  full_name: z.string().trim().min(2).max(160),
  date_of_birth: z.string().optional().or(z.literal("")),
  sex: z.string().trim().max(20).optional().or(z.literal("")),
  home_village: z.string().trim().max(120).optional().or(z.literal("")),
  district: z.string().trim().max(120).optional().or(z.literal("")),
  nationality: z.string().trim().max(120).optional().or(z.literal("")),
  religion: z.string().trim().max(120).optional().or(z.literal("")),
  photo_url: z.string().trim().max(1000).optional().or(z.literal("")),
  track: z.string().trim().max(40).optional().or(z.literal("")),
  class_level: z.string().trim().max(40).optional().or(z.literal("")),
  school_level: z.enum(["primary", "o-level", "a-level"]),
  stream: z.string().trim().max(40).optional().or(z.literal("")),
  admission_year: z.coerce.number().int().min(2000).max(2100).optional(),
  graduation_year: z.coerce.number().int().min(2000).max(2100).optional().nullable(),
  admission_date: z.string().optional().or(z.literal("")),
  status: z.enum(["active", "suspended", "withdrawn", "graduated"]),
  former_school: z.string().trim().max(160).optional().or(z.literal("")),
  notes: z.string().trim().max(5000).optional().or(z.literal("")),
  guardian_primary_id: z.string().uuid().optional().or(z.literal("")),
  guardian_secondary_id: z.string().uuid().optional().or(z.literal("")),
  is_active: z.coerce.boolean().default(true),
});

const CreatePortalLoginSchema = z.object({
  id: z.string().uuid(),
  email: z.string().trim().email(),
  password: z.string().trim().min(8).max(200),
});

const ResetPortalPasswordSchema = z.object({
  id: z.string().uuid(),
  password: z.string().trim().min(8).max(200),
});

export async function assignStudentNumber(formData: FormData) {
  await requireRole(["admin"]);

  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    redirect(`/portal/admin/students?err=${enc("Missing student id.")}`);
  }

  const student = await sb()
    .from("students")
    .select("id, student_no, school_level, admission_year")
    .eq("id", id)
    .maybeSingle();

  if (student.error) {
    redirect(`/portal/admin/students?err=${enc(student.error.message)}`);
  }

  if (!student.data) {
    redirect(`/portal/admin/students?err=${enc("Student not found.")}`);
  }

  if (student.data.student_no) {
    redirect(`/portal/admin/students/${id}?ok=${enc("Student ID already assigned.")}`);
  }

  if (!student.data.school_level) {
    redirect(`/portal/admin/students/${id}?err=${enc("Set school level before generating student ID.")}`);
  }

  const year = student.data.admission_year || new Date().getFullYear();

  const gen = await sb().rpc("generate_student_no", {
    p_school_level: student.data.school_level,
    p_year: year,
  });

  if (gen.error || !gen.data) {
    redirect(`/portal/admin/students/${id}?err=${enc(gen.error?.message ?? "Failed to generate student ID.")}`);
  }

  const newStudentNo = String(gen.data);

  const { error } = await sb()
    .from("students")
    .update({
      student_no: newStudentNo,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    redirect(`/portal/admin/students/${id}?err=${enc(error.message)}`);
  }

  revalidatePath("/portal/admin/students");
  revalidatePath(`/portal/admin/students/${id}`);
  redirect(`/portal/admin/students/${id}?ok=${enc("Student ID assigned.")}`);
}

export async function updateStudentProfile(formData: FormData) {
  await requireRole(["admin"]);

  const parsed = StudentProfileSchema.safeParse({
    id: formData.get("id"),
    first_name: String(formData.get("first_name") ?? "").trim(),
    last_name: String(formData.get("last_name") ?? "").trim(),
    other_names: String(formData.get("other_names") ?? "").trim(),
    full_name: String(formData.get("full_name") ?? "").trim(),
    date_of_birth: String(formData.get("date_of_birth") ?? "").trim(),
    sex: String(formData.get("sex") ?? "").trim(),
    home_village: String(formData.get("home_village") ?? "").trim(),
    district: String(formData.get("district") ?? "").trim(),
    nationality: String(formData.get("nationality") ?? "").trim(),
    religion: String(formData.get("religion") ?? "").trim(),
    photo_url: String(formData.get("photo_url") ?? "").trim(),
    track: String(formData.get("track") ?? "").trim(),
    class_level: String(formData.get("class_level") ?? "").trim(),
    school_level: String(formData.get("school_level") ?? "").trim(),
    stream: String(formData.get("stream") ?? "").trim(),
    admission_year: formData.get("admission_year")
      ? Number(formData.get("admission_year"))
      : new Date().getFullYear(),
    graduation_year: formData.get("graduation_year")
      ? Number(formData.get("graduation_year"))
      : null,
    admission_date: String(formData.get("admission_date") ?? "").trim(),
    status: String(formData.get("status") ?? "active").trim(),
    former_school: String(formData.get("former_school") ?? "").trim(),
    notes: String(formData.get("notes") ?? "").trim(),
    guardian_primary_id: String(formData.get("guardian_primary_id") ?? "").trim(),
    guardian_secondary_id: String(formData.get("guardian_secondary_id") ?? "").trim(),
    is_active: formData.get("is_active") ? true : false,
  });

  const rawId = String(formData.get("id") ?? "").trim();
  const back = rawId ? `/portal/admin/students/${rawId}` : "/portal/admin/students";

  if (!parsed.success) {
    redirect(`${back}?edit=1&err=${enc(parsed.error.issues.map((i) => i.message).join(", "))}`);
  }

  const data = parsed.data;

  const payload = {
    first_name: data.first_name || null,
    last_name: data.last_name || null,
    other_names: data.other_names || null,
    full_name: data.full_name,
    date_of_birth: data.date_of_birth || null,
    sex: data.sex || null,
    home_village: data.home_village || null,
    district: data.district || null,
    nationality: data.nationality || null,
    religion: data.religion || null,
    photo_url: data.photo_url || null,
    track: data.track || null,
    class_level: data.class_level || null,
    school_level: data.school_level,
    stream: data.stream || null,
    admission_year: data.admission_year ?? new Date().getFullYear(),
    graduation_year: data.graduation_year ?? null,
    admission_date: data.admission_date || null,
    status: data.status,
    former_school: data.former_school || null,
    notes: data.notes || null,
    guardian_primary_id: data.guardian_primary_id || null,
    guardian_secondary_id: data.guardian_secondary_id || null,
    is_active: data.is_active,
    updated_at: new Date().toISOString(),
  };

  const { error: studentError } = await sb()
    .from("students")
    .update(payload)
    .eq("id", data.id);

  if (studentError) {
    redirect(`${back}?edit=1&err=${enc(studentError.message)}`);
  }

  const { error: profileError } = await sb()
    .from("profiles")
    .update({
      full_name: data.full_name,
      is_active: data.is_active,
    })
    .eq("id", data.id);

  if (profileError) {
    redirect(`${back}?edit=1&err=${enc(profileError.message)}`);
  }

  revalidatePath("/portal/admin/students");
  revalidatePath(back);
  redirect(`${back}?ok=${enc("Student profile updated.")}`);
}

export async function setStudentStatus(formData: FormData) {
  await requireRole(["admin"]);

  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim() as
    | "active"
    | "suspended"
    | "withdrawn"
    | "graduated";

  if (!id || !["active", "suspended", "withdrawn", "graduated"].includes(status)) {
    redirect(`/portal/admin/students?err=${enc("Invalid student status request.")}`);
  }

  const isActive = status === "active";

  const { error: studentError } = await sb()
    .from("students")
    .update({
      status,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (studentError) {
    redirect(`/portal/admin/students?err=${enc(studentError.message)}`);
  }

  const { error: profileError } = await sb()
    .from("profiles")
    .update({ is_active: isActive })
    .eq("id", id);

  if (profileError) {
    redirect(`/portal/admin/students?err=${enc(profileError.message)}`);
  }

  revalidatePath("/portal/admin/students");
  revalidatePath(`/portal/admin/students/${id}`);
  redirect(`/portal/admin/students/${id}?ok=${enc("Student status updated.")}`);
}

export async function createStudentPortalLogin(formData: FormData) {
  await requireRole(["admin"]);

  const parsed = CreatePortalLoginSchema.safeParse({
    id: String(formData.get("id") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? "").trim(),
  });

  const rawId = String(formData.get("id") ?? "").trim();
  const back = rawId ? `/portal/admin/students/${rawId}` : "/portal/admin/students";

  if (!parsed.success) {
    redirect(`${back}?err=${enc(parsed.error.issues.map((i) => i.message).join(", "))}`);
  }

  const studentRes = await sb()
    .from("students")
    .select("id, user_id, full_name, is_active")
    .eq("id", parsed.data.id)
    .maybeSingle();

  if (studentRes.error) {
    redirect(`${back}?err=${enc(studentRes.error.message)}`);
  }

  if (!studentRes.data) {
    redirect(`${back}?err=${enc("Student not found.")}`);
  }

  if (studentRes.data.user_id) {
    redirect(`${back}?err=${enc("This student already has a portal login.")}`);
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
    full_name: studentRes.data.full_name,
    role_key: "student",
    is_active: studentRes.data.is_active ?? true,
  });

  if (profileError) {
    await sb().auth.admin.deleteUser(newUserId);
    redirect(`${back}?err=${enc(profileError.message)}`);
  }

  const { error: updateStudentError } = await sb()
    .from("students")
    .update({
      user_id: newUserId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.id);

  if (updateStudentError) {
    await sb().from("profiles").delete().eq("id", newUserId);
    await sb().auth.admin.deleteUser(newUserId);
    redirect(`${back}?err=${enc(updateStudentError.message)}`);
  }

  revalidatePath("/portal/admin/students");
  revalidatePath(back);
  revalidatePath("/portal/admin/users");
  redirect(`${back}?ok=${enc("Student portal login created.")}`);
}

export async function resetStudentPortalPassword(formData: FormData) {
  await requireRole(["admin"]);

  const parsed = ResetPortalPasswordSchema.safeParse({
    id: String(formData.get("id") ?? "").trim(),
    password: String(formData.get("password") ?? "").trim(),
  });

  const rawId = String(formData.get("id") ?? "").trim();
  const back = rawId ? `/portal/admin/students/${rawId}` : "/portal/admin/students";

  if (!parsed.success) {
    redirect(`${back}?err=${enc(parsed.error.issues.map((i) => i.message).join(", "))}`);
  }

  const studentRes = await sb()
    .from("students")
    .select("id, user_id")
    .eq("id", parsed.data.id)
    .maybeSingle();

  if (studentRes.error) {
    redirect(`${back}?err=${enc(studentRes.error.message)}`);
  }

  if (!studentRes.data) {
    redirect(`${back}?err=${enc("Student not found.")}`);
  }

  if (!studentRes.data.user_id) {
    redirect(`${back}?err=${enc("This student does not have a portal login yet.")}`);
  }

  const reset = await sb().auth.admin.updateUserById(studentRes.data.user_id, {
    password: parsed.data.password,
  });

  if (reset.error) {
    redirect(`${back}?err=${enc(reset.error.message)}`);
  }

  revalidatePath(back);
  redirect(`${back}?ok=${enc("Student password reset successfully.")}`);
}

export async function purgeStudent(formData: FormData) {
  await requireRole(["admin"]);

  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    redirect(`/portal/admin/students?err=${enc("Missing student id.")}`);
  }

  const { data: student, error: studentFindError } = await sb()
    .from("students")
    .select("id, user_id, full_name")
    .eq("id", id)
    .maybeSingle();

  if (studentFindError) {
    redirect(`/portal/admin/students?err=${enc(studentFindError.message)}`);
  }

  if (!student) {
    redirect(`/portal/admin/students?err=${enc("Student not found.")}`);
  }

  const userId = student.user_id || null;

  const [
    parentLinksRes,
    paymentRes,
    adjustmentRes,
    enrollmentRes,
    attendanceMarksRes,
    gradesRes,
  ] = await Promise.all([
    sb().from("parent_students").delete().eq("student_id", id),
    sb().from("student_fee_payments").delete().eq("student_id", id),
    sb().from("student_fee_adjustments").delete().eq("student_id", id),
    sb().from("enrollments").delete().eq("student_id", id),
    sb().from("attendance_marks").delete().eq("student_id", id),
    sb().from("grades").delete().eq("student_id", id),
  ]);

  for (const result of [
    parentLinksRes,
    paymentRes,
    adjustmentRes,
    enrollmentRes,
    attendanceMarksRes,
    gradesRes,
  ]) {
    if (result.error) {
      redirect(`/portal/admin/students/${id}?err=${enc(result.error.message)}`);
    }
  }

  const { error: studentDeleteError } = await sb()
    .from("students")
    .delete()
    .eq("id", id);

  if (studentDeleteError) {
    redirect(`/portal/admin/students/${id}?err=${enc(studentDeleteError.message)}`);
  }

  if (userId) {
    const { error: profileDeleteError } = await sb()
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileDeleteError) {
      redirect(`/portal/admin/students?err=${enc(profileDeleteError.message)}`);
    }

    const authDelete = await sb().auth.admin.deleteUser(userId);
    if (authDelete.error) {
      redirect(`/portal/admin/students?err=${enc(authDelete.error.message)}`);
    }
  }

  revalidatePath("/portal/admin/students");
  revalidatePath("/portal/admin/users");
  revalidatePath("/portal/admin/finance");
  revalidatePath("/portal/admin/academics");
  redirect(`/portal/admin/students?ok=${enc("Student permanently deleted.")}`);
}