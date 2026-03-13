import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { getStudentFinanceDetail, listFinanceTerms } from "../../queries";

function money(n: number) {
  return new Intl.NumberFormat("en-UG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n || 0);
}

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-3 border-b border-slate-200 py-2 text-sm">
      <div className="font-medium text-slate-600">{label}</div>
      <div className="text-slate-900">{value || "—"}</div>
    </div>
  );
}

export default async function AdminStudentFinancePrintPage({
  params,
  searchParams,
}: {
  params: Promise<{ studentId: string }>;
  searchParams: Promise<{ termId?: string }>;
}) {
  await requireRole(["admin"]);

  const { studentId } = await params;
  const sp = await searchParams;

  const terms = await listFinanceTerms();
  const activeTerm = terms.find((t: any) => t.is_active) ?? terms[0] ?? null;
  const termId = sp.termId ? Number(sp.termId) : activeTerm?.id ?? 0;
  const term = terms.find((t: any) => t.id === termId) ?? null;

  const detail = termId ? await getStudentFinanceDetail(studentId, termId) : null;

  if (!detail) {
    return (
      <div className="mx-auto max-w-4xl p-6 print:p-0">
        <div className="rounded-2xl border bg-white p-6">
          <h1 className="text-2xl font-bold text-slate-900">Finance statement not found</h1>
          <p className="mt-2 text-sm text-slate-600">
            The requested student finance statement could not be loaded.
          </p>
          <div className="mt-4">
            <Link className="inline-flex rounded-xl border px-4 py-2 text-sm" href="/portal/admin/finance">
              Back to Finance
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 print:bg-white">
      <div className="mx-auto max-w-5xl p-4 sm:p-6 print:max-w-none print:p-0">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 print:hidden">
          <div className="flex flex-wrap gap-2">
            <Link
              className="inline-flex rounded-xl border bg-white px-4 py-2 text-sm text-slate-900"
              href={`/portal/admin/finance/${studentId}?termId=${termId}`}
            >
              Back
            </Link>
            <Link
              className="inline-flex rounded-xl border bg-white px-4 py-2 text-sm text-slate-900"
              href={`/portal/admin/finance?termId=${termId}`}
            >
              Finance
            </Link>
          </div>

          <a
  href="javascript:window.print()"
  className="inline-flex rounded-xl border bg-white px-4 py-2 text-sm font-medium text-slate-900"
>
  Print / Save PDF
</a>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none">
          <div className="border-b border-slate-200 pb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Okasha High School
                </div>
                <h1 className="mt-2 text-2xl font-bold text-slate-900">
                  Student Finance Statement
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  Term: <span className="font-medium text-slate-900">{term?.name ?? `Term ${termId}`}</span>
                </p>
              </div>

              <div className="text-sm text-slate-600">
                <div>Generated: {new Date().toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 py-6 lg:grid-cols-[1fr_1fr]">
            <section>
              <h2 className="text-lg font-semibold text-slate-900">Student details</h2>
              <div className="mt-4 rounded-2xl border border-slate-200 px-4 py-2">
                <Row label="Full name" value={detail.student.full_name} />
                <Row label="Student ID" value={detail.student.student_no ?? "Not assigned"} />
                <Row label="School level" value={detail.student.school_level ?? "Not set"} />
                <Row label="Class level" value={detail.student.class_level ?? "Not set"} />
                <Row
                  label="Stream"
                  value={detail.student.stream ? `Stream ${detail.student.stream}` : "Not set"}
                />
                <Row label="Status" value={detail.student.status ?? "Not set"} />
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900">Fee summary</h2>
              <div className="mt-4 rounded-2xl border border-slate-200 px-4 py-2">
                <Row
                  label="Base fee"
                  value={`UGX ${money(Number(detail.expected?.base_amount ?? 0))}`}
                />
                <Row
                  label="Fixed adjustments"
                  value={`UGX ${money(Number(detail.expected?.fixed_adjustment_total ?? 0))}`}
                />
                <Row
                  label="Percent adjustments"
                  value={`${Number(detail.expected?.percent_adjustment_total ?? 0)}%`}
                />
                <Row
                  label="Expected amount"
                  value={`UGX ${money(Number(detail.totals.expected ?? 0))}`}
                />
                <Row
                  label="Paid amount"
                  value={`UGX ${money(Number(detail.totals.paid ?? 0))}`}
                />
                <Row
                  label="Balance"
                  value={`UGX ${money(Number(detail.totals.balance ?? 0))}`}
                />
                <Row label="Collection" value={`${detail.totals.percentage}%`} />
              </div>
            </section>
          </div>

          <div className="grid gap-6 pb-6 lg:grid-cols-[1fr_1fr]">
            <section>
              <h2 className="text-lg font-semibold text-slate-900">Adjustments</h2>

              {detail.adjustments.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">
                  No discounts or scholarships applied for this term.
                </div>
              ) : (
                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-slate-700">Type</th>
                        <th className="px-4 py-3 font-semibold text-slate-700">Value</th>
                        <th className="px-4 py-3 font-semibold text-slate-700">Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.adjustments.map((item: any) => (
                        <tr key={item.id} className="border-t border-slate-200">
                          <td className="px-4 py-3 text-slate-900">
                            {item.adjustment_kind}
                          </td>
                          <td className="px-4 py-3 text-slate-900">
                            {item.value_type === "percent"
                              ? `${item.value}%`
                              : `UGX ${money(Number(item.value ?? 0))}`}
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            {item.reason ?? "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900">Payments</h2>

              {detail.payments.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">
                  No payments recorded for this term.
                </div>
              ) : (
                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-slate-700">Date</th>
                        <th className="px-4 py-3 font-semibold text-slate-700">Amount</th>
                        <th className="px-4 py-3 font-semibold text-slate-700">Method</th>
                        <th className="px-4 py-3 font-semibold text-slate-700">Reference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.payments.map((item: any) => (
                        <tr key={item.id} className="border-t border-slate-200">
                          <td className="px-4 py-3 text-slate-900">{item.payment_date}</td>
                          <td className="px-4 py-3 text-slate-900">
                            UGX {money(Number(item.amount_paid ?? 0))}
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            {item.payment_method ?? "—"}
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            {item.reference_no ?? "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>

          <div className="border-t border-slate-200 pt-6 text-xs text-slate-500">
            This statement is system generated from the Okasha High School finance module.
          </div>
        </div>
      </div>
    </div>
  );
}