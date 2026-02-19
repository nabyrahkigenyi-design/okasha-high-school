import "server-only";
import { requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function listFeesAdmin() {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("fee_items")
    .select("id, title, amount_text, applies_to, is_published, sort_order, updated_at")
    .order("sort_order", { ascending: true })
    .order("updated_at", { ascending: false })
    .limit(300);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getFeeAdmin(id: number) {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("fee_items")
    .select("id, title, amount_text, notes, applies_to, sort_order, is_published")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ?? null;
}
