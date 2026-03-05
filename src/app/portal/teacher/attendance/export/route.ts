import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const me = await requireRole(["teacher"]);
  const { searchParams } = new URL(req.url);

  const assignmentId = Number(searchParams.get("assignmentId") ?? 0);
  const date = String(searchParams.get("date") ?? "");

  if (!assignmentId || !date) {
    return new NextResponse("Missing assignmentId or date", { status: 400 });
  }

  const sb = supabaseAdmin();

  // Verify teacher owns this assignment
  const { data: ta, error: taErr } = await sb
    .from("teacher_assignments")
    .select("id, term_id, class_id, subject_id, teacher_id")
    .eq("id", assignmentId)
    .eq("teacher_id", me.id)
    .maybeSingle();

  if (taErr) return new NextResponse(taErr.message, { status: 500 });
  if (!ta) return new NextResponse("Forbidden", { status: 403 });

  // Load session
  const { data: session, error: sessErr } = await sb
    .from("attendance_sessions")
    .select("id")
    .eq("assignment_id", assignmentId)
    .eq("session_date", date)
    .maybeSingle();

  if (sessErr) return new NextResponse(sessErr.message, { status: 500 });
  if (!session) return new NextResponse("No session for that date", { status: 404 });

  // Roster
  const { data: roster, error: rosterErr } = await sb
    .from("enrollments")
    .select("student_id, students:student_id ( full_name )")
    .eq("term_id", ta.term_id)
    .eq("class_id", ta.class_id);

  if (rosterErr) return new NextResponse(rosterErr.message, { status: 500 });

  // Marks
  const { data: marks, error: marksErr } = await sb
    .from("attendance_marks")
    .select("student_id, status")
    .eq("session_id", session.id);

  if (marksErr) return new NextResponse(marksErr.message, { status: 500 });

  const markMap = new Map<string, string>();
  (marks ?? []).forEach((m: any) => markMap.set(m.student_id, m.status));

  const rows = [["Student ID", "Student Name", "Status", "Date"]];
  for (const r of roster ?? []) {
    const name = (r.students as any)?.full_name ?? "Student";
    rows.push([r.student_id, name, markMap.get(r.student_id) ?? "", date]);
  }

  const csv = rows.map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(",")).join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="attendance_${assignmentId}_${date}.csv"`,
    },
  });
}