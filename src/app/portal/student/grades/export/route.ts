import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getStudentOrThrow } from "@/app/portal/student/queries";

export async function GET(req: NextRequest) {
  const sb = supabaseAdmin();
  const { searchParams } = new URL(req.url);

  const termId = Number(searchParams.get("termId") ?? 0);
  if (!termId) return new NextResponse("Missing termId", { status: 400 });

  const student = await getStudentOrThrow();

  const { data, error } = await sb
    .from("grades")
    .select("assessment, score, max_score, updated_at, subjects:subject_id ( name )")
    .eq("student_id", student.id)
    .eq("term_id", termId)
    .order("updated_at", { ascending: false })
    .limit(2000);

  if (error) return new NextResponse(error.message, { status: 500 });

  const rows = [["Subject", "Assessment", "Score", "Max Score", "Updated At"]];
  (data ?? []).forEach((g: any) => {
    const subjectName = (g.subjects as any)?.name ?? "Subject";
    rows.push([
      subjectName,
      g.assessment ?? "",
      g.score ?? "",
      g.max_score ?? "",
      g.updated_at ?? "",
    ]);
  });

  const csv = rows.map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(",")).join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="grades_${student.id}_${termId}.csv"`,
    },
  });
}