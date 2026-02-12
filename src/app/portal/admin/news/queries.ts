import "server-only";
import { requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function listNewsAdmin() {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();
  const { data } = await sb
    .from("news_posts")
    .select("id, slug, title, status, published_at, updated_at")
    .order("updated_at", { ascending: false })
    .limit(50);
  return data ?? [];
}

export async function getNewsAdmin(id: number) {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();
  const { data } = await sb
    .from("news_posts")
    .select("id, slug, title, excerpt, content_md, cover_image_url, status")
    .eq("id", id)
    .maybeSingle();
  return data ?? null;
}
