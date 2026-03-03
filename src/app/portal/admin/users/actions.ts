"use server";

import { z } from "zod";
import { requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const CreateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  full_name: z.string().min(2).max(120),
  role_key: z.enum(["student", "parent", "teacher", "admin"]),
});

function enc(s: string) {
  return encodeURIComponent(s);
}

// Create user + profile + role table row
export async function adminCreateUser(formData: FormData) {
  await requireRole(["admin"]);

  const parsed = CreateSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    full_name: formData.get("full_name"),
    role_key: formData.get("role_key"),
  });

  if (!parsed.success) {
    redirect(`/portal/admin/users?err=${enc(parsed.error.issues.map(i => i.message).join(", "))}`);
  }

  const sb = supabaseAdmin();

  const { data, error } = await sb.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
  });

  if (error || !data.user) {
    redirect(`/portal/admin/users?err=${enc(error?.message ?? "Failed to create user")}`);
  }

  const userId = data.user.id;

  // profiles
  const { error: upsertProfileError } = await sb.from("profiles").upsert({
    id: userId,
    full_name: parsed.data.full_name,
    role_key: parsed.data.role_key,
    is_active: true,
  });

  if (upsertProfileError) {
    redirect(`/portal/admin/users?err=${enc(upsertProfileError.message)}`);
  }

  // role tables (THIS FIXES ENROLLMENT + ASSIGNMENTS LISTS)
  if (parsed.data.role_key === "student") {
    const { error: e } = await sb.from("students").upsert({
      id: userId,
      full_name: parsed.data.full_name,
      is_active: true,
    });
    if (e) redirect(`/portal/admin/users?err=${enc("Student row error: " + e.message)}`);
  }

  if (parsed.data.role_key === "teacher") {
    const { error: e } = await sb.from("teachers").upsert({
      id: userId,
      full_name: parsed.data.full_name,
      is_active: true,
    });
    if (e) redirect(`/portal/admin/users?err=${enc("Teacher row error: " + e.message)}`);
  }

  if (parsed.data.role_key === "parent") {
    const { error: e } = await sb.from("parents").upsert({
      id: userId,
      full_name: parsed.data.full_name,
      is_active: true,
    });
    if (e) redirect(`/portal/admin/users?err=${enc("Parent row error: " + e.message)}`);
  }

  revalidatePath("/portal/admin/users");
  revalidatePath("/portal/admin/academics"); // dropdowns
  redirect(`/portal/admin/users?ok=1`);
}

// Deactivate = hide from default list + block access
export async function adminDeactivateUser(formData: FormData) {
  await requireRole(["admin"]);
  const id = String(formData.get("id") ?? "");
  if (!id) redirect(`/portal/admin/users?err=${enc("Missing user id")}`);

  const sb = supabaseAdmin();

  // profiles + role tables set inactive
  await sb.from("profiles").update({ is_active: false }).eq("id", id);
  await sb.from("students").update({ is_active: false }).eq("id", id);
  await sb.from("teachers").update({ is_active: false }).eq("id", id);
  await sb.from("parents").update({ is_active: false }).eq("id", id);

  revalidatePath("/portal/admin/users");
  redirect(`/portal/admin/users?ok=1`);
}

// Purge = hard delete ONLY if safe
export async function adminPurgeUser(formData: FormData) {
  await requireRole(["admin"]);
  const id = String(formData.get("id") ?? "");
  if (!id) redirect(`/portal/admin/users?err=${enc("Missing user id")}`);

  const sb = supabaseAdmin();

  // If user is referenced, Supabase will throw “Database error deleting user”.
  // We prevent that by only allowing purge when there are NO dependencies.
  const checks = await Promise.all([
    sb.from("enrollments").select("id", { count: "exact", head: true }).eq("student_id", id),
    sb.from("teacher_assignments").select("id", { count: "exact", head: true }).eq("teacher_id", id),
    sb.from("attendance").select("id", { count: "exact", head: true }).eq("marked_by", id),
    sb.from("grades").select("id", { count: "exact", head: true }).eq("student_id", id),
  ]);

  const hasDeps =
    (checks[0].count ?? 0) > 0 ||
    (checks[1].count ?? 0) > 0 ||
    (checks[2].count ?? 0) > 0 ||
    (checks[3].count ?? 0) > 0;

  if (hasDeps) {
    redirect(
      `/portal/admin/users?err=${enc(
        "Cannot purge: user has linked academic records. Use Deactivate instead."
      )}`
    );
  }

  // delete role rows first, then profile, then auth user
  await sb.from("students").delete().eq("id", id);
  await sb.from("teachers").delete().eq("id", id);
  await sb.from("parents").delete().eq("id", id);
  await sb.from("profiles").delete().eq("id", id);

  const { error } = await sb.auth.admin.deleteUser(id);
  if (error) redirect(`/portal/admin/users?err=${enc(error.message)}`);

  revalidatePath("/portal/admin/users");
  redirect(`/portal/admin/users?ok=1`);
}