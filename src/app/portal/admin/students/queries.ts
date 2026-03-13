import "server-only";
import { requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function listStudentsForAdmin(opts?: {
  q?: string;
  status?: string;
  schoolLevel?: string;
  admissionYear?: string;
  graduationYear?: string;
  showInactive?: boolean;
}) {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();

  let query = sb
    .from("students")
    .select(`
      id,
      user_id,
      full_name,
      first_name,
      last_name,
      other_names,
      student_no,
      admission_no,
      date_of_birth,
      sex,
      home_village,
      district,
      nationality,
      religion,
      photo_url,
      track,
      class_level,
      school_level,
      stream,
      admission_year,
      graduation_year,
      admission_date,
      status,
      former_school,
      notes,
      is_active,
      updated_at,
      created_at
    `)
    .order("created_at", { ascending: false })
    .limit(500);

  const q = (opts?.q ?? "").trim();
  const status = (opts?.status ?? "").trim();
  const schoolLevel = (opts?.schoolLevel ?? "").trim();
  const admissionYear = (opts?.admissionYear ?? "").trim();
  const graduationYear = (opts?.graduationYear ?? "").trim();
  const showInactive = !!opts?.showInactive;

  if (!showInactive) {
    query = query.eq("is_active", true);
  }

  if (q) {
    query = query.or(
      [
        `full_name.ilike.%${q}%`,
        `first_name.ilike.%${q}%`,
        `last_name.ilike.%${q}%`,
        `student_no.ilike.%${q}%`,
        `admission_no.ilike.%${q}%`,
      ].join(",")
    );
  }

  if (status) query = query.eq("status", status);
  if (schoolLevel) query = query.eq("school_level", schoolLevel);
  if (admissionYear) query = query.eq("admission_year", Number(admissionYear));
  if (graduationYear) query = query.eq("graduation_year", Number(graduationYear));

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return data ?? [];
}

export async function getStudentById(studentId: string) {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();

  const { data, error } = await sb
    .from("students")
    .select(`
      id,
      user_id,
      full_name,
      first_name,
      last_name,
      other_names,
      student_no,
      admission_no,
      date_of_birth,
      sex,
      home_village,
      district,
      nationality,
      religion,
      photo_url,
      track,
      class_level,
      school_level,
      stream,
      admission_year,
      graduation_year,
      admission_date,
      status,
      former_school,
      notes,
      is_active,
      guardian_primary_id,
      guardian_secondary_id,
      updated_at,
      created_at
    `)
    .eq("id", studentId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ?? null;
}

export async function getStudentStats() {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();

  const [
    activeRes,
    suspendedRes,
    withdrawnRes,
    graduatedRes,
    totalRes,
  ] = await Promise.all([
    sb.from("students").select("id", { count: "exact", head: true }).eq("status", "active"),
    sb.from("students").select("id", { count: "exact", head: true }).eq("status", "suspended"),
    sb.from("students").select("id", { count: "exact", head: true }).eq("status", "withdrawn"),
    sb.from("students").select("id", { count: "exact", head: true }).eq("status", "graduated"),
    sb.from("students").select("id", { count: "exact", head: true }),
  ]);

  return {
    active: activeRes.count ?? 0,
    suspended: suspendedRes.count ?? 0,
    withdrawn: withdrawnRes.count ?? 0,
    graduated: graduatedRes.count ?? 0,
    total: totalRes.count ?? 0,
  };
}