"use server";

import { requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

function enc(s: string) {
  return encodeURIComponent(s);
}

const sb = () => supabaseAdmin();

export async function upsertFeeStructure(formData: FormData) {
  await requireRole(["admin"]);

  const termId = Number(formData.get("term_id") ?? 0);
  const schoolLevel = String(formData.get("school_level") ?? "").trim();
  const amount = Number(formData.get("amount") ?? 0);
  const notes = String(formData.get("notes") ?? "").trim();

  const back = `/portal/admin/finance?termId=${termId || ""}`;

  if (!termId || !schoolLevel) {
    redirect(`${back}&err=${enc("Missing term or school level.")}`);
  }

  if (Number.isNaN(amount) || amount < 0) {
    redirect(`${back}&err=${enc("Fee amount must be 0 or more.")}`);
  }

  const { error } = await sb()
    .from("fee_structures")
    .upsert(
      {
        term_id: termId,
        school_level: schoolLevel,
        amount,
        notes: notes || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "term_id,school_level" }
    );

  if (error) {
    redirect(`${back}&err=${enc(error.message)}`);
  }

  revalidatePath("/portal/admin/finance");
  redirect(`${back}&ok=${enc("Fee structure saved.")}`);
}

export async function recordStudentPayment(formData: FormData) {
  const me = await requireRole(["admin"]);

  const studentId = String(formData.get("student_id") ?? "").trim();
  const termId = Number(formData.get("term_id") ?? 0);
  const amountPaid = Number(formData.get("amount_paid") ?? 0);
  const paymentDate = String(formData.get("payment_date") ?? "").trim();
  const paymentMethod = String(formData.get("payment_method") ?? "").trim();
  const referenceNo = String(formData.get("reference_no") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const backTo = String(formData.get("back_to") ?? "").trim();

  const back = backTo || `/portal/admin/finance?termId=${termId || ""}`;

  if (!studentId || !termId) {
    redirect(`${back}&err=${enc("Missing student or term.")}`);
  }

  if (Number.isNaN(amountPaid) || amountPaid <= 0) {
    redirect(`${back}&err=${enc("Payment amount must be greater than 0.")}`);
  }

  const { error } = await sb()
    .from("student_fee_payments")
    .insert({
      student_id: studentId,
      term_id: termId,
      amount_paid: amountPaid,
      payment_date: paymentDate || new Date().toISOString().slice(0, 10),
      payment_method: paymentMethod || null,
      reference_no: referenceNo || null,
      notes: notes || null,
      recorded_by: me.id,
    });

  if (error) {
    redirect(`${back}&err=${enc(error.message)}`);
  }

  revalidatePath("/portal/admin/finance");
  revalidatePath(`/portal/admin/finance/${studentId}`);
  redirect(`${back}&ok=${enc("Payment recorded.")}`);
}

export async function recordSchoolExpense(formData: FormData) {
  const me = await requireRole(["admin"]);

  const termId = Number(formData.get("term_id") ?? 0);
  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const amount = Number(formData.get("amount") ?? 0);
  const expenseDate = String(formData.get("expense_date") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  const back = `/portal/admin/finance?termId=${termId || ""}`;

  if (!termId || !title) {
    redirect(`${back}&err=${enc("Missing term or expense title.")}`);
  }

  if (Number.isNaN(amount) || amount < 0) {
    redirect(`${back}&err=${enc("Expense amount must be 0 or more.")}`);
  }

  const { error } = await sb()
    .from("school_expenses")
    .insert({
      term_id: termId,
      title,
      category: category || null,
      amount,
      expense_date: expenseDate || new Date().toISOString().slice(0, 10),
      notes: notes || null,
      recorded_by: me.id,
    });

  if (error) {
    redirect(`${back}&err=${enc(error.message)}`);
  }

  revalidatePath("/portal/admin/finance");
  redirect(`${back}&ok=${enc("Expense recorded.")}`);
}

export async function createStudentFeeAdjustment(formData: FormData) {
  await requireRole(["admin"]);

  const studentId = String(formData.get("student_id") ?? "").trim();
  const termId = Number(formData.get("term_id") ?? 0);
  const adjustmentKind = String(formData.get("adjustment_kind") ?? "").trim();
  const valueType = String(formData.get("value_type") ?? "").trim();
  const value = Number(formData.get("value") ?? 0);
  const reason = String(formData.get("reason") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const backTo = String(formData.get("back_to") ?? "").trim();

  const back = backTo || `/portal/admin/finance/${studentId}?termId=${termId || ""}`;

  if (!studentId || !termId || !adjustmentKind || !valueType) {
    redirect(`${back}&err=${enc("Missing student, term, or adjustment details.")}`);
  }

  if (Number.isNaN(value) || value < 0) {
    redirect(`${back}&err=${enc("Adjustment value must be 0 or more.")}`);
  }

  const { error } = await sb()
    .from("student_fee_adjustments")
    .insert({
      student_id: studentId,
      term_id: termId,
      adjustment_kind: adjustmentKind,
      value_type: valueType,
      value,
      reason: reason || null,
      notes: notes || null,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    redirect(`${back}&err=${enc(error.message)}`);
  }

  revalidatePath("/portal/admin/finance");
  revalidatePath(`/portal/admin/finance/${studentId}`);
  redirect(`${back}&ok=${enc("Adjustment saved.")}`);
}