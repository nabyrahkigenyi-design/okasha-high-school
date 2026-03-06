import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getMyEnrollmentOrNull, getStudentOrThrow, one } from "@/app/portal/student/queries";

export async function GET(req: NextRequest) {
  const sb = supabaseAdmin();
  await getStudentOrThrow();

  const { searchParams } = new URL(req.url);
  const termId = Number(searchParams.get("termId") ?? 0);
  if (!termId) return new NextResponse("Missing termId", { status: 400 });

  const enrollment = await getMyEnrollmentOrNull(termId);
  const cg: any = one(enrollment?.class_groups);

  if (!enrollment?.class_id) return new NextResponse("Not enrolled for this term", { status: 400 });

  const { data, error } = await sb
    .from("timetables")
    .select(`
      day_of_week,
      period_no,
      starts_at,
      ends_at,
      room,
      note,
      subjects:subject_id ( name, code ),
      teachers:teacher_id ( full_name )
    `)
    .eq("term_id", termId)
    .eq("class_id", enrollment.class_id)
    .order("day_of_week", { ascending: true })
    .order("period_no", { ascending: true })
    .limit(5000);

  if (error) return new NextResponse(error.message, { status: 500 });

  const dayName = (n: number) =>
    n === 1 ? "Mon" : n === 2 ? "Tue" : n === 3 ? "Wed" : n === 4 ? "Thu" : n === 5 ? "Fri" : n === 6 ? "Sat" : "Sun";

  const rows: string[][] = [["Day", "Period", "Start", "End", "Subject", "Code", "Teacher", "Room", "Note"]];

  (data ?? []).forEach((x: any) => {
    const subj = (x.subjects as any) || {};
    const teacher = (x.teachers as any) || {};
    rows.push([
      dayName(Number(x.day_of_week)),
      String(x.period_no ?? ""),
      String(x.starts_at ?? "").slice(0, 5),
      String(x.ends_at ?? "").slice(0, 5),
      subj?.name ?? "",
      subj?.code ?? "",
      teacher?.full_name ?? "",
      x.room ?? "",
      x.note ?? "",
    ]);
  });

  const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const filename = `timetable_${cg?.name ?? enrollment.class_id}_term_${termId}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}