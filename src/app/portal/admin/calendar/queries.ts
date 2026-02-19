import "server-only";
import { requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function listCalendarAdmin() {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("calendar_events")
    .select("id, title, starts_on, ends_on, category, is_published, sort_order, updated_at")
    .order("starts_on", { ascending: true })
    .order("sort_order", { ascending: true })
    .limit(500);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getCalendarAdmin(id: number) {
  await requireRole(["admin"]);
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("calendar_events")
    .select("id, title, description, starts_on, ends_on, category, is_published, sort_order")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ?? null;
}
