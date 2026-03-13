import "server-only";
import { requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function listFinanceTerms() {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();

  const { data, error } = await sb
    .from("academic_terms")
    .select("id, name, is_active, starts_on, ends_on")
    .order("id", { ascending: false })
    .limit(100);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listFeeStructures(termId: number) {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();

  if (!termId) return [];

  const { data, error } = await sb
    .from("fee_structures")
    .select("id, term_id, school_level, amount, notes, created_at, updated_at")
    .eq("term_id", termId)
    .order("school_level", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listStudentsForFinanceView(params: {
  termId: number;
  q?: string;
  status?: string;
  schoolLevel?: string;
}) {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();

  if (!params.termId) return [];

  let query = sb
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
    .eq("term_id", params.termId)
    .order("full_name", { ascending: true });

  const q = (params.q ?? "").trim();
  const status = (params.status ?? "").trim();
  const schoolLevel = (params.schoolLevel ?? "").trim();

  if (q) {
    query = query.or(
      [`full_name.ilike.%${q}%`, `student_no.ilike.%${q}%`].join(",")
    );
  }

  if (status) query = query.eq("status", status);
  if (schoolLevel) query = query.eq("school_level", schoolLevel);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return data ?? [];
}

export async function listPaymentsForTerm(termId: number) {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();

  if (!termId) return [];

  const { data, error } = await sb
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
      created_at,
      students:student_id (
        id,
        full_name,
        student_no,
        class_level,
        school_level,
        stream
      )
    `)
    .eq("term_id", termId)
    .order("payment_date", { ascending: false })
    .order("id", { ascending: false })
    .limit(3000);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listExpensesForTerm(termId: number) {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();

  if (!termId) return [];

  const { data, error } = await sb
    .from("school_expenses")
    .select(`
      id,
      term_id,
      title,
      category,
      amount,
      expense_date,
      notes,
      recorded_by,
      created_at
    `)
    .eq("term_id", termId)
    .order("expense_date", { ascending: false })
    .order("id", { ascending: false })
    .limit(2000);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listAdjustmentsForTerm(termId: number) {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();

  if (!termId) return [];

  const { data, error } = await sb
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
      updated_at,
      students:student_id (
        id,
        full_name,
        student_no
      )
    `)
    .eq("term_id", termId)
    .order("id", { ascending: false })
    .limit(3000);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getFinanceSnapshot(termId: number, opts?: {
  q?: string;
  status?: string;
  schoolLevel?: string;
}) {
  await requireRole(["admin"]);

  const [rows, payments, expenses, adjustments, feeStructures] = await Promise.all([
    listStudentsForFinanceView({
      termId,
      q: opts?.q,
      status: opts?.status,
      schoolLevel: opts?.schoolLevel,
    }),
    listPaymentsForTerm(termId),
    listExpensesForTerm(termId),
    listAdjustmentsForTerm(termId),
    listFeeStructures(termId),
  ]);

  const paymentTotals = new Map<string, number>();
  for (const payment of payments) {
    const current = paymentTotals.get(payment.student_id) ?? 0;
    paymentTotals.set(payment.student_id, current + Number(payment.amount_paid ?? 0));
  }

  const adjustmentCounts = new Map<string, number>();
  for (const adjustment of adjustments) {
    const current = adjustmentCounts.get(adjustment.student_id) ?? 0;
    adjustmentCounts.set(adjustment.student_id, current + 1);
  }

  const studentRows = rows.map((row: any) => {
    const paid = Number(paymentTotals.get(row.student_id) ?? 0);
    const expected = Number(row.expected_amount ?? 0);
    const balance = expected - paid;
    const percentage = expected > 0 ? Math.round((paid / expected) * 100) : 0;

    return {
      ...row,
      paid,
      balance,
      percentage,
      adjustment_count: adjustmentCounts.get(row.student_id) ?? 0,
    };
  });

  const totals = {
    expected: studentRows.reduce((sum, row) => sum + Number(row.expected_amount ?? 0), 0),
    paid: studentRows.reduce((sum, row) => sum + Number(row.paid ?? 0), 0),
    balance: studentRows.reduce((sum, row) => sum + Number(row.balance ?? 0), 0),
    expenses: expenses.reduce((sum, item: any) => sum + Number(item.amount ?? 0), 0),
  };

  const collectionPercentage =
    totals.expected > 0 ? Math.round((totals.paid / totals.expected) * 100) : 0;

  return {
    students: studentRows,
    payments,
    expenses,
    adjustments,
    feeStructures,
    totals: {
      ...totals,
      collectionPercentage,
      net: totals.paid - totals.expenses,
    },
  };
}

export async function getStudentFinanceDetail(studentId: string, termId: number) {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();

  const { data: student, error: studentError } = await sb
    .from("students")
    .select(`
      id,
      user_id,
      full_name,
      student_no,
      school_level,
      class_level,
      stream,
      status,
      admission_year,
      graduation_year,
      is_active
    `)
    .eq("id", studentId)
    .maybeSingle();

  if (studentError) throw new Error(studentError.message);
  if (!student) return null;

  const { data: expected, error: expectedError } = await sb
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

  if (expectedError) throw new Error(expectedError.message);

  const { data: payments, error: paymentError } = await sb
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

  if (paymentError) throw new Error(paymentError.message);

  const { data: adjustments, error: adjustmentError } = await sb
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

  if (adjustmentError) throw new Error(adjustmentError.message);

  const paidTotal = (payments ?? []).reduce(
    (sum: number, item: any) => sum + Number(item.amount_paid ?? 0),
    0
  );

  const expectedAmount = Number(expected?.expected_amount ?? 0);
  const balance = expectedAmount - paidTotal;
  const percentage = expectedAmount > 0 ? Math.round((paidTotal / expectedAmount) * 100) : 0;

  return {
    student,
    expected,
    payments: payments ?? [],
    adjustments: adjustments ?? [],
    totals: {
      expected: expectedAmount,
      paid: paidTotal,
      balance,
      percentage,
    },
  };
}