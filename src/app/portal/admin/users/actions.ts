"use server";

import { z } from "zod";
import { requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const CreateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  full_name: z.string().min(2).max(120),
  role_key: z.enum(["student", "parent", "teacher", "admin"]),
});

function enc(s: string) {
  return encodeURIComponent(s);
}

function sb() {
  return supabaseAdmin();
}

async function listLinkedStudentsForUser(authUserId: string) {
  const { data, error } = await sb()
    .from("students")
    .select("id, user_id, full_name")
    .or(`id.eq.${authUserId},user_id.eq.${authUserId}`);

  if (error) throw new Error(error.message);
  return data ?? [];
}

async function listLinkedTeachersForUser(authUserId: string) {
  const { data, error } = await sb()
    .from("teachers")
    .select("id, user_id, full_name")
    .or(`id.eq.${authUserId},user_id.eq.${authUserId}`);

  if (error) throw new Error(error.message);
  return data ?? [];
}

async function listLinkedParentsForUser(authUserId: string) {
  const { data, error } = await sb()
    .from("parents")
    .select("id, user_id, full_name")
    .or(`id.eq.${authUserId},user_id.eq.${authUserId}`);

  if (error) throw new Error(error.message);
  return data ?? [];
}

async function deleteStudentGraph(studentId: string) {
  const results = await Promise.all([
    sb().from("parent_students").delete().eq("student_id", studentId),
    sb().from("student_fee_payments").delete().eq("student_id", studentId),
    sb().from("student_fee_adjustments").delete().eq("student_id", studentId),
    sb().from("enrollments").delete().eq("student_id", studentId),
    sb().from("attendance_marks").delete().eq("student_id", studentId),
    sb().from("grades").delete().eq("student_id", studentId),
    sb().from("students").delete().eq("id", studentId),
  ]);

  for (const result of results) {
    if (result.error) throw new Error(result.error.message);
  }
}

async function deleteTeacherGraph(teacherId: string) {
  const [
    assignmentsCreatedByRes,
    attendanceMarkedByRes,
    classTeacherRes,
    gradeAssessmentsFinalizedByRes,
    gradesUpdatedByRes,
    teacherAssignmentsRes,
    teachingAssignmentsRes,
    timetableRes,
    attendanceSessionsByAssignmentRes,
  ] = await Promise.all([
    sb().from("assignments").delete().eq("created_by", teacherId),
    sb().from("attendance").delete().eq("marked_by", teacherId),
    sb().from("class_teachers").delete().eq("teacher_id", teacherId),
    sb().from("grade_assessments").update({ finalized_by: null }).eq("finalized_by", teacherId),
    sb().from("grades").delete().eq("updated_by", teacherId),
    sb().from("teacher_assignments").delete().eq("teacher_id", teacherId),
    sb().from("teaching_assignments").delete().eq("teacher_id", teacherId),
    sb().from("timetables").delete().eq("teacher_id", teacherId),
    (async () => {
      const { data: ownedAssignments, error: ownedAssignmentsError } = await sb()
        .from("teacher_assignments")
        .select("id")
        .eq("teacher_id", teacherId);

      if (ownedAssignmentsError) return { error: ownedAssignmentsError } as any;

      const assignmentIds = (ownedAssignments ?? []).map((x: any) => x.id);
      if (assignmentIds.length === 0) return { error: null };

      return sb().from("attendance_sessions").delete().in("assignment_id", assignmentIds);
    })(),
  ]);

  for (const result of [
    assignmentsCreatedByRes,
    attendanceMarkedByRes,
    classTeacherRes,
    gradeAssessmentsFinalizedByRes,
    gradesUpdatedByRes,
    teacherAssignmentsRes,
    teachingAssignmentsRes,
    timetableRes,
    attendanceSessionsByAssignmentRes,
  ]) {
    if (result?.error) throw new Error(result.error.message);
  }

  const { error: teacherDeleteError } = await sb().from("teachers").delete().eq("id", teacherId);
  if (teacherDeleteError) throw new Error(teacherDeleteError.message);
}

async function deleteParentGraph(parentId: string) {
  const results = await Promise.all([
    sb().from("parent_students").delete().eq("parent_id", parentId),
    sb().from("parents").delete().eq("id", parentId),
  ]);

  for (const result of results) {
    if (result.error) throw new Error(result.error.message);
  }
}

async function deleteProfileAndAuthUser(authUserId: string) {
  const { error: profileDeleteError } = await sb().from("profiles").delete().eq("id", authUserId);
  if (profileDeleteError) throw new Error(profileDeleteError.message);

  const { error: authDeleteError } = await sb().auth.admin.deleteUser(authUserId);
  if (authDeleteError) throw new Error(authDeleteError.message);
}

// Create user + profile + role table row
export async function adminCreateUser(formData: FormData) {
  await requireRole(["admin"]);

  const parsed = CreateSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    full_name: formData.get("full_name"),
    role_key: formData.get("role_key"),
  });

  if (!parsed.success) {
    redirect(`/portal/admin/users?err=${enc(parsed.error.issues.map((i) => i.message).join(", "))}`);
  }

  const { data, error } = await sb().auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
  });

  if (error || !data.user) {
    redirect(`/portal/admin/users?err=${enc(error?.message ?? "Failed to create user")}`);
  }

  const userId = data.user.id;

  const { error: upsertProfileError } = await sb().from("profiles").upsert({
    id: userId,
    full_name: parsed.data.full_name,
    role_key: parsed.data.role_key,
    is_active: true,
  });

  if (upsertProfileError) {
    redirect(`/portal/admin/users?err=${enc(upsertProfileError.message)}`);
  }

  if (parsed.data.role_key === "student") {
    const { error: e } = await sb().from("students").upsert({
      id: userId,
      user_id: userId,
      full_name: parsed.data.full_name,
      is_active: true,
      status: "active",
      updated_at: new Date().toISOString(),
    });
    if (e) redirect(`/portal/admin/users?err=${enc("Student row error: " + e.message)}`);
  }

  if (parsed.data.role_key === "teacher") {
    const { error: e } = await sb().from("teachers").upsert({
      id: userId,
      user_id: userId,
      full_name: parsed.data.full_name,
      is_active: true,
      updated_at: new Date().toISOString(),
    });
    if (e) redirect(`/portal/admin/users?err=${enc("Teacher row error: " + e.message)}`);
  }

  if (parsed.data.role_key === "parent") {
    const { error: e } = await sb().from("parents").upsert({
      id: userId,
      user_id: userId,
      full_name: parsed.data.full_name,
      is_active: true,
    });
    if (e) redirect(`/portal/admin/users?err=${enc("Parent row error: " + e.message)}`);
  }

  revalidatePath("/portal/admin/users");
  revalidatePath("/portal/admin/students");
  revalidatePath("/portal/admin/staff-internal");
  revalidatePath("/portal/admin/academics");
  redirect(`/portal/admin/users?ok=1`);
}

// Deactivate = hide from default list + block access
export async function adminDeactivateUser(formData: FormData) {
  await requireRole(["admin"]);
  const id = String(formData.get("id") ?? "");
  if (!id) redirect(`/portal/admin/users?err=${enc("Missing user id")}`);

  await sb().from("profiles").update({ is_active: false }).eq("id", id);

  await sb().from("students").update({ is_active: false, status: "suspended" }).or(`id.eq.${id},user_id.eq.${id}`);
  await sb().from("teachers").update({ is_active: false }).or(`id.eq.${id},user_id.eq.${id}`);
  await sb().from("parents").update({ is_active: false }).or(`id.eq.${id},user_id.eq.${id}`);

  revalidatePath("/portal/admin/users");
  revalidatePath("/portal/admin/students");
  revalidatePath("/portal/admin/staff-internal");
  redirect(`/portal/admin/users?ok=1`);
}

// Purge = hard delete user and linked role records
export async function adminPurgeUser(formData: FormData) {
  await requireRole(["admin"]);
  const id = String(formData.get("id") ?? "");
  if (!id) redirect(`/portal/admin/users?err=${enc("Missing user id")}`);

  try {
    const [linkedStudents, linkedTeachers, linkedParents] = await Promise.all([
      listLinkedStudentsForUser(id),
      listLinkedTeachersForUser(id),
      listLinkedParentsForUser(id),
    ]);

    for (const student of linkedStudents) {
      await deleteStudentGraph(student.id);
    }

    for (const teacher of linkedTeachers) {
      await deleteTeacherGraph(teacher.id);
    }

    for (const parent of linkedParents) {
      await deleteParentGraph(parent.id);
    }

    await deleteProfileAndAuthUser(id);

    revalidatePath("/portal/admin/users");
    revalidatePath("/portal/admin/students");
    revalidatePath("/portal/admin/staff-internal");
    revalidatePath("/portal/admin/finance");
    revalidatePath("/portal/admin/academics");
    redirect(`/portal/admin/users?ok=1`);
  } catch (error: any) {
    redirect(`/portal/admin/users?err=${enc(error?.message ?? "Failed to purge user.")}`);
  }
}
