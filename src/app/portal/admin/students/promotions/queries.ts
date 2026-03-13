import "server-only";
import { requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function listTermsForPromotion() {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();

  const { data, error } = await sb
    .from("academic_terms")
    .select("id, name, is_active, starts_on, ends_on")
    .order("id", { ascending: false })
    .limit(100);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listClassesForPromotion() {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();

  const { data, error } = await sb
    .from("class_groups")
    .select("id, name, level, track_key, is_active")
    .eq("is_active", true)
    .order("level", { ascending: true })
    .order("name", { ascending: true })
    .limit(500);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listStudentsForPromotion(opts?: {
  q?: string;
  status?: string;
  schoolLevel?: string;
}) {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();

  let query = sb
    .from("students")
    .select(`
      id,
      full_name,
      student_no,
      class_level,
      school_level,
      stream,
      track,
      status,
      is_active
    `)
    .order("full_name", { ascending: true })
    .limit(500);

  const q = (opts?.q ?? "").trim();
  const status = (opts?.status ?? "").trim();
  const schoolLevel = (opts?.schoolLevel ?? "").trim();

  if (q) {
    query = query.or(
      [
        `full_name.ilike.%${q}%`,
        `student_no.ilike.%${q}%`,
      ].join(",")
    );
  }

  if (status) query = query.eq("status", status);
  if (schoolLevel) query = query.eq("school_level", schoolLevel);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return data ?? [];
}

export async function listEnrollmentsForTerm(termId: number) {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();

  if (!termId) return [];

  const { data, error } = await sb
    .from("enrollments")
    .select(`
      id,
      student_id,
      class_id,
      term_id,
      students:student_id (
        id,
        full_name,
        student_no,
        class_level,
        school_level,
        stream,
        status
      ),
      class_groups:class_id (
        id,
        name,
        level,
        track_key
      )
    `)
    .eq("term_id", termId)
    .order("id", { ascending: false })
    .limit(1000);

  if (error) throw new Error(error.message);
  return data ?? [];
}