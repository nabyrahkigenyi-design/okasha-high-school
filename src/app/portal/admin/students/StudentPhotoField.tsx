"use client";

import { useState } from "react";

function StudentPhotoUploader({ onUploaded }: { onUploaded: (url: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPick(file: File | null) {
    if (!file) return;

    setBusy(true);
    setError(null);

    try {
      const presignRes = await fetch("/api/uploads/presign", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          folder: "students",
        }),
      });

      const presign = await presignRes.json();

      if (!presignRes.ok || !presign.ok) {
        setError(presign?.error ?? "Failed to prepare upload");
        setBusy(false);
        return;
      }

      const putRes = await fetch(presign.uploadUrl, {
        method: "PUT",
        headers: { "content-type": file.type },
        body: file,
      });

      if (!putRes.ok) {
        setError("Upload failed");
        setBusy(false);
        return;
      }

      onUploaded(presign.publicUrl);
    } catch {
      setError("Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          disabled={busy}
          onChange={(e) => onPick(e.target.files?.[0] ?? null)}
        />
        {busy ? <span className="text-sm text-slate-600">Uploading…</span> : null}
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <p className="text-xs text-slate-500">
        JPG/PNG/WebP. Passport-size or clear portrait recommended.
      </p>
    </div>
  );
}

export default function StudentPhotoField({ defaultValue }: { defaultValue?: string }) {
  const [url, setUrl] = useState(defaultValue ?? "");

  return (
    <div className="grid gap-3">
      <input
        className="portal-input"
        name="photo_url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Photo URL (auto-filled after upload)"
      />

      <StudentPhotoUploader onUploaded={(uploadedUrl) => setUrl(uploadedUrl)} />

      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt="Student preview"
          className="h-28 w-28 rounded-2xl border border-slate-200 object-cover"
        />
      ) : null}
    </div>
  );
}