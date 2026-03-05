import "server-only";
import { requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";

export async function getStudentOrThrow() {
  const me: any = await requireRole(["student"]);
  const sb = supabaseAdmin();

  // 1) Try students.id = profiles.id (common pattern in your project)
  const { data: byId, error: byIdErr } = await sb
    .from("students")
    .select("id, user_id, admission_no, full_name, is_active, track, class_level")
    .eq("id", me.id)
    .maybeSingle();

  if (byIdErr) throw new Error(byIdErr.message);
  if (byId?.id) return byId;

  // 2) Try students.user_id = profile.user_id (if your requireRole returns user_id)
  if (me.user_id) {
    const { data: byUserId, error: byUserIdErr } = await sb
      .from("students")
      .select("id, user_id, admission_no, full_name, is_active, track, class_level")
      .eq("user_id", me.user_id)
      .maybeSingle();

    if (byUserIdErr) throw new Error(byUserIdErr.message);
    if (byUserId?.id) return byUserId;
  }

  // 3) Fallback: try auth.getUser() but DO NOT throw if missing
  try {
    const sbServer = await supabaseServer();
    const {
      data: { user },
    } = await sbServer.auth.getUser();

    if (user?.id) {
      const { data: byAuth, error: byAuthErr } = await sb
        .from("students")
        .select("id, user_id, admission_no, full_name, is_active, track, class_level")
        .eq("user_id", user.id)
        .maybeSingle();

      if (byAuthErr) throw new Error(byAuthErr.message);
      if (byAuth?.id) return byAuth;
    }
  } catch {
    // ignore: some setups won’t expose the session here
  }

  throw new Error("Student profile not found");
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

type Rel<T> = T | T[] | null | undefined;
export function one<T>(v: Rel<T>): T | null {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

export async function getMyEnrollmentOrNull(termId: number) {
  const student = await getStudentOrThrow();
  const sb = supabaseAdmin();

  const { data, error } = await sb
    .from("enrollments")
    .select(
      `
      id,
      term_id,
      class_id,
      class_groups:class_id ( id, name, level, track_key )
    `
    )
    .eq("term_id", termId)
    .eq("student_id", student.id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ?? null;
}