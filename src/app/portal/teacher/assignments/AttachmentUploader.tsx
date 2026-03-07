"use client";

import { useState } from "react";

type PresignResponse =
  | { ok?: boolean; uploadUrl: string; publicUrl: string; key?: string }
  | { ok?: boolean; url: string; publicUrl: string }
  | { ok?: boolean; upload_url: string; public_url: string }
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
      const res = await fetch("/api/uploads/presign", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type || "application/octet-stream",
          folder: "assignments",
        }),
      });

      const json: PresignResponse = await res.json().catch(() => null);

      if (!res.ok || !json?.ok) {
        const apiError =
          json?.error ||
          (typeof json === "string" ? json : null) ||
          "Failed to presign upload";
        throw new Error(apiError);
      }

      const uploadUrl = json.uploadUrl || json.url || json.upload_url;
      const publicUrl = json.publicUrl || json.public_url || json.publicURL;

      if (!uploadUrl || !publicUrl) {
        throw new Error("Presign response missing uploadUrl/publicUrl");
      }

      const put = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
        body: file,
      });

      if (!put.ok) {
        const t = await put.text().catch(() => "");
        throw new Error(t || "Upload failed");
      }

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
        accept=".pdf,.png,.jpg,.jpeg,.webp"
        disabled={busy}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
        }}
      />

      {busy ? <div className="text-xs text-slate-600">Uploading…</div> : null}
      {err ? <div className="text-xs text-red-700">{err}</div> : null}

      <div className="text-xs text-slate-500">
        Allowed: PDF, PNG, JPG, JPEG, WEBP. After upload, the file URL is attached automatically.
      </div>
    </div>
  );
}