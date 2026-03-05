"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";

const sb = () => supabaseAdmin();

export async function createAdminAnnouncement(fd: FormData) {
  const me = await requireRole(["admin"]);

  const Schema = z.object({
    term_id: z.coerce.number().int().positive(),
    class_id: z.string().optional(), // "" means null => term-wide
    title: z.string().min(2).max(160),
    body: z.string().min(2).max(5000),
  });

  const parsed = Schema.safeParse({
    term_id: fd.get("term_id"),
    class_id: fd.get("class_id") ? String(fd.get("class_id")) : "",
    title: String(fd.get("title") ?? ""),
    body: String(fd.get("body") ?? ""),
  });

  const back = `/portal/admin/announcements?termId=${Number(fd.get("term_id") ?? 0) || ""}`;

  if (!parsed.success) {
    redirect(`${back}&err=${encodeURIComponent("Please fill in term, title, and message.")}`);
  }

  const class_id = parsed.data.class_id ? Number(parsed.data.class_id) : null;

  const { error } = await sb().from("announcements").insert({
    term_id: parsed.data.term_id,
    class_id,
    title: parsed.data.title,
    body: parsed.data.body,
    created_by: me.id,
  });

  if (error) redirect(`${back}&err=${encodeURIComponent(error.message)}`);

  revalidatePath("/portal/admin/announcements");
  redirect(`${back}&ok=1`);
}

export async function deleteAdminAnnouncement(fd: FormData) {
  await requireRole(["admin"]);
  const id = Number(fd.get("id") ?? 0);
  const termId = Number(fd.get("term_id") ?? 0);

  const back = `/portal/admin/announcements${termId ? `?termId=${termId}` : ""}`;
  if (!id) redirect(`${back}&err=${encodeURIComponent("Missing id.")}`);

  const { error } = await sb().from("announcements").delete().eq("id", id);
  if (error) redirect(`${back}&err=${encodeURIComponent(error.message)}`);

  revalidatePath("/portal/admin/announcements");
  redirect(`${back}&ok=1`);
}