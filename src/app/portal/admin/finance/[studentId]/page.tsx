import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { WatermarkedSection } from "@/components/WatermarkedSection";
import { ToastGate } from "@/components/ToastGate";
import { getStudentFinanceDetail, listFinanceTerms } from "../queries";
import { createStudentFeeAdjustment, recordStudentPayment } from "../actions";

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="portal-badge">{children}</span>;
}

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
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div className="mt-2 text-2xl font-bold text-slate-900">{value}</div>
      {hint ? <div className="mt-1 text-sm text-slate-600">{hint}</div> : null}
    </div>
  );
}

function money(n: number) {
  return new Intl.NumberFormat("en-UG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n || 0);
}

export default async function AdminStudentFinanceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ studentId: string }>;
  searchParams: Promise<{ termId?: string; ok?: string; err?: string }>;
}) {
  await requireRole(["admin"]);

  const { studentId } = await params;
  const sp = await searchParams;

  const terms = await listFinanceTerms();
  const activeTerm = terms.find((t: any) => t.is_active) ?? terms[0] ?? null;
  const termId = sp.termId ? Number(sp.termId) : activeTerm?.id ?? 0;

  const detail = termId ? await getStudentFinanceDetail(studentId, termId) : null;

  if (!detail) {
    return (
      <WatermarkedSection tone="portal" variant="mixed">
        <section className="portal-surface p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="portal-title">Student finance record not found</h1>
              <p className="portal-subtitle">
                The requested student finance detail could not be loaded.
              </p>
            </div>
            <Link className="portal-btn" href="/portal/admin/finance">
              Back to Finance
            </Link>
          </div>
        </section>
      </WatermarkedSection>
    );
  }

  const backTo = `/portal/admin/finance/${studentId}?termId=${termId}`;

  return (
    <WatermarkedSection tone="portal" variant="mixed">
      <ToastGate ok={sp.ok} err={sp.err} okText="Done." />

      <div className="grid gap-6">
        <section className="portal-surface p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="portal-title">{detail.student.full_name}</h1>
              <p className="portal-subtitle">
                {detail.student.student_no || "No ID"} • {detail.student.school_level || "No level"}
                {detail.student.class_level ? ` • ${detail.student.class_level}` : ""}
                {detail.student.stream ? ` • Stream ${detail.student.stream}` : ""}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link className="portal-btn" href={`/portal/admin/finance?termId=${termId}`}>
                Back to Finance
              </Link>
              <Link className="portal-btn" href={`/portal/admin/students/${studentId}`}>
                Student Profile
              </Link>
            </div>
          </div>

          <form method="get" className="mt-4 max-w-sm">
            <select className="portal-select" name="termId" defaultValue={termId}>
              {terms.map((term: any) => (
                <option key={term.id} value={term.id}>
                  {term.name} {term.is_active ? "(active)" : ""}
                </option>
              ))}
            </select>

            <button className="portal-btn portal-btn-primary mt-3" type="submit">
              Open term
            </button>
          </form>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Expected" value={`UGX ${money(detail.totals.expected)}`} />
          <StatCard label="Paid" value={`UGX ${money(detail.totals.paid)}`} />
          <StatCard label="Balance" value={`UGX ${money(detail.totals.balance)}`} />
          <StatCard label="Collection" value={`${detail.totals.percentage}%`} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="grid gap-6">
            <section className="portal-surface p-6">
              <h2 className="text-lg font-semibold text-slate-900">Fee basis</h2>

              <div className="mt-4 grid gap-3">
                <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Base amount
                  </div>
                  <div className="mt-2 text-lg font-bold text-slate-900">
                    UGX {money(Number(detail.expected?.base_amount ?? 0))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Fixed adjustments
                  </div>
                  <div className="mt-2 text-lg font-bold text-slate-900">
                    UGX {money(Number(detail.expected?.fixed_adjustment_total ?? 0))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Percent adjustments
                  </div>
                  <div className="mt-2 text-lg font-bold text-slate-900">
                    {Number(detail.expected?.percent_adjustment_total ?? 0)}%
                  </div>
                </div>
              </div>
            </section>

            <section className="portal-surface p-6">
              <h2 className="text-lg font-semibold text-slate-900">Add discount / scholarship</h2>

              <form action={createStudentFeeAdjustment} className="mt-4 grid gap-3">
                <input type="hidden" name="student_id" value={studentId} />
                <input type="hidden" name="term_id" value={termId} />
                <input type="hidden" name="back_to" value={backTo} />

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1">
                    <span className="text-sm">Adjustment type</span>
                    <select className="portal-select" name="adjustment_kind" required>
                      <option value="discount">Discount</option>
                      <option value="scholarship">Scholarship</option>
                    </select>
                  </label>

                  <label className="grid gap-1">
                    <span className="text-sm">Value type</span>
                    <select className="portal-select" name="value_type" required>
                      <option value="fixed">Fixed amount</option>
                      <option value="percent">Percentage</option>
                    </select>
                  </label>
                </div>

                <label className="grid gap-1">
                  <span className="text-sm">Value</span>
                  <input className="portal-input" type="number" step="0.01" min="0" name="value" required />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm">Reason</span>
                  <input className="portal-input" name="reason" placeholder="Reason for adjustment" />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm">Notes</span>
                  <textarea className="portal-input min-h-[100px]" name="notes" placeholder="Optional notes..." />
                </label>

                <button className="portal-btn portal-btn-primary w-full sm:w-fit" type="submit">
                  Save adjustment
                </button>
              </form>
            </section>

            <section className="portal-surface p-6">
              <h2 className="text-lg font-semibold text-slate-900">Record payment</h2>

              <form action={recordStudentPayment} className="mt-4 grid gap-3">
                <input type="hidden" name="student_id" value={studentId} />
                <input type="hidden" name="term_id" value={termId} />
                <input type="hidden" name="back_to" value={backTo} />

                <label className="grid gap-1">
                  <span className="text-sm">Amount paid</span>
                  <input className="portal-input" type="number" step="0.01" min="0.01" name="amount_paid" required />
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1">
                    <span className="text-sm">Payment date</span>
                    <input
                      className="portal-input"
                      type="date"
                      name="payment_date"
                      defaultValue={new Date().toISOString().slice(0, 10)}
                    />
                  </label>

                  <label className="grid gap-1">
                    <span className="text-sm">Payment method</span>
                    <input className="portal-input" name="payment_method" placeholder="Cash / Mobile Money" />
                  </label>
                </div>

                <label className="grid gap-1">
                  <span className="text-sm">Reference number</span>
                  <input className="portal-input" name="reference_no" placeholder="Receipt / transaction no" />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm">Notes</span>
                  <textarea className="portal-input min-h-[100px]" name="notes" placeholder="Optional notes..." />
                </label>

                <button className="portal-btn portal-btn-primary w-full sm:w-fit" type="submit">
                  Record payment
                </button>
              </form>
            </section>
          </div>

          <div className="grid gap-6">
            <section className="portal-surface p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-900">Adjustments</h2>
                <Pill>{detail.adjustments.length}</Pill>
              </div>

              <div className="mt-4 grid gap-3">
                {detail.adjustments.map((item: any) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                    <div className="font-medium text-slate-900">
                      {item.adjustment_kind} • {item.value_type === "percent" ? `${item.value}%` : `UGX ${money(Number(item.value ?? 0))}`}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {item.reason || "No reason"}
                    </div>
                    {item.notes ? (
                      <div className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{item.notes}</div>
                    ) : null}
                  </div>
                ))}

                {detail.adjustments.length === 0 ? (
                  <div className="text-sm text-slate-600">No adjustments for this term.</div>
                ) : null}
              </div>
            </section>

            <section className="portal-surface p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-900">Payment history</h2>
                <Pill>{detail.payments.length}</Pill>
              </div>

              <div className="mt-4 grid gap-3">
                {detail.payments.map((item: any) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                    <div className="font-medium text-slate-900">
                      UGX {money(Number(item.amount_paid ?? 0))}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {item.payment_date}
                      {item.payment_method ? ` • ${item.payment_method}` : ""}
                      {item.reference_no ? ` • ${item.reference_no}` : ""}
                    </div>
                    {item.notes ? (
                      <div className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{item.notes}</div>
                    ) : null}
                  </div>
                ))}

                {detail.payments.length === 0 ? (
                  <div className="text-sm text-slate-600">No payments recorded yet for this term.</div>
                ) : null}
              </div>
            </section>

            <section className="portal-surface p-6">
              <h2 className="text-lg font-semibold text-slate-900">Print / export</h2>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  className="portal-btn"
                  href={`/portal/admin/finance/${studentId}/print?termId=${termId}`}
                >
                  Printable statement
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </WatermarkedSection>
  );
}