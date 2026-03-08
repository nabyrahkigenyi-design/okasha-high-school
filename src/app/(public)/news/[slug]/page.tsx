import { notFound } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/components/public/PageShell";
import { supabaseAdmin } from "@/lib/supabase/admin";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Disable caching for testing
export const dynamic = "force-dynamic";
export const revalidate = 0;

function DatePill({ date, variant = "default" }: { date?: string | null; variant?: "default" | "light" }) {
  if (!date) return null;
  const d = new Date(date);
  const baseClasses = "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium";
  const variantClasses = variant === "light" 
    ? "bg-white/20 text-white backdrop-blur-sm" 
    : "bg-slate-100 text-slate-600";
  
  return (
    <span className={`${baseClasses} ${variantClasses}`}>
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
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
    .select("title, content_md, published_at, cover_image_url, status, slug, excerpt")
    .eq("slug", slug)
    .maybeSingle();

  // Guard clause: if post doesn't exist or isn't published
  if (!post || post.status !== "published") notFound();

  const { data: related } = await sb
    .from("news_posts")
    .select("id, slug, title, published_at, excerpt, cover_image_url")
    .eq("status", "published")
    .neq("slug", slug)
    .order("published_at", { ascending: false })
    .limit(4);

  const publishedLabel = post.published_at
    ? new Date(post.published_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    : "";

  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    : "";

  return (
    <PageShell title={post.title} subtitle="Official announcement from Okasha High School">
      {/* BREADCRUMB */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500">
        <Link href="/" className="flex items-center gap-1.5 hover:text-[color:var(--ohs-dark-green)] transition-colors">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Home
        </Link>
        <svg className="h-4 w-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <Link href="/news" className="hover:text-[color:var(--ohs-dark-green)] transition-colors">
          News
        </Link>
        <svg className="h-4 w-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-slate-700 font-medium truncate max-w-[200px]">{post.title}</span>
      </nav>

      {/* HERO SECTION WITH COVER IMAGE */}
      <section className="relative overflow-hidden rounded-3xl border shadow-sm">
        {post.cover_image_url ? (
          <div className="relative">
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="aspect-[21/9] w-full object-cover"
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)" }} />
            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <DatePill date={post.published_at} variant="light" />
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--ohs-dark-green)] px-3 py-1 text-xs font-medium text-white">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Official Announcement
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white md:text-4xl lg:text-5xl drop-shadow-lg">
                {post.title}
              </h1>
            </div>
          </div>
        ) : (
          <div className="relative grid place-items-center p-10 md:p-16" style={{ background: "linear-gradient(135deg, var(--ohs-dark-green), var(--ohs-sky))" }}>
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white" />
              <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white" />
            </div>
            <div className="relative text-center">
              <svg className="mx-auto h-20 w-20 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              <h1 className="mt-6 text-2xl font-bold text-white md:text-4xl lg:text-5xl">
                {post.title}
              </h1>
              <div className="mt-4 flex justify-center">
                <DatePill date={post.published_at} variant="light" />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* META INFO BAR */}
      <section className="mt-6 rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[color:var(--ohs-dark-green)] to-[color:var(--ohs-sky)] text-white font-bold">
                O
              </div>
              <div>
                <p className="font-semibold text-slate-700">Okasha High School</p>
                <p className="text-xs text-slate-500">Official Source</p>
              </div>
            </div>
            <div className="hidden h-8 w-px bg-slate-200 md:block" />
            <div className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{formattedDate}</span>
            </div>
          </div>
          
          {/* Published Date Label */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Published:</span>
            <span className="text-xs font-semibold text-[color:var(--ohs-dark-green)]">{publishedLabel}</span>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT + SIDEBAR */}
      <section className="mt-8 grid gap-8 lg:grid-cols-[2fr_1fr]">
        {/* ARTICLE CONTENT */}
        <article className="rounded-3xl border bg-white p-6 shadow-sm md:p-10">
          {/* Excerpt/Intro */}
          {post.excerpt && (
            <div className="mb-8 rounded-2xl border-l-4 p-5" style={{ borderColor: "var(--ohs-dark-green)", background: "var(--ohs-surface)" }}>
              <p className="text-lg font-medium text-slate-700 italic">
                {post.excerpt}
              </p>
            </div>
          )}

          {/* Markdown Content */}
          <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-[color:var(--ohs-charcoal)] prose-a:text-[color:var(--ohs-dark-green)] prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-img:border prose-img:shadow-sm prose-blockquote:border-l-[color:var(--ohs-dark-green)] prose-blockquote:bg-slate-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-xl prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-strong:text-[color:var(--ohs-charcoal)]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content_md}
            </ReactMarkdown>
          </div>

          {/* Arabic Notice */}
          <div className="mt-10 overflow-hidden rounded-2xl border p-6 shadow-sm" style={{ background: "linear-gradient(135deg, var(--ohs-cream), white)" }}>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[color:var(--ohs-dark-green)] text-white">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-base font-bold text-[color:var(--ohs-charcoal)]">Important Notice / إشعار مهم</h4>
                <p className="mt-2 text-sm text-slate-700">
                  For any clarification about this announcement, please contact the school office during working hours.
                </p>
                <p className="mt-3 text-sm text-slate-700" dir="rtl">
                  للاستفسار حول هذا الإعلان، يرجى التواصل مع إدارة المدرسة خلال ساعات الدوام الرسمية.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a href="tel:+256702444301" className="inline-flex items-center gap-1.5 rounded-lg bg-[color:var(--ohs-dark-green)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    0702444301
                  </a>
                  <a href="tel:+256740235451" className="inline-flex items-center gap-1.5 rounded-lg border border-[color:var(--ohs-dark-green)] px-3 py-1.5 text-xs font-semibold text-[color:var(--ohs-dark-green)] hover:bg-[color:var(--ohs-dark-green)] hover:text-white transition">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    0740235451
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Back to News */}
          <div className="mt-8 flex items-center justify-between">
            <Link href="/news" className="group inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--ohs-dark-green)] hover:underline">
              <svg className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to All News
            </Link>
          </div>
        </article>

        {/* SIDEBAR */}
        <aside className="flex flex-col gap-6">
          {/* Quick Contacts */}
          <div className="rounded-2xl border p-6 shadow-sm" style={{ background: "var(--ohs-cream)" }}>
            <h3 className="flex items-center gap-2 text-base font-bold text-[color:var(--ohs-charcoal)]">
              <div className="h-1 w-4 rounded-full" style={{ background: "var(--ohs-dark-green)" }} />
              Quick Contacts
            </h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                  <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-slate-700">Director</p>
                  <a className="text-[color:var(--ohs-dark-green)] underline hover:text-[color:var(--ohs-sky)]" href="tel:+256702444301">
                    0702444301
                  </a>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                  <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-slate-700">Admissions Office</p>
                  <a className="text-[color:var(--ohs-dark-green)] underline hover:text-[color:var(--ohs-sky)]" href="tel:+256740235451">
                    0740235451
                  </a>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                  <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-slate-700">Location</p>
                  <p className="text-slate-600">Mbikko, Buikwe District</p>
                  <p className="text-slate-600">Jinja, Uganda</p>
                </div>
              </div>
            </div>
          </div>

          {/* Related Posts - WITH IMAGES */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="flex items-center gap-2 text-base font-bold text-[color:var(--ohs-charcoal)]">
              <div className="h-1 w-4 rounded-full" style={{ background: "var(--ohs-dark-green)" }} />
              Related Posts
            </h3>
            <div className="mt-4 grid gap-3">
              {(related ?? []).map((r) => (
                <Link
                  key={r.id}
                  href={`/news/${r.slug}`}
                  className="group flex items-start gap-3 rounded-xl border bg-white p-3 shadow-sm transition-all hover:border-[color:var(--ohs-sky)] hover:shadow-md"
                >
                  {/* Thumbnail Image */}
                  {r.cover_image_url ? (
                    <div className="flex-shrink-0 h-16 w-16 overflow-hidden rounded-lg border">
                      <img
                        src={r.cover_image_url}
                        alt={r.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-110"
                      />
                    </div>
                  ) : (
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg border bg-gradient-to-br from-[color:var(--ohs-cream)] to-[color:var(--ohs-sky)]">
                      <svg className="h-7 w-7 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-[color:var(--ohs-charcoal)] line-clamp-2 group-hover:text-[color:var(--ohs-dark-green)] transition-colors">
                      {r.title}
                    </h4>
                    <p className="mt-1 text-xs text-slate-500">
                      {r.published_at ? new Date(r.published_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : ""}
                    </p>
                  </div>
                  <svg className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-[color:var(--ohs-dark-green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
              {(related ?? []).length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border bg-slate-50 p-6 text-center">
                  <svg className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                  <p className="mt-3 text-sm text-slate-500">No related posts yet</p>
                </div>
              ) : null}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100">
              <Link className="group inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--ohs-dark-green)] hover:underline" href="/news">
                View All News
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Categories/Tags Placeholder */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="flex items-center gap-2 text-base font-bold text-[color:var(--ohs-charcoal)]">
              <div className="h-1 w-4 rounded-full" style={{ background: "var(--ohs-dark-green)" }} />
              Quick Navigation
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/news" className="rounded-full border bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-[color:var(--ohs-dark-green)] hover:text-[color:var(--ohs-dark-green)]">
                All News
              </Link>
              <Link href="/calendar" className="rounded-full border bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-[color:var(--ohs-dark-green)] hover:text-[color:var(--ohs-dark-green)]">
                Calendar
              </Link>
              <Link href="/admissions" className="rounded-full border bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-[color:var(--ohs-dark-green)] hover:text-[color:var(--ohs-dark-green)]">
                Admissions
              </Link>
              <Link href="/contact" className="rounded-full border bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-[color:var(--ohs-dark-green)] hover:text-[color:var(--ohs-dark-green)]">
                Contact
              </Link>
            </div>
          </div>
        </aside>
      </section>

      {/* CTA SECTION */}
      <section className="mt-12 overflow-hidden rounded-3xl border p-8 shadow-sm md:p-10" style={{ background: "linear-gradient(135deg, var(--ohs-dark-green), var(--ohs-sky))" }}>
        <div className="relative">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-white" />
            <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-white" />
          </div>
          
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white">Stay Connected with Okasha High School</h3>
              <p className="mt-2 text-base text-white/90">
                Students and parents can view announcements, assignments, and academic updates inside the portal.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link className="group flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-center text-sm font-semibold text-[color:var(--ohs-dark-green)] shadow-lg transition-all hover:shadow-xl hover:scale-105" href="/portal">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Go to Portal
              </Link>
              <Link className="group flex items-center justify-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 px-6 py-3.5 text-center text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-105" href="/contact">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}