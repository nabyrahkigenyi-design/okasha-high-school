// src/app/portal/admin/news/page.tsx

import Link from "next/link";
import { listNewsAdmin, getNewsAdmin } from "./queries";
import { upsertNewsPost, deleteNewsPost } from "./actions";
import CoverImageField from "./CoverImageField";
import NewsEditor from "./NewsEditor";


export default async function AdminNewsPage({
  searchParams,
}: {
  // 1. Update the type to a Promise
  searchParams: Promise<{ id?: string }>;
}) {
  // 2. Await the searchParams before using them
  const params = await searchParams;
  
  const posts = await listNewsAdmin();
  const selectedId = params.id ? Number(params.id) : null;
  const selected = selectedId ? await getNewsAdmin(selectedId) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">News</h1>
            <p className="mt-1 text-sm text-slate-600">
              Create, edit, and publish posts.
            </p>
          </div>
          <Link className="underline text-sm" href="/portal/admin/news">
            New post
          </Link>
        </div>

        {/* Main Upsert Form */}
        <form action={upsertNewsPost} className="mt-4 grid gap-3">
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
            <button
              type="submit"
              className="rounded-xl px-4 py-2 font-medium text-white"
              style={{ background: "var(--ohs-dark-green)" }}
            >
              Save
            </button>
          </div>

          <p className="text-xs text-slate-500">
            Tip: keep slugs lowercase with hyphens only.
          </p>
        </form>

        {selected?.id ? (
          <div className="mt-6 border-t pt-4">
            <form action={deleteNewsPost}>
              <input type="hidden" name="id" value={selected.id} />
              <button
                className="text-sm text-red-600 underline hover:text-red-800 transition-colors"
                type="submit"
              >
                Delete this post
              </button>
            </form>
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border bg-white p-5">
  <div className="flex items-start justify-between gap-4">
    <div>
      <h1 className="text-xl font-semibold">News</h1>
      <p className="mt-1 text-sm text-slate-600">Create, edit, and publish posts.</p>
    </div>
  </div>

  <NewsEditor selected={selected as any} />
</section>

    </div>
  );
}