import "server-only";
import { redirect } from "next/navigation";
import { supabaseSSR } from "@/lib/supabase/ssr";

export type RoleKey = "student" | "parent" | "teacher" | "admin";

export async function getSessionUser() {
  const sb = await supabaseSSR();
  const { data, error } = await sb.auth.getUser();
  if (error) return null;
  return data.user ?? null;
}

export async function getProfile() {
  const sb = await supabaseSSR();
  const user = await getSessionUser();
  if (!user) return null;

  const { data } = await sb
    .from("profiles")
    .select("id, full_name, role_key, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (!data || !data.is_active) return null;
  return data as { id: string; full_name: string; role_key: RoleKey; is_active: boolean };
}

export async function requireAuth() {
  const profile = await getProfile();
  if (!profile) redirect("/auth/login");
  return profile;
}

export async function requireRole(allowed: RoleKey[]) {
  const profile = await requireAuth();
  if (!allowed.includes(profile.role_key)) redirect("/portal");
  return profile;
}

export function roleHome(role: RoleKey) {
  switch (role) {
    case "student":
      return "/portal/student/dashboard";
    case "parent":
      return "/portal/parent/dashboard";
    case "teacher":
      return "/portal/teacher/dashboard";
    case "admin":
      return "/portal/admin/dashboard";
  }
}
