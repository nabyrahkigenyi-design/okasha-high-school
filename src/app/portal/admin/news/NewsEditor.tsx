"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { NewsActionState } from "./actions";
import { upsertNewsPost } from "./actions";
import CoverImageField from "./CoverImageField";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="rounded-xl px-4 py-2 font-medium text-white disabled:opacity-60"
      style={{ background: "var(--ohs-dark-green)" }}
      type="submit"
    >
      {pending ? "Saving..." : "Save"}
    </button>
  );
}

export default function NewsEditor({
  selected,
}: {
  selected?: {
    id: number;
    slug: string;
    title: string;
    excerpt: string | null;
    content_md: string;
    cover_image_url: string | null;
    status: "draft" | "published";
  } | null;
}) {
  const [state, formAction] = useFormState<NewsActionState, FormData>(
    upsertNewsPost,
    undefined
  );

  return (
    <div>
      <form action={formAction} className="mt-4 grid gap-3">
        <input type="hidden" name="id" value={selected?.id ?? ""} />

        <label className="grid gap-1">
          <span className="text-sm">Slug</span>
          <input
            className="rounded-lg border px-3 py-2"
            name="slug"
            required
            defaultValue={selected?.slug ?? ""}
            placeholder="e.g. admissions-open"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm">Title</span>
          <input
            className="rounded-lg border px-3 py-2"
            name="title"
            required
            defaultValue={selected?.title ?? ""}
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm">Excerpt</span>
          <input
            className="rounded-lg border px-3 py-2"
            name="excerpt"
            defaultValue={selected?.excerpt ?? ""}
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm">Cover image</span>
          <CoverImageField defaultValue={selected?.cover_image_url ?? ""} />
        </label>

        <label className="grid gap-1">
          <span className="text-sm">Content (Markdown)</span>
          <textarea
            className="min-h-[240px] rounded-lg border px-3 py-2"
            name="content_md"
            required
            defaultValue={selected?.content_md ?? ""}
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm">Status</span>
          <select
            className="rounded-lg border px-3 py-2"
            name="status"
            defaultValue={selected?.status ?? "draft"}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>

        <div className="flex items-center gap-3">
          <SubmitButton />
          {state?.ok ? <span className="text-sm text-green-700">{state.message}</span> : null}
          {!state?.ok && state?.error ? <span className="text-sm text-red-600">{state.error}</span> : null}
        </div>
      </form>
    </div>
  );
}
