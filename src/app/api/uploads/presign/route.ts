// src/app/api/uploads/presign/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client } from "@/lib/r2";
import { supabaseSSR } from "@/lib/supabase/ssr";

export const runtime = "nodejs";

const Schema = z.object({
  fileName: z.string().min(1).max(200),
  contentType: z.string().min(1).max(120),
  folder: z.enum(["news", "staff", "docs", "assignments"]).default("news"),
});

function safeExt(name: string) {
  const m = name.toLowerCase().match(/\.([a-z0-9]{1,8})$/);
  return m ? m[1] : "bin";
}

function randomId() {
  return crypto.randomUUID();
}

export async function POST(req: Request) {
  try {
    // Auth: must be logged in
    const sb = await supabaseSSR();
    const { data: userData } = await sb.auth.getUser();
    const user = userData.user;
    if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

    // Profile check
    const { data: profile, error: profErr } = await sb
      .from("profiles")
      .select("role_key,is_active")
      .eq("id", user.id)
      .maybeSingle();

    if (profErr) {
      return NextResponse.json({ ok: false, error: profErr.message }, { status: 500 });
    }

    if (!profile?.is_active) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    // Allow admin + teacher
    const role = profile.role_key;
    const allowedRoles = new Set(["admin", "teacher"]);
    if (!allowedRoles.has(role)) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
    }

    // Folder restrictions:
    // - teachers can only upload to assignments
    // - admins can upload to any folder
    if (role === "teacher" && parsed.data.folder !== "assignments") {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    // Allow images and PDFs (you can add docx later)
    const allowed = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
    if (!allowed.has(parsed.data.contentType)) {
      return NextResponse.json({ ok: false, error: "Unsupported file type" }, { status: 400 });
    }

    const bucket = process.env.R2_BUCKET!;
    const ext = safeExt(parsed.data.fileName);

    // Key format: folder/yyyy-mm/<uuid>.<ext>
    const ym = new Date().toISOString().slice(0, 7);
    const key = `${parsed.data.folder}/${ym}/${randomId()}.${ext}`;

    const s3 = r2Client();
    const cmd = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: parsed.data.contentType,
      // Optional: metadata to help auditing later
      Metadata: {
        uploaded_by: user.id,
        role,
      },
    });

    const uploadUrl = await getSignedUrl(s3, cmd, { expiresIn: 60 });
    const publicUrl = `${process.env.R2_PUBLIC_BASE_URL!.replace(/\/$/, "")}/${key}`;

    return NextResponse.json({ ok: true, uploadUrl, publicUrl, key });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}