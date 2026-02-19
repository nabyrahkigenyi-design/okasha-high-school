"use server";

import { z } from "zod";
import { requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

const UpsertSchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(3).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(3).max(160),
  excerpt: z.string().max(300).optional().nullable(),
  content_md: z.string().min(20),
  cover_image_url: z.string().url().optional().nullable().or(z.literal("")),
  status: z.enum(["draft", "published"]),
});

export type NewsActionState =
  | { ok: true; message: string }
  | { ok: false; error: string };

export async function upsertNewsPost(
  _prev: NewsActionState | undefined,
  formData: FormData
): Promise<NewsActionState> {
  const me = await requireRole(["admin"]);

  const parsed = UpsertSchema.safeParse({
    id: formData.get("id") ? String(formData.get("id")) : undefined,
    slug: String(formData.get("slug") ?? ""),
    title: String(formData.get("title") ?? ""),
    excerpt: formData.get("excerpt") ? String(formData.get("excerpt")) : null,
    content_md: String(formData.get("content_md") ?? ""),
    cover_image_url: formData.get("cover_image_url") ? String(formData.get("cover_image_url")) : null,
    status: String(formData.get("status") ?? "draft"),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  const sb = supabaseAdmin();

  const nowPublishedAt =
    parsed.data.status === "published" ? new Date().toISOString() : null;

  const payload: any = {
    slug: parsed.data.slug,
    title: parsed.data.title,
    excerpt: parsed.data.excerpt,
    content_md: parsed.data.content_md,
    cover_image_url: parsed.data.cover_image_url || null,
    status: parsed.data.status,
    updated_by: me.id,
  };

  if (parsed.data.status === "published") payload.published_at = nowPublishedAt;

  if (parsed.data.id) {
    const { error } = await sb.from("news_posts").update(payload).eq("id", Number(parsed.data.id));
    if (error) return { ok: false, error: error.message };
  } else {
    payload.created_by = me.id;
    payload.published_at = parsed.data.status === "published" ? nowPublishedAt : null;

    const { error } = await sb.from("news_posts").insert(payload);
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath("/portal/admin/news");
  revalidatePath("/news");

  return { ok: true, message: "Saved." };
}

// IMPORTANT: used directly in <form action={deleteNewsPost}>
export async function deleteNewsPost(formData: FormData): Promise<void> {
  await requireRole(["admin"]);

  const id = Number(formData.get("id"));
  if (!id) return;

  const sb = supabaseAdmin();
  const { error } = await sb.from("news_posts").delete().eq("id", id);
  if (error) return;

  revalidatePath("/portal/admin/news");
  revalidatePath("/news");
}
