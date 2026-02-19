import { requireRole } from "@/lib/rbac";
import { supabaseServer } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ assignmentId: string }> }
) {
  const me = await requireRole(["teacher"]);
  const supabase = await supabaseServer();

  const { assignmentId } = await context.params;
  const assignmentIdNum = Number(assignmentId);

  const formData = await req.formData();

  const { data: assignment } = await supabase
    .from("teaching_assignments")
    .select("*")
    .eq("id", assignmentIdNum)
    .eq("teacher_id", me.id)
    .single();

  // If not assigned, go back to dashboard
  if (!assignment) {
    return NextResponse.redirect(new URL("/portal/teacher/dashboard", req.url));
  }

  const today = new Date().toISOString().split("T")[0];

  const records: any[] = [];

  for (const [key, value] of formData.entries()) {
    if (key.startsWith("status_")) {
      const studentId = key.replace("status_", "");

      records.push({
        student_id: studentId,
        class_id: assignment.class_id,
        term_id: assignment.term_id,
        attended_on: today,
        status: String(value),
        marked_by: me.id,
      });
    }
  }

  if (records.length > 0) {
    await supabase.from("attendance").insert(records);
  }

  return NextResponse.redirect(
    new URL(`/portal/teacher/attendance/${assignmentIdNum}`, req.url)
  );
}
