"use server";

import { z } from "zod";
import { requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

const UpsertSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2).max(160),
  description: z.string().max(2000).optional().nullable(),
  starts_on: z.string().min(10).max(10), // YYYY-MM-DD
  ends_on: z.string().optional().nullable(),
  category: z.enum(["term", "exam", "holiday", "event", "general"]).default("general"),
  sort_order: z.coerce.number().int().min(0).max(9999).default(100),
  is_published: z.coerce.boolean().default(true),
});

export type CalendarActionState =
  | { ok: true; message: string }
  | { ok: false; error: string };

export async function upsertCalendarEvent(
  _prev: CalendarActionState | undefined,
  formData: FormData
): Promise<CalendarActionState> {
  await requireRole(["admin"]);

  const parsed = UpsertSchema.safeParse({
    id: formData.get("id") ? String(formData.get("id")) : undefined,
    title: String(formData.get("title") ?? ""),
    description: formData.get("description") ? String(formData.get("description")) : null,
    starts_on: String(formData.get("starts_on") ?? ""),
    ends_on: formData.get("ends_on") ? String(formData.get("ends_on")) : null,
    category: String(formData.get("category") ?? "general"),
    sort_order: formData.get("sort_order") ?? 100,
    is_published: formData.get("is_published") ? true : false,
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  const sb = supabaseAdmin();
  const payload: any = {
    title: parsed.data.title,
    description: parsed.data.description,
    starts_on: parsed.data.starts_on,
    ends_on: parsed.data.ends_on || null,
    category: parsed.data.category,
    sort_order: parsed.data.sort_order,
    is_published: parsed.data.is_published,
  };

  if (parsed.data.id) {
    const { error } = await sb.from("calendar_events").update(payload).eq("id", Number(parsed.data.id));
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await sb.from("calendar_events").insert(payload);
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath("/portal/admin/calendar");
  revalidatePath("/calendar");

  return { ok: true, message: "Saved." };
}

// IMPORTANT: used directly in <form action={deleteCalendarEvent}>,
// so it MUST return void | Promise<void>
export async function deleteCalendarEvent(formData: FormData): Promise<void> {
  await requireRole(["admin"]);
  const id = Number(formData.get("id"));
  if (!id) return;

  const sb = supabaseAdmin();
  const { error } = await sb.from("calendar_events").delete().eq("id", id);
  if (error) return;

  revalidatePath("/portal/admin/calendar");
  revalidatePath("/calendar");
}
