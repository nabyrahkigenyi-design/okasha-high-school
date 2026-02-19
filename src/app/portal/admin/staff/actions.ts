"use server";

import { z } from "zod";
import { requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

const UpsertSchema = z.object({
  id: z.string().optional(),
  full_name: z.string().min(2).max(120),
  role_title: z.string().min(2).max(120),
  department: z.string().max(120).optional().nullable(),
  bio: z.string().max(4000).optional().nullable(),
  photo_url: z.string().url().optional().nullable().or(z.literal("")),
  sort_order: z.coerce.number().int().min(0).max(9999).default(100),
  is_published: z.coerce.boolean().default(true),
});

export type StaffActionState =
  | { ok: true; message: string }
  | { ok: false; error: string };

export async function upsertStaffMember(
  _prev: StaffActionState | undefined,
  formData: FormData
): Promise<StaffActionState> {
  await requireRole(["admin"]);

  const parsed = UpsertSchema.safeParse({
    id: formData.get("id") ? String(formData.get("id")) : undefined,
    full_name: String(formData.get("full_name") ?? ""),
    role_title: String(formData.get("role_title") ?? ""),
    department: formData.get("department") ? String(formData.get("department")) : null,
    bio: formData.get("bio") ? String(formData.get("bio")) : null,
    photo_url: formData.get("photo_url") ? String(formData.get("photo_url")) : null,
    sort_order: formData.get("sort_order") ?? 100,
    is_published: formData.get("is_published") ? true : false,
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  const sb = supabaseAdmin();
  const payload: any = {
    full_name: parsed.data.full_name,
    role_title: parsed.data.role_title,
    department: parsed.data.department,
    bio: parsed.data.bio,
    photo_url: parsed.data.photo_url || null,
    sort_order: parsed.data.sort_order,
    is_published: parsed.data.is_published,
  };

  if (parsed.data.id) {
    const { error } = await sb.from("staff_members").update(payload).eq("id", Number(parsed.data.id));
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await sb.from("staff_members").insert(payload);
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath("/portal/admin/staff");
  revalidatePath("/staff");

  return { ok: true, message: "Saved." };
}

// IMPORTANT: used directly in <form action={deleteStaffMember}>
export async function deleteStaffMember(formData: FormData): Promise<void> {
  await requireRole(["admin"]);
  const id = Number(formData.get("id"));
  if (!id) return;

  const sb = supabaseAdmin();
  const { error } = await sb.from("staff_members").delete().eq("id", id);
  if (error) return;

  revalidatePath("/portal/admin/staff");
  revalidatePath("/staff");
}
