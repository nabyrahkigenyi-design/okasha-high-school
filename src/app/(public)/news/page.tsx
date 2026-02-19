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

function DatePill({ date }: { date?: string | null }) {
  if (!date) return null;
  const d = new Date(date);
  return (
    <span className="inline-flex items-center rounded-full border bg-white/80 px-3 py-1 text-xs font-medium text-slate-700">
      {d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
    </span>
  );
}

function clamp(text?: string | null, fallback = "") {
  const t = (text ?? "").trim();
  return t.length ? t : fallback;
}

export default async function NewsPage() {
  const sb = supabaseAdmin();
  const { data: posts } = await sb
    .from("news_posts")
    .select("id, slug, title, excerpt, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(30);

  const list = posts ?? [];
  const featured = list[0];
  const rest = list.slice(1);

  return (
    <PageShell title="News" subtitle="School announcements, events, and updates from Okasha High School.">
      {/* TOP STRIP */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex rounded-full border bg-white px-3 py-1 text-xs text-slate-700">
                Established 1996
              </span>
              <span className="inline-flex rounded-full border bg-white px-3 py-1 text-xs text-slate-700">
                Mixed Day & Boarding
              </span>
              <span className="inline-flex rounded-full border bg-white px-3 py-1 text-xs text-slate-700">
                National + Islamic Studies
              </span>
            </div>

            <p className="mt-3 text-sm text-slate-600">
              Here you’ll find official school announcements, academic updates, events, and important notices.
            </p>

            <p className="mt-3 text-sm text-slate-700" dir="rtl">
              الأخبار والإعلانات الرسمية للمدرسة — تابع آخر المستجدات والفعاليات.
            </p>
          </div>

          <div className="grid gap-2">
            <Link
              href="/calendar"
              className="rounded-xl border bg-white px-5 py-3 text-center text-sm font-semibold hover:bg-[color:var(--ohs-surface)]"
            >
              View Calendar
            </Link>
            <Link
              href="/contact"
              className="rounded-xl px-5 py-3 text-center text-sm font-semibold text-white"
              style={{ background: "var(--ohs-dark-green)" }}
            >
              Contact the School
            </Link>
          </div>
        </div>
      </section>

      {/* MAIN GRID */}
      <section className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* LEFT: POSTS */}
        <div className="grid gap-6">
          {/* FEATURED */}
          {featured ? (
            <Link
              href={`/news/${featured.slug}`}
              className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md"
            >
              <div
                className="p-6"
                style={{
                  background:
                    "linear-gradient(135deg, var(--ohs-cream), var(--ohs-sky), var(--ohs-pale-green))",
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <DatePill date={featured.published_at} />
                  <span className="inline-flex items-center rounded-full border bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700">
                    Latest
                  </span>
                </div>

                <h2 className="mt-3 text-2xl font-bold tracking-tight text-[color:var(--ohs-charcoal)]">
                  {featured.title}
                </h2>

                <p className="mt-3 text-sm text-slate-700">
                  {clamp(
                    featured.excerpt,
                    "Read the full announcement for more details and instructions."
                  )}
                </p>

                <div className="mt-4 text-sm font-semibold text-[color:var(--ohs-charcoal)]">
                  Read more <span className="transition group-hover:translate-x-1 inline-block">→</span>
                </div>
              </div>
            </Link>
          ) : (
            <div className="rounded-2xl border bg-white p-6 text-sm text-slate-600">
              No published posts yet. Please check back soon.
            </div>
          )}

          {/* REST */}
          <div className="grid gap-5 md:grid-cols-2">
            {rest.map((p) => (
              <Link
                key={p.id}
                href={`/news/${p.slug}`}
                className="group rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center justify-between gap-3">
                  <DatePill date={p.published_at} />
                  <span className="text-slate-400 transition group-hover:translate-x-1">→</span>
                </div>

                <h3 className="mt-3 text-lg font-semibold text-[color:var(--ohs-charcoal)]">
                  {p.title}
                </h3>

                <p className="mt-2 text-sm text-slate-600 line-clamp-3">
                  {clamp(p.excerpt, "Tap to read the full post.")}
                </p>

                <div className="mt-3 text-xs text-slate-500">
                  Official school update
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* RIGHT: SIDEBAR */}
        <aside className="grid gap-6">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-[color:var(--ohs-charcoal)]">Quick Links</h3>
            <div className="mt-3 grid gap-2 text-sm">
              <Link className="rounded-xl border bg-white px-4 py-2 hover:bg-[color:var(--ohs-surface)]" href="/admissions">
                Admissions & Forms
              </Link>
              <Link className="rounded-xl border bg-white px-4 py-2 hover:bg-[color:var(--ohs-surface)]" href="/fees">
                Tuition & Fees
              </Link>
              <Link className="rounded-xl border bg-white px-4 py-2 hover:bg-[color:var(--ohs-surface)]" href="/programs">
                Academic Programs
              </Link>
              <Link className="rounded-xl border bg-white px-4 py-2 hover:bg-[color:var(--ohs-surface)]" href="/policies">
                School Policies
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border p-6 shadow-sm" style={{ background: "var(--ohs-cream)" }}>
            <h3 className="text-base font-semibold text-[color:var(--ohs-charcoal)]">Note to Parents</h3>
            <p className="mt-2 text-sm text-slate-700">
              Important messages may include reporting dates, fee reminders, exam schedules, and school requirements.
              Please read posts carefully and contact the office when in doubt.
            </p>
            <p className="mt-3 text-sm text-slate-700" dir="rtl">
              يرجى متابعة الأخبار باستمرار — فقد تتضمن مواعيد الحضور والاختبارات والإعلانات المهمة.
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-[color:var(--ohs-charcoal)]">Contacts</h3>
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
        </aside>
      </section>

      {/* CTA STRIP */}
      <section className="mt-10 rounded-2xl border p-6 text-white shadow-sm" style={{ background: "var(--ohs-dark-green)" }}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-semibold">Want to receive updates?</h3>
            <p className="mt-2 text-sm text-white/90">
              Visit the portal for student notices and academic updates, or contact the school office for official guidance.
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
