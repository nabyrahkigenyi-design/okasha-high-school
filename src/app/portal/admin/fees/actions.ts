"use server";

import { z } from "zod";
import { requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

const UpsertSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2).max(160),
  amount_text: z.string().max(160).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  applies_to: z.enum(["s1-s4", "s5-s6", "boarding", "day", "general"]).default("general"),
  sort_order: z.coerce.number().int().min(0).max(9999).default(100),
  is_published: z.coerce.boolean().default(true),
});

export type FeeActionState =
  | { ok: true; message: string }
  | { ok: false; error: string };

export async function upsertFeeItem(
  _prev: FeeActionState | undefined,
  formData: FormData
): Promise<FeeActionState> {
  await requireRole(["admin"]);

  const parsed = UpsertSchema.safeParse({
    id: formData.get("id") ? String(formData.get("id")) : undefined,
    title: String(formData.get("title") ?? ""),
    amount_text: formData.get("amount_text") ? String(formData.get("amount_text")) : null,
    notes: formData.get("notes") ? String(formData.get("notes")) : null,
    applies_to: String(formData.get("applies_to") ?? "general"),
    sort_order: formData.get("sort_order") ?? 100,
    is_published: formData.get("is_published") ? true : false,
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  const sb = supabaseAdmin();
  const payload: any = {
    title: parsed.data.title,
    amount_text: parsed.data.amount_text,
    notes: parsed.data.notes,
    applies_to: parsed.data.applies_to,
    sort_order: parsed.data.sort_order,
    is_published: parsed.data.is_published,
  };

  if (parsed.data.id) {
    const { error } = await sb.from("fee_items").update(payload).eq("id", Number(parsed.data.id));
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await sb.from("fee_items").insert(payload);
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath("/portal/admin/fees");
  revalidatePath("/fees");

  return { ok: true, message: "Saved." };
}

// IMPORTANT: used directly in <form action={deleteFeeItem}>
export async function deleteFeeItem(formData: FormData): Promise<void> {
  await requireRole(["admin"]);
  const id = Number(formData.get("id"));
  if (!id) return;

  const sb = supabaseAdmin();
  const { error } = await sb.from("fee_items").delete().eq("id", id);
  if (error) return;

  revalidatePath("/portal/admin/fees");
  revalidatePath("/fees");
}
