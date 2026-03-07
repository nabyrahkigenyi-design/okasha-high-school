"use client";

import { useState } from "react";
import { AttachmentUploader } from "./AttachmentUploader";

export function AttachmentField() {
  const [url, setUrl] = useState("");

  return (
    <div className="grid gap-2">
      <input type="hidden" name="attachment_url" value={url} readOnly />

      <AttachmentUploader onUploaded={(u) => setUrl(u)} />

      {url ? (
        <div className="text-xs text-slate-600 break-all">
          Uploaded:{" "}
          <a className="underline" href={url} target="_blank" rel="noreferrer">
            Open uploaded file
          </a>
        </div>
      ) : (
        <div className="text-xs text-slate-500">No file uploaded yet.</div>
      )}
    </div>
  );
}