"use client";

import { useState } from "react";

type PresignResponse =
  | { uploadUrl: string; publicUrl: string }
  | { url: string; publicUrl: string }
  | { upload_url: string; public_url: string }
  | any;

export function AttachmentUploader({
  onUploaded,
}: {
  onUploaded: (publicUrl: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleFile(file: File) {
    setErr(null);
    setBusy(true);
    try {
      // 1) get presigned upload URL
      const res = await fetch("/api/uploads/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type || "application/octet-stream",
        }),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Failed to presign upload");
      }

      const json: PresignResponse = await res.json();

      // Support a few common shapes
      const uploadUrl =
        json.uploadUrl || json.url || json.upload_url;
      const publicUrl =
        json.publicUrl || json.public_url || json.publicURL;

      if (!uploadUrl || !publicUrl) {
        throw new Error("Presign response missing uploadUrl/publicUrl");
      }

      // 2) upload file to storage
      const put = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
        body: file,
      });

      if (!put.ok) {
        const t = await put.text();
        throw new Error(t || "Upload failed");
      }

      // 3) give back public URL to store in DB
      onUploaded(publicUrl);
    } catch (e: any) {
      setErr(e?.message ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-2">
      <input
        type="file"
        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
        disabled={busy}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
        }}
      />
      {busy ? <div className="text-xs text-slate-600">Uploading…</div> : null}
      {err ? <div className="text-xs text-red-700">{err}</div> : null}
      <div className="text-xs text-slate-500">
        Allowed: PDF/DOC/DOCX/PNG/JPG. After upload, the URL is saved automatically.
      </div>
    </div>
  );
}