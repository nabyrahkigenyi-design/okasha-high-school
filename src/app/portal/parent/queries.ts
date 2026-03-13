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

  const { data, error } = await sb
    .from("parents")
    .select("id, full_name, phone, is_active")
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
    .select(`
      student_id,
      relation,
      students:student_id (
        id,
        full_name,
        student_no,
        admission_no,
        track,
        class_level,
        school_level,
        stream,
        status,
        is_active,
        photo_url
      )
    `)
    .eq("parent_id", parent.id)
    .limit(50);

  if (error) throw new Error(error.message);

  return (data ?? [])
    .map((r: any) => {
      const s = r.students;
      if (!s) return null;

      return {
        id: s.id,
        full_name: s.full_name ?? "Student",
        student_no: s.student_no ?? null,
        admission_no: s.admission_no ?? null,
        track: s.track ?? null,
        class_level: s.class_level ?? null,
        school_level: s.school_level ?? null,
        stream: s.stream ?? null,
        status: s.status ?? null,
        photo_url: s.photo_url ?? null,
        relation: r.relation ?? null,
        is_active: s.is_active ?? true,
      };
    })
    .filter(Boolean) as Array<{
      id: string;
      full_name: string;
      student_no: string | null;
      admission_no: string | null;
      track: string | null;
      class_level: string | null;
      school_level: string | null;
      stream: string | null;
      status: string | null;
      photo_url: string | null;
      relation: string | null;
      is_active: boolean;
    }>;
}

export async function getChildByIdForParent(studentId: string) {
  const children = await listMyChildren();
  return children.find((c) => c.id === studentId) ?? null;
}

export async function getActiveTermOrNull() {
  const sb = supabaseAdmin();

  const { data, error } = await sb
    .from("academic_terms")
    .select("id, name, starts_on, ends_on, is_active")
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
    .select(`
      id,
      term_id,
      class_id,
      class_groups:class_id ( id, name, level, track_key )
    `)
    .eq("term_id", termId)
    .eq("student_id", studentId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ?? null;
}