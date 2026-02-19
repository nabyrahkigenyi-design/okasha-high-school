import { notFound } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/components/public/PageShell";
import { supabaseAdmin } from "@/lib/supabase/admin";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Disable caching for testing
export const dynamic = "force-dynamic";
export const revalidate = 0;

function DatePill({ date }: { date?: string | null }) {
  if (!date) return null;
  const d = new Date(date);
  return (
    <span className="inline-flex items-center rounded-full border bg-white/80 px-3 py-1 text-xs font-medium text-slate-700">
      {d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
    </span>
  );
}

export default async function NewsPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Unwrapping params for Next.js 15+
  const { slug } = await params;

  const sb = supabaseAdmin();

  const { data: post } = await sb
    .from("news_posts")
    .select("title, content_md, published_at, cover_image_url, status, slug")
    .eq("slug", slug)
    .maybeSingle();

  // Guard clause: if post doesn't exist or isn't published
  if (!post || post.status !== "published") notFound();

  // Related posts (same table, keep it simple)
  const { data: related } = await sb
    .from("news_posts")
    .select("id, slug, title, published_at")
    .eq("status", "published")
    .neq("slug", slug)
    .order("published_at", { ascending: false })
    .limit(4);

  const publishedLabel = post.published_at
    ? new Date(post.published_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    : "";

  return (
    <PageShell title={post.title} subtitle={publishedLabel}>
      {/* Breadcrumb + Header band */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-slate-600">
            <Link className="underline" href="/news">
              News
            </Link>{" "}
            <span className="text-slate-400">/</span>{" "}
            <span className="text-slate-700">Post</span>
          </div>
          <DatePill date={post.published_at} />
        </div>

        <div className="mt-4">
          <p className="text-sm font-semibold text-[color:var(--ohs-dark-green)]">
            Okasha High School — “Education is Light”
          </p>
          <p className="mt-1 text-sm text-slate-700" dir="rtl">
            العلم نور — إعلان رسمي من المدرسة
          </p>
        </div>
      </section>

      {/* Cover Image */}
      {post.cover_image_url ? (
        <div className="mt-6 overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="relative">
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="aspect-video w-full object-cover"
            />
            <div
              className="absolute inset-x-0 bottom-0 p-4 text-white"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0))",
              }}
            >
              <div className="text-sm font-semibold">{post.title}</div>
              <div className="text-xs text-white/80">{publishedLabel}</div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Content + Sidebar (mobile-first stacks) */}
      <section className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Article */}
        <article className="rounded-2xl border bg-white p-6 shadow-sm lg:p-10">
          <div className="prose prose-slate max-w-none prose-headings:tracking-tight prose-a:text-[color:var(--ohs-dark-green)]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content_md}
            </ReactMarkdown>
          </div>

          {/* Inline Arabic footer note */}
          <div className="mt-10 rounded-2xl border p-5" style={{ background: "var(--ohs-surface)" }}>
            <div className="text-sm font-semibold text-[color:var(--ohs-charcoal)]">Reminder</div>
            <p className="mt-2 text-sm text-slate-700">
              For any clarification about this notice, please contact the school office.
            </p>
            <p className="mt-3 text-sm text-slate-700" dir="rtl">
              للاستفسار حول هذا الإعلان، يرجى التواصل مع إدارة المدرسة.
            </p>
          </div>
        </article>

        {/* Sidebar */}
        <aside className="grid gap-6">
          <div className="rounded-2xl border p-6 shadow-sm" style={{ background: "var(--ohs-cream)" }}>
            <h3 className="text-base font-semibold text-[color:var(--ohs-charcoal)]">Quick Contacts</h3>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <p>
                Director:{" "}
                <a className="underline" href="tel:+256702444301">
                  0702444301
                </a>
              </p>
              <p>
                Admissions Office:{" "}
                <a className="underline" href="tel:+256740235451">
                  0740235451
                </a>
              </p>
              <p className="text-slate-600">Mbikko, Buikwe District, Jinja, Uganda</p>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-[color:var(--ohs-charcoal)]">Related Posts</h3>
            <div className="mt-3 grid gap-2">
              {(related ?? []).map((r) => (
                <Link
                  key={r.id}
                  href={`/news/${r.slug}`}
                  className="rounded-xl border bg-white px-4 py-3 text-sm hover:bg-[color:var(--ohs-surface)]"
                >
                  <div className="font-semibold text-[color:var(--ohs-charcoal)]">{r.title}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {r.published_at ? new Date(r.published_at).toLocaleDateString() : ""}
                  </div>
                </Link>
              ))}
              {(related ?? []).length === 0 ? (
                <div className="rounded-xl border bg-[color:var(--ohs-surface)] px-4 py-3 text-sm text-slate-600">
                  No related posts yet.
                </div>
              ) : null}
            </div>

            <div className="mt-4">
              <Link className="text-sm underline" href="/news">
                Back to all news →
              </Link>
            </div>
          </div>
        </aside>
      </section>

      {/* CTA */}
      <section
        className="mt-10 rounded-2xl border p-6 text-white shadow-sm"
        style={{ background: "var(--ohs-dark-green)" }}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-semibold">Stay connected with Okasha High School</h3>
            <p className="mt-2 text-sm text-white/90">
              Students and parents can view announcements and academic updates inside the portal.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link className="rounded-xl bg-white px-5 py-3 text-center text-sm font-semibold text-slate-900" href="/portal">
              Go to Portal
            </Link>
            <Link className="rounded-xl border border-white/30 px-5 py-3 text-center text-sm font-semibold text-white" href="/contact">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
