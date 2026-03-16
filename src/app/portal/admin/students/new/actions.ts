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

function deriveSchoolLevelFromClassLevel(level: string | null | undefined) {
  const value = String(level ?? "").trim().toUpperCase();

  if (!value) return "o-level";
  if (value.startsWith("P")) return "primary";
  if (value === "S5" || value === "S6") return "a-level";
  return "o-level";
}

const CreateStudentSchema = z.object({
  full_name: z.string().trim().min(2).max(160),
  first_name: z.string().trim().max(80).optional().or(z.literal("")),
  last_name: z.string().trim().max(80).optional().or(z.literal("")),
  other_names: z.string().trim().max(120).optional().or(z.literal("")),
  email: z.string().trim().email().optional().or(z.literal("")),
  password: z.string().trim().min(8).optional().or(z.literal("")),
  create_portal_user: z.boolean().default(false),

  date_of_birth: z.string().optional().or(z.literal("")),
  sex: z.string().trim().max(20).optional().or(z.literal("")),
  home_village: z.string().trim().max(120).optional().or(z.literal("")),
  district: z.string().trim().max(120).optional().or(z.literal("")),
  nationality: z.string().trim().max(120).optional().or(z.literal("")),
  religion: z.string().trim().max(120).optional().or(z.literal("")),
  photo_url: z.string().trim().max(1000).optional().or(z.literal("")),

  term_id: z.coerce.number().int().positive(),
  class_id: z.coerce.number().int().positive(),

  admission_year: z.coerce.number().int().min(2000).max(2100),
  graduation_year: z.coerce.number().int().min(2000).max(2100).optional().nullable(),
  admission_date: z.string().optional().or(z.literal("")),
  former_school: z.string().trim().max(160).optional().or(z.literal("")),
  notes: z.string().trim().max(5000).optional().or(z.literal("")),
});

export async function createStudentProfile(formData: FormData) {
  await requireRole(["admin"]);

  const createPortalUser = !!formData.get("create_portal_user");

  const parsed = CreateStudentSchema.safeParse({
    full_name: String(formData.get("full_name") ?? "").trim(),
    first_name: String(formData.get("first_name") ?? "").trim(),
    last_name: String(formData.get("last_name") ?? "").trim(),
    other_names: String(formData.get("other_names") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? "").trim(),
    create_portal_user: createPortalUser,

    date_of_birth: String(formData.get("date_of_birth") ?? "").trim(),
    sex: String(formData.get("sex") ?? "").trim(),
    home_village: String(formData.get("home_village") ?? "").trim(),
    district: String(formData.get("district") ?? "").trim(),
    nationality: String(formData.get("nationality") ?? "").trim(),
    religion: String(formData.get("religion") ?? "").trim(),
    photo_url: String(formData.get("photo_url") ?? "").trim(),

    term_id: Number(formData.get("term_id") ?? 0),
    class_id: Number(formData.get("class_id") ?? 0),

    admission_year: Number(formData.get("admission_year") ?? new Date().getFullYear()),
    graduation_year: formData.get("graduation_year")
      ? Number(formData.get("graduation_year"))
      : null,
    admission_date: String(formData.get("admission_date") ?? "").trim(),
    former_school: String(formData.get("former_school") ?? "").trim(),
    notes: String(formData.get("notes") ?? "").trim(),
  });

  if (!parsed.success) {
    redirect(`/portal/admin/students/new?err=${enc(parsed.error.issues.map((i) => i.message).join(", "))}`);
  }

  if (parsed.data.create_portal_user && (!parsed.data.email || !parsed.data.password)) {
    redirect(`/portal/admin/students/new?err=${enc("Email and password are required when creating a portal user.")}`);
  }

  const supabase = sb();

  const { data: selectedClass, error: classError } = await supabase
    .from("class_groups")
    .select("id, name, level, stream, track_key, is_active")
    .eq("id", parsed.data.class_id)
    .maybeSingle();

  if (classError) {
    redirect(`/portal/admin/students/new?err=${enc(classError.message)}`);
  }

  if (!selectedClass) {
    redirect(`/portal/admin/students/new?err=${enc("Selected class not found.")}`);
  }

  if (!selectedClass.is_active) {
    redirect(`/portal/admin/students/new?err=${enc("Selected class is inactive.")}`);
  }

  const derivedSchoolLevel = deriveSchoolLevelFromClassLevel(selectedClass.level);
  const derivedTrack = selectedClass.track_key ?? "secular";
  const derivedClassLevel = selectedClass.level ?? null;
  const derivedStream = selectedClass.stream ?? null;

  let studentId = "";
  let userId: string | null = null;

  if (parsed.data.create_portal_user) {
    const created = await supabase.auth.admin.createUser({
      email: parsed.data.email!,
      password: parsed.data.password!,
      email_confirm: true,
    });

    if (created.error || !created.data.user) {
      redirect(`/portal/admin/students/new?err=${enc(created.error?.message ?? "Failed to create portal user.")}`);
    }

    userId = created.data.user.id;
    studentId = userId;

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: userId,
      full_name: parsed.data.full_name,
      role_key: "student",
      is_active: true,
    });

    if (profileError) {
      redirect(`/portal/admin/students/new?err=${enc(profileError.message)}`);
    }
  } else {
    studentId = crypto.randomUUID();
    userId = null;
  }

  const genNo = await supabase.rpc("generate_student_no", {
    p_school_level: derivedSchoolLevel,
    p_year: parsed.data.admission_year,
  });

  if (genNo.error || !genNo.data) {
    redirect(`/portal/admin/students/new?err=${enc(genNo.error?.message ?? "Failed to generate student ID.")}`);
  }

  const studentNo = String(genNo.data);

  const { error: studentError } = await supabase.from("students").insert({
    id: studentId,
    user_id: userId,
    full_name: parsed.data.full_name,
    first_name: parsed.data.first_name || null,
    last_name: parsed.data.last_name || null,
    other_names: parsed.data.other_names || null,
    student_no: studentNo,
    date_of_birth: parsed.data.date_of_birth || null,
    sex: parsed.data.sex || null,
    home_village: parsed.data.home_village || null,
    district: parsed.data.district || null,
    nationality: parsed.data.nationality || null,
    religion: parsed.data.religion || null,
    photo_url: parsed.data.photo_url || null,
    school_level: derivedSchoolLevel,
    track: derivedTrack,
    class_level: derivedClassLevel,
    stream: derivedStream,
    admission_year: parsed.data.admission_year,
    graduation_year: parsed.data.graduation_year ?? null,
    admission_date: parsed.data.admission_date || null,
    status: "active",
    former_school: parsed.data.former_school || null,
    notes: parsed.data.notes || null,
    is_active: true,
    updated_at: new Date().toISOString(),
  });

  if (studentError) {
    redirect(`/portal/admin/students/new?err=${enc(studentError.message)}`);
  }

  const { data: existingEnrollment, error: enrollmentCheckError } = await supabase
    .from("enrollments")
    .select("id")
    .eq("student_id", studentId)
    .eq("term_id", parsed.data.term_id)
    .maybeSingle();

  if (enrollmentCheckError) {
    redirect(`/portal/admin/students/new?err=${enc(enrollmentCheckError.message)}`);
  }

  if (existingEnrollment?.id) {
    const { error: enrollmentUpdateError } = await supabase
      .from("enrollments")
      .update({ class_id: parsed.data.class_id })
      .eq("id", existingEnrollment.id);

    if (enrollmentUpdateError) {
      redirect(`/portal/admin/students/new?err=${enc(enrollmentUpdateError.message)}`);
    }
  } else {
    const { error: enrollmentInsertError } = await supabase.from("enrollments").insert({
      student_id: studentId,
      class_id: parsed.data.class_id,
      term_id: parsed.data.term_id,
    });

    if (enrollmentInsertError) {
      redirect(`/portal/admin/students/new?err=${enc(enrollmentInsertError.message)}`);
    }
  }

  revalidatePath("/portal/admin/students");
  revalidatePath("/portal/admin/users");
  revalidatePath("/portal/admin/academics");
  revalidatePath("/portal/admin/academics?tab=enrollments");
  revalidatePath("/portal/student/dashboard");
  revalidatePath("/portal/student/attendance");
  revalidatePath("/portal/student/grades");
  revalidatePath("/portal/student/timetable");
  revalidatePath("/portal/student/assignments");
  revalidatePath("/portal/student/announcements");

  redirect(`/portal/admin/students/${studentId}?ok=${enc("Student registered successfully.")}`);
}
