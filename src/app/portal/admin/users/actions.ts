"use server";

import { z } from "zod";
import { requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";

const Schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  full_name: z.string().min(2),
  role_key: z.enum(["student", "parent", "teacher", "admin"]),
});

export async function adminCreateUser(formData: FormData) {
  await requireRole(["admin"]);

  const parsed = Schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    full_name: formData.get("full_name"),
    role_key: formData.get("role_key"),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map(i => i.message).join(", ") };
  }

  const sb = supabaseAdmin();

  const { data, error } = await sb.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
  });

  if (error || !data.user) return { ok: false, error: error?.message ?? "Failed to create user" };

  const { error: upsertError } = await sb.from("profiles").upsert({
    id: data.user.id,
    full_name: parsed.data.full_name,
    role_key: parsed.data.role_key,
    is_active: true,
  });

  if (upsertError) return { ok: false, error: upsertError.message };

  return { ok: true };
}
