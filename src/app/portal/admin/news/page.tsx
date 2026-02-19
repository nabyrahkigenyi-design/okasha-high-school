// src/app/portal/admin/news/page.tsx

import Link from "next/link";
import { listNewsAdmin, getNewsAdmin } from "./queries";
import NewsEditor from "./NewsEditor";

export default async function AdminNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const params = await searchParams;

  const posts = await listNewsAdmin();
  const selectedId = params.id ? Number(params.id) : null;
  const selected = selectedId ? await getNewsAdmin(selectedId) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Editor */}
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

        <NewsEditor selected={selected as any} />
      </section>

      {/* Posts list */}
      <section className="rounded-2xl border bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Posts</h2>
            <p className="mt-1 text-sm text-slate-600">
              Click a post to edit.
            </p>
          </div>
        </div>

        <div className="mt-3 divide-y">
          {posts.map((p: any) => (
            <Link
              key={p.id}
              href={`/portal/admin/news?id=${p.id}`}
              className="block py-3 hover:bg-[color:var(--ohs-surface)] px-2 rounded-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium text-[color:var(--ohs-charcoal)]">
                    {p.title}
                  </div>
                  <div className="text-xs text-slate-500">
                    {p.status} • /news/{p.slug}
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  {p.updated_at ? new Date(p.updated_at).toLocaleDateString() : ""}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
