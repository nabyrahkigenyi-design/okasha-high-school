"use server";

import { requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { getAssignmentOrNull, getSession } from "./queries";

const VALID = new Set(["present", "absent", "late", "sick"]);

export async function ensureSession(formData: FormData) {
  const me = await requireRole(["teacher"]);
  const assignmentId = Number(formData.get("assignmentId"));
  const sessionDate = String(formData.get("sessionDate") ?? "");

  if (!assignmentId || !sessionDate) throw new Error("Missing assignment/date");

  const assignment = await getAssignmentOrNull(assignmentId);
  if (!assignment) throw new Error("Forbidden");

  const sb = supabaseAdmin();

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

  const { data: sessionRow, error: sessErr } = await sb
    .from("attendance_sessions")
    .select("id, finalized_at")
    .eq("id", sessionId)
    .maybeSingle();

  if (sessErr) throw new Error(sessErr.message);
  if (sessionRow?.finalized_at) throw new Error("Session finalized");

  const rows: any[] = [];
  for (const [k, v] of formData.entries()) {
    if (!k.startsWith("status_")) continue;
    const studentId = k.replace("status_", "");
    const status = String(v).toLowerCase().trim();
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

export async function finalizeSession(formData: FormData) {
  const me = await requireRole(["teacher"]);
  const assignmentId = Number(formData.get("assignmentId"));
  const sessionId = Number(formData.get("sessionId"));

  if (!assignmentId || !sessionId) throw new Error("Missing session");

  const assignment = await getAssignmentOrNull(assignmentId);
  if (!assignment) throw new Error("Forbidden");

  const sb = supabaseAdmin();

  const { data: session, error: sessErr } = await sb
    .from("attendance_sessions")
    .select("id, finalized_at")
    .eq("id", sessionId)
    .eq("assignment_id", assignmentId)
    .maybeSingle();

  if (sessErr) throw new Error(sessErr.message);
  if (!session) throw new Error("Session not found");
  if (session.finalized_at) return;

  const { error } = await sb
    .from("attendance_sessions")
    .update({ finalized_at: new Date().toISOString(), finalized_by: me.id })
    .eq("id", sessionId);

  if (error) throw new Error(error.message);

  revalidatePath(`/portal/teacher/attendance?assignmentId=${assignmentId}`);
}