"use server";

import { z } from "zod";
import { requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

const UpsertSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2).max(160),
  summary: z.string().max(800).optional().nullable(),
  file_url: z.string().url(),
  file_name: z.string().max(200).optional().nullable(),
  category: z
    .enum(["admissions", "conduct", "uniform", "safeguarding", "general"])
    .default("general"),
  sort_order: z.coerce.number().int().min(0).max(9999).default(100),
  is_published: z.coerce.boolean().default(true),
});

export type PolicyActionState =
  | { ok: true; message: string }
  | { ok: false; error: string };

export async function upsertPolicy(
  _prev: PolicyActionState | undefined,
  formData: FormData
): Promise<PolicyActionState> {
  await requireRole(["admin"]);

  const parsed = UpsertSchema.safeParse({
    id: formData.get("id") ? String(formData.get("id")) : undefined,
    title: String(formData.get("title") ?? ""),
    summary: formData.get("summary") ? String(formData.get("summary")) : null,
    file_url: String(formData.get("file_url") ?? ""),
    file_name: formData.get("file_name") ? String(formData.get("file_name")) : null,
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
    summary: parsed.data.summary,
    file_url: parsed.data.file_url,
    file_name: parsed.data.file_name,
    category: parsed.data.category,
    sort_order: parsed.data.sort_order,
    is_published: parsed.data.is_published,
  };

  if (parsed.data.id) {
    const { error } = await sb
      .from("policy_documents")
      .update(payload)
      .eq("id", Number(parsed.data.id));
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await sb.from("policy_documents").insert(payload);
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath("/portal/admin/policies");
  revalidatePath("/policies");

  return { ok: true, message: "Saved." };
}

// IMPORTANT: used directly in <form action={deletePolicy}>
export async function deletePolicy(formData: FormData): Promise<void> {
  await requireRole(["admin"]);
  const id = Number(formData.get("id"));
  if (!id) return;

  const sb = supabaseAdmin();
  const { error } = await sb.from("policy_documents").delete().eq("id", id);
  if (error) return;

  revalidatePath("/portal/admin/policies");
  revalidatePath("/policies");
}
