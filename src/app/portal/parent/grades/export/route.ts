import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getParentOrThrow, listMyChildren } from "@/app/portal/parent/queries";

export async function GET(req: NextRequest) {
  const sb = supabaseAdmin();
  await getParentOrThrow();

  const { searchParams } = new URL(req.url);
  const studentId = String(searchParams.get("studentId") ?? "");
  const termId = Number(searchParams.get("termId") ?? 0);

  if (!studentId || !termId) return new NextResponse("Missing studentId or termId", { status: 400 });

  // Verify child belongs to parent
  const children = await listMyChildren();
  if (!children.some((c) => c.id === studentId)) return new NextResponse("Forbidden", { status: 403 });

  const { data, error } = await sb
    .from("grades")
    .select("assessment, score, max_score, updated_at, subjects:subject_id ( name )")
    .eq("student_id", studentId)
    .eq("term_id", termId)
    .order("updated_at", { ascending: false })
    .limit(5000);

  if (error) return new NextResponse(error.message, { status: 500 });

  const rows = [["Subject", "Assessment", "Score", "Max Score", "Updated At"]];
  (data ?? []).forEach((g: any) => {
    const subjectName = (g.subjects as any)?.name ?? "Subject";
    rows.push([subjectName, g.assessment ?? "", g.score ?? "", g.max_score ?? "", g.updated_at ?? ""]);
  });

  const csv = rows.map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(",")).join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="grades_${studentId}_${termId}.csv"`,
    },
  });
}