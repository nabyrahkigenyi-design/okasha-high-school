import "server-only";
import { requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";

type Rel<T> = T | T[] | null | undefined;
export function one<T>(v: Rel<T>): T | null {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

export async function getParentOrThrow() {
  const me: any = await requireRole(["parent"]);
  const sb = supabaseAdmin();

  // Your parents table has NO user_id column.
  // So the canonical mapping is: parents.id === profiles.id (me.id)
  const { data, error } = await sb
    .from("parents")
    .select("id, full_name, is_active")
    .eq("id", me.id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data?.id) throw new Error("Parent profile not found");

  return data;
}

export async function listMyChildren() {
  const parent = await getParentOrThrow();
  const sb = supabaseAdmin();

  const { data, error } = await sb
    .from("parent_students")
    .select("student_id, students:student_id ( id, full_name, admission_no, track, class_level, is_active )")
    .eq("parent_id", parent.id)
    .limit(50);

  if (error) throw new Error(error.message);

  return (data ?? [])
    .map((r: any) => r.students)
    .filter(Boolean)
    .map((s: any) => ({
      id: s.id,
      full_name: s.full_name ?? "Student",
      admission_no: s.admission_no ?? null,
      track: s.track ?? null,
      class_level: s.class_level ?? null,
      is_active: s.is_active ?? true,
    }));
}

export async function getActiveTermOrNull() {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("academic_terms")
    .select("id, name, is_active")
    .eq("is_active", true)
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ?? null;
}

export async function getEnrollmentOrNull(termId: number, studentId: string) {
  const sb = supabaseAdmin();

  const { data, error } = await sb
    .from("enrollments")
    .select("id, term_id, class_id, class_groups:class_id ( id, name, level, track_key )")
    .eq("term_id", termId)
    .eq("student_id", studentId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ?? null;
}