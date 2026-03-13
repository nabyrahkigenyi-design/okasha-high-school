import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  getActiveTermOrNull,
  getEnrollmentOrNull,
  getParentOrThrow,
  listMyChildren,
  one,
} from "@/app/portal/parent/queries";

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

export default async function ParentFinancePage({
  searchParams,
}: {
  searchParams: Promise<{ studentId?: string; termId?: string }>;
}) {
  const params = await searchParams;
  const sb = supabaseAdmin();

  await getParentOrThrow();
  const children = await listMyChildren();

  const studentId = params.studentId ?? (children[0]?.id ?? "");
  const student = children.find((c) => c.id === studentId) ?? null;

  const { data: terms, error: termErr } = await sb
    .from("academic_terms")
    .select("id, name, is_active")
    .order("id", { ascending: false })
    .limit(50);

  if (termErr) throw new Error(termErr.message);

  const activeTerm = await getActiveTermOrNull();
  const termId =
    params.termId ? Number(params.termId) : activeTerm?.id ?? terms?.[0]?.id ?? null;

  if (!studentId || !student) {
    return (
      <div className="grid gap-6">
        <section className="portal-surface p-5">
          <h1 className="portal-title">School Fees</h1>
          <p className="portal-subtitle">No linked students found.</p>
        </section>

        <section className="portal-surface p-5 text-sm portal-muted">
          Ask the school administrator to link your parent account to your child.
        </section>
      </div>
    );
  }

  if (!termId) {
    return (
      <div className="portal-surface p-5">
        <h1 className="portal-title">School Fees</h1>
        <p className="portal-subtitle">No academic terms found.</p>
      </div>
    );
  }

  const enrollment = await getEnrollmentOrNull(termId, studentId);
  const cg: any = one(enrollment?.class_groups);
  const termName = terms?.find((t: any) => t.id === termId)?.name ?? `Term ${termId}`;

  const { data: expectedRow, error: expectedErr } = await sb
    .from("student_fee_expected_view")
    .select(`
      student_id,
      full_name,
      student_no,
      school_level,
      class_level,
      stream,
      status,
      term_id,
      base_amount,
      fixed_adjustment_total,
      percent_adjustment_total,
      expected_amount
    `)
    .eq("student_id", studentId)
    .eq("term_id", termId)
    .maybeSingle();

  if (expectedErr) throw new Error(expectedErr.message);

  const { data: payments, error: paymentsErr } = await sb
    .from("student_fee_payments")
    .select(`
      id,
      student_id,
      term_id,
      amount_paid,
      payment_date,
      payment_method,
      reference_no,
      notes,
      recorded_by,
      created_at
    `)
    .eq("student_id", studentId)
    .eq("term_id", termId)
    .order("payment_date", { ascending: false })
    .order("id", { ascending: false });

  if (paymentsErr) throw new Error(paymentsErr.message);

  const { data: adjustments, error: adjustmentsErr } = await sb
    .from("student_fee_adjustments")
    .select(`
      id,
      student_id,
      term_id,
      adjustment_kind,
      value_type,
      value,
      reason,
      notes,
      created_at,
      updated_at
    `)
    .eq("student_id", studentId)
    .eq("term_id", termId)
    .order("id", { ascending: false });

  if (adjustmentsErr) throw new Error(adjustmentsErr.message);

  const expectedAmount = Number(expectedRow?.expected_amount ?? 0);
  const baseAmount = Number(expectedRow?.base_amount ?? 0);
  const fixedAdjustments = Number(expectedRow?.fixed_adjustment_total ?? 0);
  const percentAdjustments = Number(expectedRow?.percent_adjustment_total ?? 0);

  const paidAmount = (payments ?? []).reduce(
    (sum: number, row: any) => sum + Number(row.amount_paid ?? 0),
    0
  );

  const balanceDue = Math.max(expectedAmount - paidAmount, 0);
  const paymentRate = expectedAmount > 0 ? Math.round((paidAmount / expectedAmount) * 100) : 0;

  return (
    <div className="grid gap-6">
      <section className="portal-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="portal-title">School Fees</h1>
            <p className="portal-subtitle">
              Child: <span className="font-medium">{student.full_name}</span> • Term:{" "}
              <span className="font-medium">{termName}</span>
              {enrollment?.class_id ? (
                <>
                  {" • "}Class: <span className="font-medium">{cg?.name ?? enrollment.class_id}</span>
                </>
              ) : (
                <> • Not enrolled for this term</>
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link className="portal-btn" href={`/portal/parent/dashboard?studentId=${studentId}`}>
              Dashboard
            </Link>
          </div>
        </div>

        <form method="get" className="mt-4 grid gap-3 md:grid-cols-[1fr_220px_auto]">
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

          <label className="grid gap-1">
            <span className="text-sm">Term</span>
            <select className="portal-select" name="termId" defaultValue={String(termId)}>
              {(terms ?? []).map((t: any) => (
                <option key={t.id} value={t.id}>
                  {t.name} {t.is_active ? "(active)" : ""}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-end">
            <button className="portal-btn portal-btn-primary" type="submit">
              Apply
            </button>
          </div>
        </form>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Expected" value={expectedAmount > 0 ? money(expectedAmount) : "0"} />
        <StatCard label="Paid" value={paidAmount > 0 ? money(paidAmount) : "0"} />
        <StatCard label="Balance" value={balanceDue > 0 ? money(balanceDue) : "0"} />
        <StatCard
          label="Progress"
          value={expectedAmount > 0 ? `${paymentRate}%` : "0%"}
          hint={expectedAmount > 0 ? "Fees cleared so far" : "No fee setup yet"}
        />
      </section>

      <SectionCard title="Fee summary" subtitle="Current term fee position for this child.">
        {expectedAmount <= 0 ? (
          <div className="text-sm portal-muted">
            No fee structure has been applied yet for this child in the selected term.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border bg-white/70 p-4">
              <div className="text-sm font-semibold text-slate-900">Base fees</div>
              <div className="mt-2 text-sm text-slate-700">{money(baseAmount)}</div>
            </div>

            <div className="rounded-2xl border bg-white/70 p-4">
              <div className="text-sm font-semibold text-slate-900">Fixed adjustments</div>
              <div className="mt-2 text-sm text-slate-700">{money(fixedAdjustments)}</div>
            </div>

            <div className="rounded-2xl border bg-white/70 p-4">
              <div className="text-sm font-semibold text-slate-900">Percent adjustments</div>
              <div className="mt-2 text-sm text-slate-700">{percentAdjustments}%</div>
            </div>

            <div className="rounded-2xl border bg-white/70 p-4">
              <div className="text-sm font-semibold text-slate-900">Final expected</div>
              <div className="mt-2 text-sm text-slate-700">{money(expectedAmount)}</div>
            </div>
          </div>
        )}

        {expectedAmount > 0 ? (
          <>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-[color:var(--ohs-dark-green)]"
                style={{ width: `${Math.max(0, Math.min(paymentRate, 100))}%` }}
              />
            </div>

            <div className="mt-2 text-xs text-slate-500">
              {paymentRate}% of the current term fees has been paid.
            </div>
          </>
        ) : null}
      </SectionCard>

      <SectionCard
        title="Payment history"
        subtitle="Recorded payments for this child in the selected term."
        right={
          <span className="portal-badge">
            {(payments ?? []).length} record{(payments ?? []).length === 1 ? "" : "s"}
          </span>
        }
      >
        {(payments ?? []).length === 0 ? (
          <div className="text-sm portal-muted">No payments recorded yet for this term.</div>
        ) : (
          <div className="grid gap-3">
            {(payments ?? []).map((p: any) => (
              <div key={p.id} className="rounded-2xl border bg-white/70 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-[color:var(--ohs-charcoal)]">
                      {money(Number(p.amount_paid ?? 0))}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {p.payment_date ? `Payment date: ${p.payment_date}` : ""}
                      {p.payment_method ? ` • Method: ${p.payment_method}` : ""}
                      {p.reference_no ? ` • Ref: ${p.reference_no}` : ""}
                    </div>
                    {!p.payment_date && p.created_at ? (
                      <div className="mt-1 text-xs text-slate-500">
                        Recorded: {new Date(p.created_at).toLocaleString()}
                      </div>
                    ) : null}
                  </div>

                  <span className="portal-badge">Payment</span>
                </div>

                {p.notes ? (
                  <div className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">
                    {p.notes}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Adjustments"
        subtitle="Discounts, scholarships, or other fee changes applied to this child."
        right={
          <span className="portal-badge">
            {(adjustments ?? []).length} item{(adjustments ?? []).length === 1 ? "" : "s"}
          </span>
        }
      >
        {(adjustments ?? []).length === 0 ? (
          <div className="text-sm portal-muted">No adjustments recorded for this term.</div>
        ) : (
          <div className="grid gap-3">
            {(adjustments ?? []).map((a: any) => (
              <div key={a.id} className="rounded-2xl border bg-white/70 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-[color:var(--ohs-charcoal)]">
                      {a.adjustment_kind ?? "Adjustment"}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {a.value_type ? `Type: ${a.value_type}` : ""}
                      {a.value != null ? ` • Value: ${a.value}` : ""}
                      {a.reason ? ` • Reason: ${a.reason}` : ""}
                    </div>
                  </div>

                  <span className="portal-badge">Adjustment</span>
                </div>

                {a.notes ? (
                  <div className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">
                    {a.notes}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}