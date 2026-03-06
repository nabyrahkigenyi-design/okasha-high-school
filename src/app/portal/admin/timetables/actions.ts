"use server";

import { z } from "zod";
import { requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const sb = () => supabaseAdmin();

function backUrl(p: { termId?: number; classId?: number; day?: number }) {
  const qs = new URLSearchParams();
  if (p.termId) qs.set("termId", String(p.termId));
  if (p.classId) qs.set("classId", String(p.classId));
  if (p.day) qs.set("day", String(p.day));
  const q = qs.toString();
  return `/portal/admin/timetables${q ? `?${q}` : ""}`;
}

export async function upsertSlot(fd: FormData) {
  await requireRole(["admin"]);

  const Schema = z.object({
    id: z.coerce.number().int().optional(),
    term_id: z.coerce.number().int().positive(),
    class_id: z.coerce.number().int().positive(),
    day_of_week: z.enum(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]),
    period_no: z.coerce.number().int().min(1).max(30),
    start_time: z.string().min(1),
    end_time: z.string().min(1),
    subject_id: z.coerce.number().int().positive(),
    teacher_id: z.string().uuid().optional().or(z.literal("")),
    room: z.string().max(60).optional().nullable(),
    note: z.string().max(500).optional().nullable(),
  });

  const parsed = Schema.safeParse({
    id: fd.get("id") ? Number(fd.get("id")) : undefined,
    term_id: fd.get("term_id"),
    class_id: fd.get("class_id"),
    day_of_week: fd.get("day_of_week"),
    period_no: fd.get("period_no"),
    start_time: String(fd.get("start_time") ?? ""),
    end_time: String(fd.get("end_time") ?? ""),
    subject_id: fd.get("subject_id"),
    teacher_id: fd.get("teacher_id") ? String(fd.get("teacher_id")) : "",
    room: fd.get("room") ? String(fd.get("room")) : null,
    note: fd.get("note") ? String(fd.get("note")) : null,
  });

  const termId = Number(fd.get("term_id") ?? 0);
  const classId = Number(fd.get("class_id") ?? 0);
  const day = Number(fd.get("day_of_week") ?? 0);
  const back = backUrl({ termId, classId, day });

  if (!parsed.success) {
    redirect(`${back}&err=${encodeURIComponent("Invalid fields. Check period/times/subject.")}`);
  }

  const payload = {
    term_id: parsed.data.term_id,
    class_id: parsed.data.class_id,
    day_of_week: parsed.data.day_of_week,
    period_no: parsed.data.period_no,
    start_time: parsed.data.start_time,
    end_time: parsed.data.end_time,
    subject_id: parsed.data.subject_id,
    teacher_id: parsed.data.teacher_id ? parsed.data.teacher_id : null,
    room: parsed.data.room || null,
    note: parsed.data.note || null,
  };

  if (parsed.data.id) {
    const { error } = await sb().from("timetables").update(payload).eq("id", parsed.data.id);
    if (error) redirect(`${back}&err=${encodeURIComponent(error.message)}`);
  } else {
    const { error } = await sb().from("timetables").insert(payload);
    if (error) redirect(`${back}&err=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/portal/admin/timetables");
  redirect(`${back}&ok=1`);
}

export async function deleteSlot(fd: FormData) {
  await requireRole(["admin"]);

  const id = Number(fd.get("id") ?? 0);
  const termId = Number(fd.get("termId") ?? 0);
  const classId = Number(fd.get("classId") ?? 0);
  const day = Number(fd.get("day") ?? 0);

  const back = backUrl({ termId, classId, day });
  if (!id) redirect(`${back}&err=${encodeURIComponent("Missing slot id.")}`);

  const { error } = await sb().from("timetables").delete().eq("id", id);
  if (error) redirect(`${back}&err=${encodeURIComponent(error.message)}`);

  revalidatePath("/portal/admin/timetables");
  redirect(`${back}&ok=1`);
}

/**
 * Copy slots from one day to another day within the same term+class.
 * - Does NOT overwrite existing slots in target day.
 * - Skips conflicts (period already exists).
 */
export async function copyDay(fd: FormData) {
  await requireRole(["admin"]);

  const Schema = z.object({
    term_id: z.coerce.number().int().positive(),
    class_id: z.coerce.number().int().positive(),
    from_day: z.enum(["mon","tue","wed","thu","fri","sat","sun"]),
    to_day: z.enum(["mon","tue","wed","thu","fri","sat","sun"]),
  });

  const parsed = Schema.safeParse({
    term_id: fd.get("term_id"),
    class_id: fd.get("class_id"),
    from_day: fd.get("from_day"),
    to_day: fd.get("to_day"),
  });

  const termId = Number(fd.get("term_id") ?? 0);
  const classId = Number(fd.get("class_id") ?? 0);
  const toDay = Number(fd.get("to_day") ?? 0);
  const back = backUrl({ termId, classId, day: toDay || 1 });

  if (!parsed.success) redirect(`${back}&err=${encodeURIComponent("Invalid copy day parameters.")}`);
  if (parsed.data.from_day === parsed.data.to_day) redirect(`${back}&err=${encodeURIComponent("Choose two different days.")}`);

  const sbx = sb();

  const { data: fromSlots, error: fromErr } = await sbx
    .from("timetables")
    .select("period_no, starts_at, ends_at, subject_id, teacher_id, room, note")
    .eq("term_id", parsed.data.term_id)
    .eq("class_id", parsed.data.class_id)
    .eq("day_of_week", parsed.data.from_day);

  if (fromErr) redirect(`${back}&err=${encodeURIComponent(fromErr.message)}`);

  if (!fromSlots || fromSlots.length === 0) redirect(`${back}&err=${encodeURIComponent("No slots found to copy.")}`);

  // Insert one-by-one to skip conflicts cleanly
  let copied = 0;
  for (const s of fromSlots) {
    const { error } = await sbx.from("timetables").insert({
      term_id: parsed.data.term_id,
      class_id: parsed.data.class_id,
      day_of_week: parsed.data.to_day,
      period_no: s.period_no,
      starts_at: s.starts_at,
      ends_at: s.ends_at,
      subject_id: s.subject_id,
      teacher_id: s.teacher_id ?? null,
      room: s.room ?? null,
      note: s.note ?? null,
    });

    if (!error) copied += 1;
    // If error due to unique constraint, just skip silently.
  }

  revalidatePath("/portal/admin/timetables");
  redirect(`${back}&ok=1`);
}

/**
 * Copy full timetable from another term (sourceTerm) into targetTerm for same class.
 * - Does NOT overwrite existing target rows; skips conflicts.
 */
export async function copyFromTerm(fd: FormData) {
  await requireRole(["admin"]);

  const Schema = z.object({
    source_term_id: z.coerce.number().int().positive(),
    target_term_id: z.coerce.number().int().positive(),
    class_id: z.coerce.number().int().positive(),
  });

  const parsed = Schema.safeParse({
    source_term_id: fd.get("source_term_id"),
    target_term_id: fd.get("target_term_id"),
    class_id: fd.get("class_id"),
  });

  const targetTermId = Number(fd.get("target_term_id") ?? 0);
  const classId = Number(fd.get("class_id") ?? 0);
  const back = backUrl({ termId: targetTermId, classId, day: 1 });

  if (!parsed.success) redirect(`${back}&err=${encodeURIComponent("Invalid copy-from-term parameters.")}`);
  if (parsed.data.source_term_id === parsed.data.target_term_id) redirect(`${back}&err=${encodeURIComponent("Choose two different terms.")}`);

  const sbx = sb();

  const { data: sourceRows, error: srcErr } = await sbx
    .from("timetables")
    .select("day_of_week, period_no, starts_at, ends_at, subject_id, teacher_id, room, note")
    .eq("term_id", parsed.data.source_term_id)
    .eq("class_id", parsed.data.class_id);

  if (srcErr) redirect(`${back}&err=${encodeURIComponent(srcErr.message)}`);

  if (!sourceRows || sourceRows.length === 0) redirect(`${back}&err=${encodeURIComponent("No timetable rows found in source term.")}`);

  let copied = 0;
  for (const r of sourceRows) {
    const { error } = await sbx.from("timetables").insert({
      term_id: parsed.data.target_term_id,
      class_id: parsed.data.class_id,
      day_of_week: r.day_of_week,
      period_no: r.period_no,
      starts_at: r.starts_at,
      ends_at: r.ends_at,
      subject_id: r.subject_id,
      teacher_id: r.teacher_id ?? null,
      room: r.room ?? null,
      note: r.note ?? null,
    });

    if (!error) copied += 1;
  }

  revalidatePath("/portal/admin/timetables");
  redirect(`${back}&ok=1`);
}