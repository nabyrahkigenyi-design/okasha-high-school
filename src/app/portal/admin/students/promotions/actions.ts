"use server";

import { requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

function enc(s: string) {
  return encodeURIComponent(s);
}

const sb = () => supabaseAdmin();

export async function promoteStudent(formData: FormData) {
  await requireRole(["admin"]);

  const studentId = String(formData.get("student_id") ?? "").trim();
  const classId = Number(formData.get("class_id") ?? 0);
  const termId = Number(formData.get("term_id") ?? 0);
  const classLevel = String(formData.get("class_level") ?? "").trim();
  const stream = String(formData.get("stream") ?? "").trim();
  const schoolLevel = String(formData.get("school_level") ?? "").trim();
  const track = String(formData.get("track") ?? "").trim();

  const back = `/portal/admin/students/promotions?termId=${termId || ""}`;

  if (!studentId || !classId || !termId) {
    redirect(`${back}&err=${enc("Missing student, class, or term.")}`);
  }

  const { data: existing, error: existingErr } = await sb()
    .from("enrollments")
    .select("id")
    .eq("student_id", studentId)
    .eq("term_id", termId)
    .maybeSingle();

  if (existingErr) {
    redirect(`${back}&err=${enc(existingErr.message)}`);
  }

  if (existing?.id) {
    const { error: updateEnrollmentError } = await sb()
      .from("enrollments")
      .update({ class_id: classId })
      .eq("id", existing.id);

    if (updateEnrollmentError) {
      redirect(`${back}&err=${enc(updateEnrollmentError.message)}`);
    }
  } else {
    const { error: insertEnrollmentError } = await sb()
      .from("enrollments")
      .insert({
        student_id: studentId,
        class_id: classId,
        term_id: termId,
      });

    if (insertEnrollmentError) {
      redirect(`${back}&err=${enc(insertEnrollmentError.message)}`);
    }
  }

  const { error: updateStudentError } = await sb()
    .from("students")
    .update({
      class_level: classLevel || null,
      stream: stream || null,
      school_level: schoolLevel || null,
      track: track || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", studentId);

  if (updateStudentError) {
    redirect(`${back}&err=${enc(updateStudentError.message)}`);
  }

  revalidatePath("/portal/admin/students");
  revalidatePath("/portal/admin/students/promotions");
  revalidatePath("/portal/admin/academics");

  redirect(`${back}&ok=${enc("Student promoted / moved successfully.")}`);
}

export async function bulkPromoteStudents(formData: FormData) {
  await requireRole(["admin"]);

  const termId = Number(formData.get("term_id") ?? 0);
  const classId = Number(formData.get("class_id") ?? 0);
  const classLevel = String(formData.get("class_level") ?? "").trim();
  const stream = String(formData.get("stream") ?? "").trim();
  const schoolLevel = String(formData.get("school_level") ?? "").trim();
  const track = String(formData.get("track") ?? "").trim();

  const back = `/portal/admin/students/promotions?termId=${termId || ""}`;

  if (!termId || !classId) {
    redirect(`${back}&err=${enc("Missing term or class.")}`);
  }

  const studentIds = formData
    .getAll("student_ids")
    .map((v) => String(v).trim())
    .filter(Boolean);

  if (studentIds.length === 0) {
    redirect(`${back}&err=${enc("No students selected.")}`);
  }

  for (const studentId of studentIds) {
    const { data: existing, error: existingErr } = await sb()
      .from("enrollments")
      .select("id")
      .eq("student_id", studentId)
      .eq("term_id", termId)
      .maybeSingle();

    if (existingErr) {
      redirect(`${back}&err=${enc(existingErr.message)}`);
    }

    if (existing?.id) {
      const { error } = await sb()
        .from("enrollments")
        .update({ class_id: classId })
        .eq("id", existing.id);

      if (error) {
        redirect(`${back}&err=${enc(error.message)}`);
      }
    } else {
      const { error } = await sb()
        .from("enrollments")
        .insert({
          student_id: studentId,
          class_id: classId,
          term_id: termId,
        });

      if (error) {
        redirect(`${back}&err=${enc(error.message)}`);
      }
    }

    const { error: studentError } = await sb()
      .from("students")
      .update({
        class_level: classLevel || null,
        stream: stream || null,
        school_level: schoolLevel || null,
        track: track || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", studentId);

    if (studentError) {
      redirect(`${back}&err=${enc(studentError.message)}`);
    }
  }

  revalidatePath("/portal/admin/students");
  revalidatePath("/portal/admin/students/promotions");
  revalidatePath("/portal/admin/academics");

  redirect(`${back}&ok=${enc("Students promoted / moved successfully.")}`);
}