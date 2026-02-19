"use server";

import { z } from "zod";
import { requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

const Schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  full_name: z.string().min(2),
  role_key: z.enum(["student", "parent", "teacher", "admin"]),
});

export async function adminCreateUser(formData: FormData): Promise<void> {
  await requireRole(["admin"]);

  const parsed = Schema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    full_name: String(formData.get("full_name") ?? ""),
    role_key: String(formData.get("role_key") ?? "student"),
  });

  if (!parsed.success) {
    redirect(
      `/portal/admin/users?err=${encodeURIComponent(
        parsed.error.issues.map((i) => i.message).join(", ")
      )}`
    );
  }

  const sb = supabaseAdmin();

  const { data, error } = await sb.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
  });

  if (error || !data.user) {
    redirect(
      `/portal/admin/users?err=${encodeURIComponent(
        error?.message ?? "Failed to create user"
      )}`
    );
  }

  const { error: upsertError } = await sb.from("profiles").upsert({
    id: data.user.id,
    full_name: parsed.data.full_name,
    role_key: parsed.data.role_key,
    is_active: true,
  });

  if (upsertError) {
    redirect(`/portal/admin/users?err=${encodeURIComponent(upsertError.message)}`);
  }

  redirect("/portal/admin/users?ok=1");
}
