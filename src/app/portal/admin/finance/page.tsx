import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { WatermarkedSection } from "@/components/WatermarkedSection";
import { ToastGate } from "@/components/ToastGate";
import { getFinanceSnapshot, listFinanceTerms } from "./queries";
import {
  recordSchoolExpense,
  upsertFeeStructure,
} from "./actions";

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

export default async function AdminFinancePage({
  searchParams,
}: {
  searchParams: Promise<{
    termId?: string;
    q?: string;
    status?: string;
    schoolLevel?: string;
    ok?: string;
    err?: string;
  }>;
}) {
  await requireRole(["admin"]);
  const params = await searchParams;

  const q = (params.q ?? "").trim();
  const status = (params.status ?? "").trim();
  const schoolLevel = (params.schoolLevel ?? "").trim();

  const terms = await listFinanceTerms();
  const activeTerm = terms.find((t: any) => t.is_active) ?? terms[0] ?? null;
  const termId = params.termId ? Number(params.termId) : activeTerm?.id ?? 0;

  const finance = termId
    ? await getFinanceSnapshot(termId, { q, status, schoolLevel })
    : {
        students: [],
        payments: [],
        expenses: [],
        adjustments: [],
        feeStructures: [],
        totals: {
          expected: 0,
          paid: 0,
          balance: 0,
          expenses: 0,
          collectionPercentage: 0,
          net: 0,
        },
      };

  const structureMap = new Map<string, any>();
  for (const item of finance.feeStructures) {
    structureMap.set(item.school_level, item);
  }

  return (
    <WatermarkedSection tone="portal" variant="mixed">
      <ToastGate ok={params.ok} err={params.err} okText="Done." />

      <div className="grid gap-6">
        <section className="portal-surface p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="portal-title">Finance</h1>
              <p className="portal-subtitle">
                Manage level-based fees, student balances, payments, and school expenses by term.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link className="portal-btn" href="/portal/admin/students">
                Students
              </Link>
            </div>
          </div>

          <form method="get" className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <select className="portal-select" name="termId" defaultValue={termId || ""}>
              {terms.map((term: any) => (
                <option key={term.id} value={term.id}>
                  {term.name} {term.is_active ? "(active)" : ""}
                </option>
              ))}
            </select>

            <input
              className="portal-input"
              name="q"
              defaultValue={q}
              placeholder="Search student name or ID..."
            />

            <select className="portal-select" name="status" defaultValue={status}>
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="withdrawn">Withdrawn</option>
              <option value="graduated">Graduated</option>
            </select>

            <select className="portal-select" name="schoolLevel" defaultValue={schoolLevel}>
              <option value="">All levels</option>
              <option value="primary">Primary</option>
              <option value="o-level">O-Level</option>
              <option value="a-level">A-Level</option>
            </select>

            <div className="flex flex-wrap gap-2">
              <button className="portal-btn portal-btn-primary" type="submit">
                Filter
              </button>
              <Link className="portal-btn" href="/portal/admin/finance">
                Clear
              </Link>
            </div>
          </form>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard label="Expected" value={`UGX ${money(finance.totals.expected)}`} />
          <StatCard label="Collected" value={`UGX ${money(finance.totals.paid)}`} />
          <StatCard label="Balance" value={`UGX ${money(finance.totals.balance)}`} />
          <StatCard label="Expenses" value={`UGX ${money(finance.totals.expenses)}`} />
          <StatCard
            label="Collection Rate"
            value={`${finance.totals.collectionPercentage}%`}
            hint={`Net: UGX ${money(finance.totals.net)}`}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="portal-surface p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900">Students fee ledger</h2>
              <Pill>{finance.students.length} students</Pill>
            </div>

            <div className="mt-4 grid gap-3">
              {finance.students.map((row: any) => (
                <div
                  key={row.student_id}
                  className="rounded-2xl border border-slate-200 bg-white/80 p-4"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="text-base font-semibold text-slate-900">
                        {row.full_name}
                      </div>
                      <div className="mt-1 text-sm text-slate-600">
                        {row.student_no || "No ID"}
                        {row.class_level ? ` • ${row.class_level}` : ""}
                        {row.stream ? ` • Stream ${row.stream}` : ""}
                        {row.school_level ? ` • ${row.school_level}` : ""}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Pill>Expected: UGX {money(Number(row.expected_amount ?? 0))}</Pill>
                        <Pill>Paid: UGX {money(Number(row.paid ?? 0))}</Pill>
                        <Pill>Balance: UGX {money(Number(row.balance ?? 0))}</Pill>
                        <Pill>{row.percentage}%</Pill>
                        {row.adjustment_count > 0 ? (
                          <Pill>{row.adjustment_count} adjustment{row.adjustment_count === 1 ? "" : "s"}</Pill>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Link
                        className="portal-btn portal-btn-primary"
                        href={`/portal/admin/finance/${row.student_id}?termId=${termId}`}
                      >
                        Open
                      </Link>
                    </div>
                  </div>
                </div>
              ))}

              {finance.students.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-5 text-sm text-slate-600">
                  No students found for the selected filters.
                </div>
              ) : null}
            </div>
          </section>

          <div className="grid gap-6">
            <section className="portal-surface p-6">
              <h2 className="text-lg font-semibold text-slate-900">Fee settings by level</h2>

              <div className="mt-4 grid gap-4">
                {[
                  { key: "primary", label: "Primary" },
                  { key: "o-level", label: "O-Level" },
                  { key: "a-level", label: "A-Level" },
                ].map((level) => {
                  const existing = structureMap.get(level.key);

                  return (
                    <form
                      key={level.key}
                      action={upsertFeeStructure}
                      className="rounded-2xl border border-slate-200 bg-white/80 p-4"
                    >
                      <input type="hidden" name="term_id" value={termId} />
                      <input type="hidden" name="school_level" value={level.key} />

                      <div className="text-sm font-semibold text-slate-900">{level.label}</div>

                      <label className="mt-3 grid gap-1">
                        <span className="text-xs text-slate-600">Amount</span>
                        <input
                          className="portal-input"
                          type="number"
                          step="0.01"
                          min="0"
                          name="amount"
                          defaultValue={existing?.amount ?? ""}
                          placeholder="Set amount"
                          required
                        />
                      </label>

                      <label className="mt-3 grid gap-1">
                        <span className="text-xs text-slate-600">Notes</span>
                        <input
                          className="portal-input"
                          name="notes"
                          defaultValue={existing?.notes ?? ""}
                          placeholder="Optional note"
                        />
                      </label>

                      <button className="portal-btn mt-3" type="submit">
                        Save {level.label}
                      </button>
                    </form>
                  );
                })}
              </div>
            </section>

            <section className="portal-surface p-6">
              <h2 className="text-lg font-semibold text-slate-900">Record expense</h2>

              <form action={recordSchoolExpense} className="mt-4 grid gap-3">
                <input type="hidden" name="term_id" value={termId} />

                <label className="grid gap-1">
                  <span className="text-sm">Title</span>
                  <input className="portal-input" name="title" placeholder="Fuel, stationery, salaries..." required />
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1">
                    <span className="text-sm">Category</span>
                    <input className="portal-input" name="category" placeholder="Transport, utilities..." />
                  </label>

                  <label className="grid gap-1">
                    <span className="text-sm">Amount</span>
                    <input className="portal-input" type="number" step="0.01" min="0" name="amount" required />
                  </label>
                </div>

                <label className="grid gap-1">
                  <span className="text-sm">Expense date</span>
                  <input
                    className="portal-input"
                    type="date"
                    name="expense_date"
                    defaultValue={new Date().toISOString().slice(0, 10)}
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm">Notes</span>
                  <textarea className="portal-input min-h-[100px]" name="notes" placeholder="Optional notes..." />
                </label>

                <button className="portal-btn portal-btn-primary w-full sm:w-fit" type="submit">
                  Save expense
                </button>
              </form>
            </section>
          </div>
        </div>
      </div>
    </WatermarkedSection>
  );
}