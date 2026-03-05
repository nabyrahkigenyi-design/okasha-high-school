import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const me = await requireRole(["teacher"]);
  const { searchParams } = new URL(req.url);

  const assignmentId = Number(searchParams.get("assignmentId") ?? 0);
  const assessment = String(searchParams.get("assessment") ?? "").trim();

  if (!assignmentId || !assessment) {
    return new NextResponse("Missing assignmentId or assessment", { status: 400 });
  }

  const sb = supabaseAdmin();

  // Verify scope
  const { data: ta, error: taErr } = await sb
    .from("teacher_assignments")
    .select("id, term_id, class_id, subject_id, teacher_id")
    .eq("id", assignmentId)
    .eq("teacher_id", me.id)
    .maybeSingle();

  if (taErr) return new NextResponse(taErr.message, { status: 500 });
  if (!ta) return new NextResponse("Forbidden", { status: 403 });

  // roster
  const { data: roster, error: rosterErr } = await sb
    .from("enrollments")
    .select("student_id, students:student_id ( full_name )")
    .eq("term_id", ta.term_id)
    .eq("class_id", ta.class_id);

  if (rosterErr) return new NextResponse(rosterErr.message, { status: 500 });

  // grades
  const { data: grades, error: gradesErr } = await sb
    .from("grades")
    .select("student_id, score, max_score, updated_at")
    .eq("term_id", ta.term_id)
    .eq("class_id", ta.class_id)
    .eq("subject_id", ta.subject_id)
    .eq("assessment", assessment);

  if (gradesErr) return new NextResponse(gradesErr.message, { status: 500 });

  const gMap = new Map<string, any>();
  (grades ?? []).forEach((g: any) => gMap.set(g.student_id, g));

  const rows = [["Student ID", "Student Name", "Assessment", "Score", "Max Score", "Updated At"]];
  for (const r of roster ?? []) {
    const name = (r.students as any)?.full_name ?? "Student";
    const g = gMap.get(r.student_id);
    rows.push([
      r.student_id,
      name,
      assessment,
      g?.score ?? "",
      g?.max_score ?? "",
      g?.updated_at ?? "",
    ]);
  }

  const csv = rows.map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(",")).join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="grades_${assignmentId}_${assessment.replace(/\s+/g, "_")}.csv"`,
    },
  });
}