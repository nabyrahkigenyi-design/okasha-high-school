"use server";

import { requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { getAssignmentOrNull } from "./queries";

const VALID = new Set(["present", "absent", "late", "excused"]);

export async function ensureSession(formData: FormData) {
  const me = await requireRole(["teacher"]);
  const assignmentId = Number(formData.get("assignmentId"));
  const sessionDate = String(formData.get("sessionDate") ?? "");

  if (!assignmentId || !sessionDate) throw new Error("Missing assignment/date");

  const assignment = await getAssignmentOrNull(assignmentId);
  if (!assignment) throw new Error("Forbidden");

  const sb = supabaseAdmin();

  // upsert session for date
  const { data, error } = await sb
    .from("attendance_sessions")
    .upsert(
      { assignment_id: assignmentId, session_date: sessionDate, created_by: me.id },
      { onConflict: "assignment_id,session_date" }
    )
    .select("id")
    .maybeSingle();

  if (error) throw new Error(error.message);

  revalidatePath(`/portal/teacher/attendance?assignmentId=${assignmentId}`);
  return data?.id ?? null;
}

export async function saveMarks(formData: FormData) {
  const me = await requireRole(["teacher"]);
  const assignmentId = Number(formData.get("assignmentId"));
  const sessionId = Number(formData.get("sessionId"));

  if (!assignmentId || !sessionId) throw new Error("Missing session");

  const assignment = await getAssignmentOrNull(assignmentId);
  if (!assignment) throw new Error("Forbidden");

  const sb = supabaseAdmin();

  // form fields: status_<studentId>
  const rows: any[] = [];
  for (const [k, v] of formData.entries()) {
    if (!k.startsWith("status_")) continue;
    const studentId = k.replace("status_", "");
    const status = String(v);
    if (!VALID.has(status)) continue;
    rows.push({
      session_id: sessionId,
      student_id: studentId,
      status,
      marked_by: me.id,
      marked_at: new Date().toISOString(),
    });
  }

  if (rows.length === 0) return;

  const { error } = await sb
    .from("attendance_marks")
    .upsert(rows, { onConflict: "session_id,student_id" });

  if (error) throw new Error(error.message);

  revalidatePath(`/portal/teacher/attendance?assignmentId=${assignmentId}`);
}
