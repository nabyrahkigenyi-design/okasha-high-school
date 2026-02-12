"use client";

import { useState } from "react";
import CoverImageUploader from "./CoverImageUploader";

export default function CoverImageField({ defaultValue }: { defaultValue?: string }) {
  const [url, setUrl] = useState(defaultValue ?? "");

  return (
    <div className="grid gap-2">
      <input
        className="rounded-lg border px-3 py-2"
        name="cover_image_url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Cover image URL (auto-filled after upload)"
      />

      <CoverImageUploader onUploaded={(u) => setUrl(u)} />

      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="mt-2 w-full max-w-md rounded-xl border object-cover" />
      ) : null}
    </div>
  );
}
