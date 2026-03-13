import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getActiveTermOrNull, getEnrollmentOrNull, listMyChildren, one } from "../queries";

type Status = "present" | "absent" | "late" | "sick";

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border bg-white/70 p-4">
      <div className="text-xs font-semibold tracking-widest text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-bold text-[color:var(--ohs-charcoal)]">{value}</div>
      {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  children,
  right,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <section className="portal-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm portal-muted">{subtitle}</p> : null}
        </div>
        {right ? <div className="flex flex-wrap gap-2">{right}</div> : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function money(n: number) {
  return n.toLocaleString();
}

export default async function ParentDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ studentId?: string }>;
}) {
  const params = await searchParams;
  const sb = supabaseAdmin();

  const children = await listMyChildren();
  const term = await getActiveTermOrNull();

  const studentId = params.studentId ?? (children[0]?.id ?? "");
  const child = children.find((c) => c.id === studentId) ?? null;

  if (children.length === 0) {
    return (
      <div className="grid gap-6">
        <section className="portal-surface p-5">
          <h1 className="portal-title">Parent Dashboard</h1>
          <p className="portal-subtitle">No linked students found.</p>
        </section>

        <section className="portal-surface p-5 text-sm portal-muted">
          Ask the school administrator to link your parent account to your child.
        </section>
      </div>
    );
  }

  const termId = term?.id ?? null;
  const enrollment = termId ? await getEnrollmentOrNull(termId, studentId) : null;
  const cg: any = one(enrollment?.class_groups);
  const classId = enrollment?.class_id ?? null;

  let total = 0;
  let present = 0;
  let absent = 0;
  let late = 0;
  let sick = 0;

  let recentAttendance: { date: string; status: Status }[] = [];

  if (termId && classId) {
    const { data: tas } = await sb
      .from("teacher_assignments")
      .select("id")
      .eq("term_id", termId)
      .eq("class_id", classId);

    const assignmentIds = (tas ?? []).map((x: any) => x.id);

    if (assignmentIds.length > 0) {
      const { data: sessions } = await sb
        .from("attendance_sessions")
        .select("id, session_date")
        .in("assignment_id", assignmentIds)
        .order("session_date", { ascending: false })
        .limit(80);

      const dateBySession = new Map<number, string>();
      (sessions ?? []).forEach((s: any) => dateBySession.set(s.id, s.session_date));
      const sessionIds = (sessions ?? []).map((s: any) => s.id);

      if (sessionIds.length > 0) {
        const { data: marks } = await sb
          .from("attendance_marks")
          .select("session_id, status")
          .eq("student_id", studentId)
          .in("session_id", sessionIds);

        const rows = (marks ?? [])
          .map((m: any) => ({
            date: dateBySession.get(m.session_id) ?? "",
            status: String(m.status ?? "").toLowerCase().trim() as Status,
          }))
          .filter((r) => r.date)
          .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

        total = rows.length;
        present = rows.filter((r) => r.status === "present").length;
        absent = rows.filter((r) => r.status === "absent").length;
        late = rows.filter((r) => r.status === "late").length;
        sick = rows.filter((r) => r.status === "sick").length;

        recentAttendance = rows.slice(0, 5);
      }
    }
  }

  const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;

  const { data: grades } = termId
    ? await sb
        .from("grades")
        .select("id, assessment, score, max_score, updated_at, subjects:subject_id ( name )")
        .eq("student_id", studentId)
        .eq("term_id", termId)
        .order("updated_at", { ascending: false })
        .limit(6)
    : { data: [] as any[] };

  const gradeCount = grades?.length ?? 0;

  const { data: announcements } =
    termId && classId
      ? await sb
          .from("announcements")
          .select("id, title, body, created_at, is_global, class_id")
          .eq("term_id", termId)
          .or(`is_global.eq.true,class_id.eq.${classId}`)
          .order("created_at", { ascending: false })
          .limit(5)
      : { data: [] as any[] };

  const { data: expectedRow } =
    termId
      ? await sb
          .from("student_fee_expected_view")
          .select(`
            student_id,
            term_id,
            base_amount,
            fixed_adjustment_total,
            percent_adjustment_total,
            expected_amount
          `)
          .eq("student_id", studentId)
          .eq("term_id", termId)
          .maybeSingle()
      : { data: null as any };

  const { data: payments } =
    termId
      ? await sb
          .from("student_fee_payments")
          .select("amount_paid")
          .eq("student_id", studentId)
          .eq("term_id", termId)
      : { data: [] as any[] };

  const expectedAmount = Number(expectedRow?.expected_amount ?? 0);
  const totalPaid = (payments ?? []).reduce(
    (sum: number, row: any) => sum + Number(row.amount_paid ?? 0),
    0
  );
  const balanceDue = Math.max(expectedAmount - totalPaid, 0);
  const paymentRate = expectedAmount > 0 ? Math.round((totalPaid / expectedAmount) * 100) : 0;

  return (
    <div className="grid gap-6">
      <section className="portal-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="portal-title">Parent Dashboard</h1>
            <p className="portal-subtitle">
              {term ? `Active term: ${term.name}.` : "No active term set yet."}
            </p>
          </div>

          <form method="get" className="flex flex-wrap items-end gap-2">
            <label className="grid gap-1">
              <span className="text-sm">Child</span>
              <select className="portal-select" name="studentId" defaultValue={studentId}>
                {children.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name}
                  </option>
                ))}
              </select>
            </label>
            <button className="portal-btn portal-btn-primary" type="submit">
              View
            </button>
          </form>
        </div>

        {child ? (
          <div className="mt-4 rounded-xl border bg-white/70 p-4">
            <div className="font-medium text-[color:var(--ohs-charcoal)]">{child.full_name}</div>
            <div className="mt-1 text-xs text-slate-500">
              {child.student_no ? `Student ID: ${child.student_no}` : ""}
              {child.class_level ? ` • Level: ${child.class_level}` : ""}
              {child.stream ? ` • Stream: ${child.stream}` : ""}
              {child.track ? ` • Track: ${child.track}` : ""}
              {classId ? ` • Class: ${cg?.name ?? classId}` : " • Not enrolled this term"}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <Link className="portal-btn" href={`/portal/parent/attendance?studentId=${studentId}`}>
                Attendance
              </Link>
              <Link className="portal-btn" href={`/portal/parent/grades?studentId=${studentId}`}>
                Grades
              </Link>
              <Link className="portal-btn" href={`/portal/parent/finance?studentId=${studentId}`}>
                School Fees
              </Link>
              <Link className="portal-btn" href="/portal/parent/children">
                Children
              </Link>
            </div>
          </div>
        ) : null}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Attendance rate" value={`${attendanceRate}%`} hint={`${present} present records`} />
        <StatCard label="Present" value={present} />
        <StatCard label="Absent" value={absent} />
        <StatCard label="Late / Sick" value={`${late} / ${sick}`} />
        <StatCard
          label="Fees progress"
          value={expectedAmount > 0 ? `${paymentRate}%` : "0%"}
          hint={expectedAmount > 0 ? `${money(balanceDue)} balance` : "No fee setup yet"}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard
          title="Attendance summary"
          subtitle="Most recent attendance marks for this child."
          right={
            <Link className="portal-btn" href={`/portal/parent/attendance?studentId=${studentId}`}>
              View all
            </Link>
          }
        >
          {recentAttendance.length === 0 ? (
            <div className="text-sm portal-muted">No attendance marks yet.</div>
          ) : (
            <div className="grid gap-2">
              {recentAttendance.map((r, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border bg-white/70 p-3 flex items-center justify-between gap-2"
                >
                  <div className="text-sm font-medium">{r.date}</div>
                  <span className="portal-badge">{r.status}</span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Latest grades"
          subtitle="Recently updated grades for this child."
          right={
            <Link className="portal-btn" href={`/portal/parent/grades?studentId=${studentId}`}>
              View all
            </Link>
          }
        >
          {(grades ?? []).length === 0 ? (
            <div className="text-sm portal-muted">No grades yet.</div>
          ) : (
            <div className="grid gap-2">
              {(grades ?? []).map((g: any) => {
                const subjectName = (g.subjects as any)?.name ?? "Subject";
                return (
                  <div key={g.id} className="rounded-xl border bg-white/70 p-3">
                    <div className="text-sm font-semibold truncate">
                      {subjectName} • {g.assessment}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {g.updated_at ? new Date(g.updated_at).toLocaleString() : ""}
                    </div>
                    <div className="mt-2">
                      <span className="portal-badge">
                        {g.score ?? "—"} / {g.max_score ?? "—"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard
          title="School fees"
          subtitle="Current term fee position for this child."
          right={
            <Link className="portal-btn" href={`/portal/parent/finance?studentId=${studentId}`}>
              Open fees
            </Link>
          }
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label="Expected" value={expectedAmount > 0 ? money(expectedAmount) : "0"} />
            <StatCard label="Paid" value={totalPaid > 0 ? money(totalPaid) : "0"} />
            <StatCard label="Balance" value={balanceDue > 0 ? money(balanceDue) : "0"} />
          </div>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-[color:var(--ohs-dark-green)]"
              style={{ width: `${Math.max(0, Math.min(paymentRate, 100))}%` }}
            />
          </div>

          <div className="mt-2 text-xs text-slate-500">
            {expectedAmount > 0
              ? `${paymentRate}% of the current term fees has been paid.`
              : "No fee structure has been applied yet for this child in the selected term."}
          </div>
        </SectionCard>

        <SectionCard title="Announcements" subtitle="Latest school and class notices relevant to this child.">
          {(announcements ?? []).length === 0 ? (
            <div className="text-sm portal-muted">No announcements yet.</div>
          ) : (
            <div className="grid gap-3">
              {(announcements ?? []).map((a: any) => (
                <div key={a.id} className="rounded-xl border bg-white/70 p-4">
                  <div className="text-sm font-semibold text-[color:var(--ohs-charcoal)]">
                    {a.title}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {a.created_at ? new Date(a.created_at).toLocaleDateString() : ""}
                    {a.is_global ? " • School-wide" : " • Class notice"}
                  </div>
                  <div className="mt-2 text-sm text-slate-700 whitespace-pre-wrap line-clamp-4">
                    {a.body}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <section className="portal-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Quick child overview</h2>
            <p className="mt-1 text-sm portal-muted">
              A simple summary of the current school term for this child.
            </p>
          </div>

          <span className="portal-badge">
            {gradeCount} recent grade record{gradeCount === 1 ? "" : "s"}
          </span>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border bg-white/70 p-4">
            <div className="text-sm font-semibold text-slate-900">Class</div>
            <div className="mt-2 text-sm text-slate-700">{cg?.name ?? "Not enrolled yet"}</div>
          </div>

          <div className="rounded-2xl border bg-white/70 p-4">
            <div className="text-sm font-semibold text-slate-900">School placement</div>
            <div className="mt-2 text-sm text-slate-700">
              {[child?.school_level, child?.class_level, child?.stream ? `Stream ${child.stream}` : null]
                .filter(Boolean)
                .join(" • ") || "Not set"}
            </div>
          </div>

          <div className="rounded-2xl border bg-white/70 p-4">
            <div className="text-sm font-semibold text-slate-900">Attendance records</div>
            <div className="mt-2 text-sm text-slate-700">{total}</div>
          </div>

          <div className="rounded-2xl border bg-white/70 p-4">
            <div className="text-sm font-semibold text-slate-900">Outstanding fees</div>
            <div className="mt-2 text-sm text-slate-700">{money(balanceDue)}</div>
          </div>
        </div>
      </section>
    </div>
  );
}