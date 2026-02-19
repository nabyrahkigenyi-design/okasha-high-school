"use client";

import { useState } from "react";

function PdfUploader({
  onUploaded,
  onFileName,
}: {
  onUploaded: (url: string) => void;
  onFileName: (name: string) => void;
}) {
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
          folder: "docs",
        }),
      });

      const presign = await presignRes.json();
      if (!presignRes.ok || !presign.ok) {
        setError(presign?.error ?? "Failed to presign upload");
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
      onFileName(file.name);
    } catch {
      setError("Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-3">
        <input
          type="file"
          accept="application/pdf"
          disabled={busy}
          onChange={(e) => onPick(e.target.files?.[0] ?? null)}
        />
        {busy ? <span className="text-sm text-slate-600">Uploading…</span> : null}
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <p className="text-xs text-slate-500">PDF only. Stored in R2 and served via CDN.</p>
    </div>
  );
}

export default function PdfField({ defaultUrl, defaultName }: { defaultUrl?: string; defaultName?: string }) {
  const [url, setUrl] = useState(defaultUrl ?? "");
  const [name, setName] = useState(defaultName ?? "");

  return (
    <div className="grid gap-2">
      <input
        className="rounded-lg border px-3 py-2"
        name="file_url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="PDF URL (auto-filled after upload)"
        required
      />
      <input
        className="rounded-lg border px-3 py-2"
        name="file_name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="File name (auto-filled)"
      />

      <PdfUploader onUploaded={setUrl} onFileName={setName} />

      {url ? (
        <a className="text-sm underline" href={url} target="_blank" rel="noreferrer">
          Preview PDF (new tab)
        </a>
      ) : null}
    </div>
  );
}
