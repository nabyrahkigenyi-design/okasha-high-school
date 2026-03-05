import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getMyEnrollmentOrNull, getStudentOrThrow } from "@/app/portal/student/queries";

export async function GET(req: NextRequest) {
  const sb = supabaseAdmin();
  const { searchParams } = new URL(req.url);

  const termId = Number(searchParams.get("termId") ?? 0);
  if (!termId) return new NextResponse("Missing termId", { status: 400 });

  const student = await getStudentOrThrow();
  const enrollment = await getMyEnrollmentOrNull(termId);

  if (!enrollment?.class_id) return new NextResponse("Not enrolled for this term", { status: 400 });

  const { data: tas, error: taErr } = await sb
    .from("teacher_assignments")
    .select("id")
    .eq("term_id", termId)
    .eq("class_id", enrollment.class_id);

  if (taErr) return new NextResponse(taErr.message, { status: 500 });

  const assignmentIds = (tas ?? []).map((x: any) => x.id);
  if (assignmentIds.length === 0) {
    return new NextResponse("No attendance sessions for this term/class yet", { status: 404 });
  }

  const { data: sessions, error: sessErr } = await sb
    .from("attendance_sessions")
    .select("id, session_date, assignment_id")
    .in("assignment_id", assignmentIds);

  if (sessErr) return new NextResponse(sessErr.message, { status: 500 });

  const dateBySession = new Map<number, string>();
  (sessions ?? []).forEach((s: any) => dateBySession.set(s.id, s.session_date));

  const sessionIds = (sessions ?? []).map((s: any) => s.id);
  if (sessionIds.length === 0) return new NextResponse("No sessions found", { status: 404 });

  const { data: marks, error: marksErr } = await sb
    .from("attendance_marks")
    .select("session_id, status")
    .eq("student_id", student.id)
    .in("session_id", sessionIds);

  if (marksErr) return new NextResponse(marksErr.message, { status: 500 });

  const rows = [["Date", "Status"]];
  (marks ?? [])
    .map((m: any) => ({ date: dateBySession.get(m.session_id) ?? "", status: m.status }))
    .filter((r: any) => r.date)
    .sort((a: any, b: any) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
    .forEach((r: any) => rows.push([r.date, r.status]));

  const csv = rows.map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(",")).join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="attendance_${student.id}_${termId}.csv"`,
    },
  });
}