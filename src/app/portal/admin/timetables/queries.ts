import "server-only";
import { requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function listTerms() {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("academic_terms")
    .select("id, name, is_active")
    .order("id", { ascending: false })
    .limit(100);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listClasses() {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("class_groups")
    .select("id, name, level, track_key, is_active")
    .eq("is_active", true)
    .order("name", { ascending: true })
    .limit(500);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listSubjects() {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("subjects")
    .select("id, name, code, track, is_active")
    .eq("is_active", true)
    .order("name", { ascending: true })
    .limit(1000);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listTeachers() {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("teachers")
    .select("id, full_name")
    .eq("is_active", true)
    .order("full_name", { ascending: true })
    .limit(1000);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listTimetableSlots(params: { termId: number; classId: number; day: string }) {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();

  if (!params.termId || !params.classId || !params.day) return [];

  const { data, error } = await sb
    .from("timetables")
    .select(
      `
      id,
      term_id,
      class_id,
      day_of_week,
      period_no,
      start_time,
      end_time,
      room,
      note,
      subject_id,
      teacher_id,
      subjects:subject_id ( id, name, code, track ),
      teachers:teacher_id ( id, full_name )
    `
    )
    .eq("term_id", params.termId)
    .eq("class_id", params.classId)
    .eq("day_of_week", params.day)
    .order("period_no", { ascending: true })
    .limit(300);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getSlotOrNull(id: number) {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();
  if (!id) return null;

  const { data, error } = await sb
    .from("timetables")
    .select(
      `
      id,
      term_id,
      class_id,
      day_of_week,
      period_no,
      start_time,
      end_time,
      room,
      note,
      subject_id,
      teacher_id
    `
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ?? null;
}