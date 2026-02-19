"use server";

import { z } from "zod";
import { requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

const UpsertSchema = z.object({
  id: z.string().optional(),
  track_key: z.enum(["secular", "islamic"]),
  title: z.string().min(2).max(160),
  summary: z.string().max(800).optional().nullable(),
  details_md: z.string().max(12000).optional().nullable(),
  sort_order: z.coerce.number().int().min(0).max(9999).default(100),
  is_published: z.coerce.boolean().default(true),
});

export type ProgramActionState =
  | { ok: true; message: string }
  | { ok: false; error: string };

export async function upsertProgramItem(
  _prev: ProgramActionState | undefined,
  formData: FormData
): Promise<ProgramActionState> {
  await requireRole(["admin"]);

  const parsed = UpsertSchema.safeParse({
    id: formData.get("id") ? String(formData.get("id")) : undefined,
    track_key: String(formData.get("track_key") ?? "secular"),
    title: String(formData.get("title") ?? ""),
    summary: formData.get("summary") ? String(formData.get("summary")) : null,
    details_md: formData.get("details_md") ? String(formData.get("details_md")) : null,
    sort_order: formData.get("sort_order") ?? 100,
    is_published: formData.get("is_published") ? true : false,
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  const sb = supabaseAdmin();
  const payload: any = {
    track_key: parsed.data.track_key,
    title: parsed.data.title,
    summary: parsed.data.summary,
    details_md: parsed.data.details_md,
    sort_order: parsed.data.sort_order,
    is_published: parsed.data.is_published,
  };

  if (parsed.data.id) {
    const { error } = await sb
      .from("program_items")
      .update(payload)
      .eq("id", Number(parsed.data.id));
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await sb.from("program_items").insert(payload);
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath("/portal/admin/programs");
  revalidatePath("/programs");

  return { ok: true, message: "Saved." };
}

// IMPORTANT: used directly in <form action={deleteProgramItem}>
export async function deleteProgramItem(formData: FormData): Promise<void> {
  await requireRole(["admin"]);
  const id = Number(formData.get("id"));
  if (!id) return;

  const sb = supabaseAdmin();
  const { error } = await sb.from("program_items").delete().eq("id", id);
  if (error) return;

  revalidatePath("/portal/admin/programs");
  revalidatePath("/programs");
}
