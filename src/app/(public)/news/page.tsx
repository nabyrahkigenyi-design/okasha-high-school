import Link from "next/link";
import { PageShell } from "@/components/public/PageShell";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Force dynamic rendering to see changes immediately during testing
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "News | Okasha High School",
  description: "Announcements and news from Okasha High School.",
};

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

function clamp(text?: string | null, fallback = "", maxLength = 150) {
  const t = (text ?? "").trim();
  const content = t.length ? t : fallback;
  return content.length > maxLength ? content.substring(0, maxLength) + "..." : content;
}

function NewsCard({ post, variant = "default" }: { post: any; variant?: "default" | "compact" }) {
  if (variant === "compact") {
    return (
      <Link
        href={`/news/${post.slug}`}
        className="group flex items-start gap-4 rounded-xl border bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-[color:var(--ohs-sky)]"
      >
        {/* Thumbnail Image */}
        {post.cover_image_url ? (
          <div className="flex-shrink-0 h-20 w-20 overflow-hidden rounded-lg border">
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-110"
            />
          </div>
        ) : (
          <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg border bg-gradient-to-br from-[color:var(--ohs-cream)] to-[color:var(--ohs-sky)]">
            <svg className="h-8 w-8 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <DatePill date={post.published_at} />
          <h4 className="mt-2 text-base font-semibold text-[color:var(--ohs-charcoal)] line-clamp-2 group-hover:text-[color:var(--ohs-dark-green)] transition-colors">
            {post.title}
          </h4>
          <p className="mt-1.5 text-sm text-slate-600 line-clamp-2">
            {clamp(post.excerpt, "Tap to read the full announcement.", 100)}
          </p>
        </div>
        <svg className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-[color:var(--ohs-dark-green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    );
  }

  return (
    <Link
      href={`/news/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
    >
      {/* Card Image */}
      {post.cover_image_url ? (
        <div className="relative h-48 overflow-hidden">
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
          <div className="absolute top-4 left-4">
            <DatePill date={post.published_at} variant="light" />
          </div>
        </div>
      ) : (
        <div className="relative h-48 overflow-hidden" style={{ background: "linear-gradient(135deg, var(--ohs-cream), var(--ohs-sky))" }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="h-16 w-16 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <div className="absolute top-4 left-4">
            <DatePill date={post.published_at} />
          </div>
        </div>
      )}
      
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold text-[color:var(--ohs-charcoal)] line-clamp-2 group-hover:text-[color:var(--ohs-dark-green)] transition-colors">
          {post.title}
        </h3>
        
        <p className="mt-3 flex-1 text-sm text-slate-600 line-clamp-3">
          {clamp(post.excerpt, "Read the full announcement for more details and instructions.")}
        </p>
        
        <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-[color:var(--ohs-dark-green)]">
          <span>Read More</span>
          <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

function SidebarSection({ title, children, variant = "default" }: { title: string; children: React.ReactNode; variant?: "default" | "accent" }) {
  return (
    <div className={`rounded-2xl border p-6 shadow-sm ${variant === "accent" ? "bg-gradient-to-br from-[color:var(--ohs-cream)] to-white" : "bg-white"}`}>
      <h3 className="flex items-center gap-2 text-base font-bold text-[color:var(--ohs-charcoal)]">
        <div className="h-1 w-4 rounded-full" style={{ background: "var(--ohs-dark-green)" }} />
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export default async function NewsPage() {
  const sb = supabaseAdmin();
  const { data: posts } = await sb
    .from("news_posts")
    .select("id, slug, title, excerpt, published_at, cover_image_url")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(30);

  const list = posts ?? [];
  const featured = list[0];
  const recent = list.slice(1, 4);
  const archive = list.slice(4);

  return (
    <PageShell title="News & Updates" subtitle="Stay informed with the latest announcements, events, and important notices from Okasha High School.">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl border shadow-sm" style={{ background: "linear-gradient(135deg, var(--ohs-dark-green), var(--ohs-sky))" }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white" />
        </div>
        
        <div className="relative p-8 md:p-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Established 1996
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Mixed Day & Boarding
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  National + Islamic Studies
                </span>
              </div>

              <h1 className="mt-5 text-3xl font-bold tracking-tight text-white md:text-4xl">
                School News & Announcements
              </h1>
              
              <p className="mt-4 max-w-2xl text-lg text-white/90">
                Here you'll find official school announcements, academic updates, events, and important notices for parents, students, and staff.
              </p>
              
              <p className="mt-4 max-w-2xl text-base text-white/80" dir="rtl">
                الأخبار والإعلانات الرسمية للمدرسة — تابع آخر المستجدات والفعاليات المهمة.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                href="/calendar"
                className="group flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-[color:var(--ohs-dark-green)] shadow-lg transition-all hover:shadow-xl hover:scale-105"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                View Calendar
              </Link>
              <Link
                href="/contact"
                className="group flex items-center justify-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-105"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT GRID */}
      <section className="mt-10 grid gap-8 lg:grid-cols-[2fr_1fr]">
        {/* LEFT: NEWS FEED */}
        <div className="flex flex-col gap-8">
          {/* FEATURED POST */}
          {featured ? (
            <article className="group overflow-hidden rounded-3xl border bg-white shadow-sm transition-all hover:shadow-xl">
              <Link href={`/news/${featured.slug}`} className="block">
                <div className="grid gap-0 md:grid-cols-2">
                  {/* Featured Image */}
                  {featured.cover_image_url ? (
                    <div className="relative h-64 overflow-hidden md:h-full">
                      <img
                        src={featured.cover_image_url}
                        alt={featured.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      <div className="absolute top-5 left-5">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--ohs-dark-green)] px-4 py-1.5 text-xs font-bold text-white shadow-sm">
                          <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                          Featured
                        </span>
                      </div>
                      <div className="absolute bottom-5 left-5">
                        <DatePill date={featured.published_at} variant="light" />
                      </div>
                    </div>
                  ) : (
                    <div className="relative h-64 overflow-hidden md:h-full" style={{ background: "linear-gradient(135deg, var(--ohs-cream), var(--ohs-sky), var(--ohs-pale-green))" }}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="h-24 w-24 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                      </div>
                      <div className="absolute top-5 left-5">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-4 py-1.5 text-xs font-bold text-[color:var(--ohs-dark-green)] shadow-sm">
                          <span className="h-2 w-2 rounded-full bg-[color:var(--ohs-dark-green)] animate-pulse" />
                          Featured
                        </span>
                      </div>
                      <div className="absolute bottom-5 left-5">
                        <DatePill date={featured.published_at} />
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-col justify-center p-6 md:p-8">
                    <h2 className="text-2xl font-bold tracking-tight text-[color:var(--ohs-charcoal)] group-hover:text-[color:var(--ohs-dark-green)] transition-colors md:text-3xl">
                      {featured.title}
                    </h2>
                    
                    <p className="mt-4 text-base text-slate-600">
                      {clamp(featured.excerpt, "Read the full announcement for more details, instructions, and important information regarding this update.", 200)}
                    </p>
                    
                    <div className="mt-6 flex items-center gap-2 text-base font-bold text-[color:var(--ohs-dark-green)]">
                      <span>Read Full Article</span>
                      <svg className="h-5 w-5 transition-transform group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </article>
          ) : (
            <div className="flex items-center justify-center rounded-3xl border bg-white p-12 text-center">
              <div>
                <svg className="mx-auto h-16 w-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                <h3 className="mt-4 text-lg font-semibold text-slate-700">No News Yet</h3>
                <p className="mt-2 text-sm text-slate-500">Check back soon for the latest announcements and updates.</p>
              </div>
            </div>
          )}

          {/* RECENT POSTS GRID */}
          {recent.length > 0 && (
            <div>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-[color:var(--ohs-charcoal)]">Recent Updates</h2>
                <span className="text-sm text-slate-500">{recent.length} articles</span>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                {recent.map((p) => (
                  <NewsCard key={p.id} post={p} variant="default" />
                ))}
              </div>
            </div>
          )}

          {/* ARCHIVE POSTS - COMPACT LIST */}
          {archive.length > 0 && (
            <div>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-[color:var(--ohs-charcoal)]">Archive</h2>
                <Link href="/news/archive" className="text-sm font-semibold text-[color:var(--ohs-dark-green)] hover:underline">
                  View All →
                </Link>
              </div>
              <div className="grid gap-3">
                {archive.slice(0, 5).map((p) => (
                  <NewsCard key={p.id} post={p} variant="compact" />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: SIDEBAR */}
        <aside className="flex flex-col gap-6">
          <SidebarSection title="Quick Links">
            <div className="grid gap-2.5">
              <Link className="group flex items-center justify-between rounded-xl border bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-all hover:border-[color:var(--ohs-sky)] hover:bg-[color:var(--ohs-surface)]" href="/admissions">
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-slate-400 group-hover:text-[color:var(--ohs-dark-green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Admissions & Forms
                </span>
                <svg className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link className="group flex items-center justify-between rounded-xl border bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-all hover:border-[color:var(--ohs-sky)] hover:bg-[color:var(--ohs-surface)]" href="/fees">
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-slate-400 group-hover:text-[color:var(--ohs-dark-green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Tuition & Fees
                </span>
                <svg className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link className="group flex items-center justify-between rounded-xl border bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-all hover:border-[color:var(--ohs-sky)] hover:bg-[color:var(--ohs-surface)]" href="/programs">
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-slate-400 group-hover:text-[color:var(--ohs-dark-green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Academic Programs
                </span>
                <svg className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link className="group flex items-center justify-between rounded-xl border bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-all hover:border-[color:var(--ohs-sky)] hover:bg-[color:var(--ohs-surface)]" href="/policies">
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-slate-400 group-hover:text-[color:var(--ohs-dark-green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  School Policies
                </span>
                <svg className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </SidebarSection>

          <SidebarSection title="Note to Parents" variant="accent">
            <p className="text-sm text-slate-700">
              Important messages may include reporting dates, fee reminders, exam schedules, and school requirements.
              Please read posts carefully and contact the office when in doubt.
            </p>
            <p className="mt-3 text-sm text-slate-700" dir="rtl">
              يرجى متابعة الأخبار باستمرار — فقد تتضمن مواعيد الحضور والاختبارات والإعلانات المهمة.
            </p>
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-white/60 p-3">
              <svg className="h-5 w-5 text-[color:var(--ohs-dark-green)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-slate-600">
                <strong>Tip:</strong> Bookmark this page or check the portal regularly for student-specific notices.
              </p>
            </div>
          </SidebarSection>

          <SidebarSection title="Contact Information">
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
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
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
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
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
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
          </SidebarSection>

          {/* NEWSLETTER CTA */}
          <div className="overflow-hidden rounded-2xl border p-6 shadow-sm" style={{ background: "var(--ohs-dark-green)" }}>
            <h3 className="text-base font-bold text-white">Stay Updated</h3>
            <p className="mt-2 text-sm text-white/80">
              Get the latest news delivered to your inbox.
            </p>
            <div className="mt-4 flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 rounded-lg border-0 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-white/50"
              />
              <button className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-[color:var(--ohs-dark-green)] transition hover:bg-slate-100">
                Subscribe
              </button>
            </div>
          </div>
        </aside>
      </section>

      {/* CTA STRIP */}
      <section className="mt-12 overflow-hidden rounded-3xl border p-8 shadow-sm md:p-10" style={{ background: "linear-gradient(135deg, var(--ohs-dark-green), var(--ohs-sky))" }}>
        <div className="relative">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-white" />
            <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-white" />
          </div>
          
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white">Want to receive updates?</h3>
              <p className="mt-2 text-base text-white/90">
                Visit the portal for student notices and academic updates, or contact the school office for official guidance.
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