import "server-only";
import { supabaseServer } from "@/lib/supabase/server";
import { requireRole } from "@/lib/rbac";

export async function getTeacherAssignments() {
  await requireRole(["teacher"]);

  const sb = supabaseServer();

  // 1️⃣ Get logged-in user
  const {
    data: { user },
  } = await sb.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  // 2️⃣ Get teacher record linked to auth user
  const { data: teacher, error: teacherError } = await sb
    .from("teachers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (teacherError || !teacher)
    throw new Error("Teacher profile not found");

  // 3️⃣ Fetch assignments
  const { data, error } = await sb
    .from("teacher_assignments")
    .select(`
      id,
      academic_terms:term_id ( id, name ),
      class_groups:class_id ( id, name ),
      subjects:subject_id ( id, name, code )
    `)
    .eq("teacher_id", teacher.id)
    .order("id", { ascending: false });

  if (error) throw new Error(error.message);

  return data ?? [];
}
