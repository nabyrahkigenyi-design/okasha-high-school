import "server-only";
import { requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function listTracksAdmin() {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("program_tracks")
    .select("id, key, title, sort_order, is_published, updated_at")
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listProgramItemsAdmin() {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("program_items")
    .select("id, track_key, title, is_published, sort_order, updated_at")
    .order("track_key", { ascending: true })
    .order("sort_order", { ascending: true })
    .limit(500);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getProgramItemAdmin(id: number) {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("program_items")
    .select("id, track_key, title, summary, details_md, is_published, sort_order")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ?? null;
}
