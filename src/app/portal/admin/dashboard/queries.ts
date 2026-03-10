import "server-only";
import { requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";

type TrackKey = "secular" | "islamic";

function dayRank(day: string | null | undefined) {
  const value = String(day ?? "").toLowerCase().trim();

  if (["1", "mon", "monday"].includes(value)) return 1;
  if (["2", "tue", "tues", "tuesday"].includes(value)) return 2;
  if (["3", "wed", "wednesday"].includes(value)) return 3;
  if (["4", "thu", "thur", "thurs", "thursday"].includes(value)) return 4;
  if (["5", "fri", "friday"].includes(value)) return 5;
  if (["6", "sat", "saturday"].includes(value)) return 6;
  if (["7", "sun", "sunday"].includes(value)) return 7;

  return 99;
}

function dayLabel(day: string | null | undefined) {
  const rank = dayRank(day);

  if (rank === 1) return "Mon";
  if (rank === 2) return "Tue";
  if (rank === 3) return "Wed";
  if (rank === 4) return "Thu";
  if (rank === 5) return "Fri";
  if (rank === 6) return "Sat";
  if (rank === 7) return "Sun";

  return String(day ?? "");
}

export async function getTeacherCount() {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();

  const { count, error } = await sb
    .from("teachers")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true);

  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function getStudentCount() {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();

  const { count, error } = await sb
    .from("students")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true);

  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function getParentCount() {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();

  const { count, error } = await sb
    .from("parents")
    .select("id", { count: "exact", head: true });

  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function getActiveTerm() {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();

  const { data, error } = await sb
    .from("academic_terms")
    .select("id, name, starts_on, ends_on, is_active, is_current")
    .eq("is_active", true)
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ?? null;
}

export async function getActiveClassCount() {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();

  const { count, error } = await sb
    .from("class_groups")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true);

  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function getAttendanceSummaryForDate(attendedOn: string, termId?: number | null) {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();

  const { data: sessions, error: sessionsError } = await sb
    .from("attendance_sessions")
    .select(`
      id,
      assignment_id,
      session_date,
      assignments:assignment_id (
        id,
        term_id,
        class_id,
        subject_id
      )
    `)
    .eq("session_date", attendedOn);

  if (sessionsError) throw new Error(sessionsError.message);

  const filteredSessions = (sessions ?? []).filter((session: any) => {
    if (!termId) return true;
    return session.assignments?.term_id === termId;
  });

  if (filteredSessions.length === 0) {
    return {
      present: 0,
      absent: 0,
      late: 0,
      sick: 0,
      totalMarked: 0,
    };
  }

  const sessionIds = filteredSessions.map((session: any) => session.id);

  const { data: marks, error: marksError } = await sb
    .from("attendance_marks")
    .select("session_id, student_id, status")
    .in("session_id", sessionIds);

  if (marksError) throw new Error(marksError.message);

  let present = 0;
  let absent = 0;
  let late = 0;
  let sick = 0;

  for (const mark of marks ?? []) {
    const status = String(mark.status ?? "").toLowerCase().trim();

    if (status === "present") present += 1;
    else if (status === "absent") absent += 1;
    else if (status === "late") late += 1;
    else if (status === "sick") sick += 1;
  }

  return {
    present,
    absent,
    late,
    sick,
    totalMarked: present + absent + late + sick,
  };
}

export async function listRecentAnnouncements(limit = 5) {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();

  const { data, error } = await sb
    .from("announcements")
    .select(`
      id,
      title,
      body,
      term_id,
      class_id,
      created_at,
      academic_terms:term_id ( id, name ),
      class_groups:class_id ( id, name, level, track_key )
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getEnrollmentByClass(termId: number) {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();

  const { data: classes, error: classError } = await sb
    .from("class_groups")
    .select("id, name, level, track_key, is_active")
    .eq("is_active", true)
    .order("level", { ascending: true })
    .order("name", { ascending: true });

  if (classError) throw new Error(classError.message);

  const rows = await Promise.all(
    (classes ?? []).map(async (cls) => {
      const { count, error } = await sb
        .from("enrollments")
        .select("id", { count: "exact", head: true })
        .eq("term_id", termId)
        .eq("class_id", cls.id);

      if (error) throw new Error(error.message);

      return {
        id: cls.id,
        name: cls.name,
        level: cls.level,
        track_key: cls.track_key as TrackKey,
        is_active: cls.is_active,
        enrolled_count: count ?? 0,
      };
    })
  );

  return rows;
}

export async function listWeeklyTimetableForTerm(termId: number) {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();

  if (!termId) return [];

  const { data, error } = await sb
    .from("timetables")
    .select(`
      id,
      term_id,
      class_id,
      subject_id,
      teacher_id,
      day_of_week,
      period_no,
      start_time,
      end_time,
      room,
      note,
      class_groups:class_id ( id, name, level, track_key ),
      subjects:subject_id ( id, name, code, track ),
      teachers:teacher_id ( id, full_name )
    `)
    .eq("term_id", termId)
    .order("period_no", { ascending: true })
    .limit(1000);

  if (error) throw new Error(error.message);

  const rows = (data ?? []).map((row: any) => ({
    id: row.id,
    term_id: row.term_id,
    class_id: row.class_id,
    subject_id: row.subject_id,
    teacher_id: row.teacher_id,
    day_of_week: row.day_of_week,
    day_label: dayLabel(row.day_of_week),
    day_rank: dayRank(row.day_of_week),
    period_no: row.period_no,
    start_time: row.start_time,
    end_time: row.end_time,
    room: row.room,
    note: row.note,
    class_groups: row.class_groups,
    subjects: row.subjects,
    teachers: row.teachers,
  }));

  rows.sort((a, b) => {
    if (a.day_rank !== b.day_rank) return a.day_rank - b.day_rank;

    if ((a.period_no ?? 0) !== (b.period_no ?? 0)) {
      return (a.period_no ?? 0) - (b.period_no ?? 0);
    }

    const aClass = a.class_groups?.name ?? "";
    const bClass = b.class_groups?.name ?? "";
    return aClass.localeCompare(bClass);
  });

  return rows;
}

export async function getSchoolDashboardSnapshot() {
  await requireRole(["admin"]);

  const activeTerm = await getActiveTerm();
  const today = new Date().toISOString().slice(0, 10);

  const [
    teacherCount,
    studentCount,
    parentCount,
    classCount,
    announcements,
    attendanceSummary,
    enrollmentByClass,
    weeklyTimetable,
  ] = await Promise.all([
    getTeacherCount(),
    getStudentCount(),
    getParentCount(),
    getActiveClassCount(),
    listRecentAnnouncements(6),
    getAttendanceSummaryForDate(today, activeTerm?.id ?? null),
    activeTerm ? getEnrollmentByClass(activeTerm.id) : Promise.resolve([]),
    activeTerm ? listWeeklyTimetableForTerm(activeTerm.id) : Promise.resolve([]),
  ]);

  return {
    today,
    activeTerm,
    teacherCount,
    studentCount,
    parentCount,
    classCount,
    attendanceSummary,
    announcements,
    enrollmentByClass,
    weeklyTimetable,
  };
}