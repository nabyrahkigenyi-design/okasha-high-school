import Link from "next/link";
import HeroCarousel from "./HeroCarousel";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  GraduationCap,
  BookOpenCheck,
  Home,
  Newspaper,
  CalendarDays,
  Users2,
  ArrowRight,
} from "lucide-react";

export const revalidate = 3600;

export const metadata = {
  title: "Okasha High School | OHS",
  description:
    "Okasha High School (OHS) — Mixed day and boarding secondary school established in 1996, integrating the national curriculum with Islamic theology.",
};

// ---------- UI helpers ----------
function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-extrabold tracking-[0.18em] text-slate-500">
      {children}
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-extrabold text-white backdrop-blur-sm">
      {children}
    </span>
  );
}

function IconBadge({
  icon,
  label,
  tone = "sky",
}: {
  icon: React.ReactNode;
  label: string;
  tone?: "sky" | "cream" | "green";
}) {
  const bg =
    tone === "green"
      ? "var(--ohs-dark-green)"
      : tone === "cream"
      ? "var(--ohs-cream)"
      : "var(--ohs-sky)";

  const text =
    tone === "green" ? "text-white" : "text-[color:var(--ohs-charcoal)]";

  return (
    <div className="flex items-center gap-2 rounded-2xl border bg-white px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]">
      <span
        className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl border ${text}`}
        style={{ background: bg }}
        aria-hidden
      >
        {icon}
      </span>
      <div className="text-sm font-extrabold text-[color:var(--ohs-charcoal)]">
        {label}
      </div>
    </div>
  );
}

function EditorialCard({
  title,
  desc,
  href,
  imageSrc,
}: {
  title: string;
  desc: string;
  href: string;
  imageSrc: string;
}) {
  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.99]"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="p-7 lg:p-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-[color:var(--ohs-surface)] px-4 py-1.5 text-xs font-extrabold tracking-wide text-slate-700">
            <span className="text-[color:var(--ohs-dark-green)]">●</span> FEATURE
          </div>

          <h3 className="mb-3 text-2xl font-extrabold tracking-tight text-[color:var(--ohs-charcoal)]">
            {title}
          </h3>
          <p className="text-slate-600">{desc}</p>

          <div className="mt-6 inline-flex items-center gap-2 font-extrabold text-[color:var(--ohs-dark-green)]">
            Learn more{" "}
            <span className="transition-transform group-hover:translate-x-1">
              <ArrowRight size={18} />
            </span>
          </div>
        </div>

        <div className="relative h-64 lg:h-auto">
          {/* shimmer placeholder */}
          <div className="absolute inset-0 animate-pulse bg-slate-200" />
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url(${imageSrc})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
        </div>
      </div>
    </Link>
  );
}

function StaffMiniCard({
  name,
  role,
  photoUrl,
}: {
  name: string;
  role: string;
  photoUrl?: string | null;
}) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  return (
    <div className="group rounded-3xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]">
      <div className="flex items-center gap-4">
        <div className="relative h-14 w-14 overflow-hidden rounded-2xl border bg-[color:var(--ohs-surface)]">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt={name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-sm font-extrabold text-[color:var(--ohs-charcoal)]">
              {initials}
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="truncate font-extrabold text-[color:var(--ohs-charcoal)]">
            {name}
          </div>
          <div className="truncate text-sm text-slate-600">{role}</div>
        </div>
      </div>

      <div className="mt-4 text-xs font-extrabold tracking-[0.18em] text-slate-500">
        ADMINISTRATION
      </div>
    </div>
  );
}

// ---------- Data ----------
async function getHomeData() {
  const sb = supabaseAdmin();
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: news }, { data: events }, { data: staff }] = await Promise.all([
    sb
      .from("news_posts")
      .select("id, slug, title, excerpt, cover_image_url, published_at, status")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(3),

    sb
      .from("calendar_events")
      .select("id, title, starts_on, ends_on, category")
      .eq("is_published", true)
      .gte("starts_on", today)
      .order("starts_on", { ascending: true })
      .limit(4),

    sb
      .from("staff_members")
      .select("id, full_name, role_title, photo_url, department, sort_order, is_published")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .limit(4),
  ]);

  return {
    news: news ?? [],
    events: events ?? [],
    staff: staff ?? [],
  };
}

function fmtRange(starts: string, ends?: string | null) {
  if (!ends || ends === starts) return starts;
  return `${starts} → ${ends}`;
}

// ---------- Page ----------
export default async function HomePage() {
  const { news, events, staff } = await getHomeData();

  // Use your rotating images (you can add more later)
  const heroImages = [
    {
      src: "https://i.ibb.co/prh924y4/Whats-App-Image-2025-08-05-at-8-55-51-PM.jpg",
      alt: "School campus",
    },
    {
      src: "https://i.ibb.co/pj5cnrSq/Whats-App-Image-2025-08-05-at-8-55-39-PM.jpg",
      alt: "Students learning",
    },
    {
      src: "https://i.ibb.co/cWY5hZb/Whats-App-Image-2025-08-05-at-8-55-53-PM.jpg",
      alt: "School activities",
    },
  ];

  return (
    <main className="bg-[color:var(--ohs-surface)]">
      {/* HERO (keep rotating) */}
      {/* HERO (enhanced with professional typography & school colors) */}
<section className="relative min-h-[92vh] overflow-hidden">
  <div className="absolute inset-0">
    <HeroCarousel images={heroImages} intervalMs={5000} />
  </div>

  {/* overlays for readability + school palette */}
  <div
    className="absolute inset-0"
    style={{
      background:
        "linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.82))",
    }}
    aria-hidden
  />
  <div
    className="absolute inset-0"
    style={{
      background:
        "radial-gradient(circle at 20% 25%, rgba(102,183,230,0.28), rgba(0,0,0,0) 58%), radial-gradient(circle at 80% 70%, rgba(245,230,200,0.22), rgba(0,0,0,0) 55%)",
    }}
    aria-hidden
  />

  <div className="relative mx-auto flex min-h-[92vh] max-w-6xl items-center px-4">
    <div className="w-full max-w-3xl">
      <div className="flex flex-wrap gap-2">
        <Pill>EST. 1996</Pill>
        <Pill>MIXED DAY & BOARDING</Pill>
        <Pill>NATIONAL + ISLAMIC</Pill>
      </div>

      <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white drop-shadow-md md:text-6xl">
        Where Knowledge Meets{" "}
        <span className="bg-gradient-to-r from-[color:var(--ohs-sky)] to-[color:var(--ohs-cream)] bg-clip-text text-transparent">
          Character
        </span>
      </h1>

      {/* Professional typewriter animation */}
      <div className="mt-6 max-w-2xl">
        <p 
          className="text-lg font-medium text-white/95 md:text-xl"
          style={{ 
            fontFamily: 'var(--font-sans), system-ui, sans-serif',
            lineHeight: '1.65',
            letterSpacing: '-0.015em'
          }}
        >
          <span className="inline-block overflow-hidden whitespace-nowrap border-r-2 border-[color:var(--ohs-sky)] pr-1.5 font-extrabold text-white animate-[typewriter_3.2s_steps(48,end)_0.3s_forwards,blink_0.9s_step-end_3.2s_infinite]">
            Education is light — nurturing disciplined minds and upright hearts.
          </span>
        </p>
      </div>

      {/* Left-aligned Arabic text with elegant Amiri typography */}
      <p 
        className="mt-5 max-w-2xl text-left font-ar-quran text-lg font-normal text-white/90 drop-shadow-sm"
        dir="rtl"
        style={{ 
          fontFamily: 'var(--font-ar-quran), serif',
          fontSize: '1.15rem',
          lineHeight: '1.75',
          letterSpacing: '0.02em',
          fontWeight: 400
        }}
      >
        العلمُ نورٌ — نُربي جيلاً يجمع بين التفوق الأكاديمي والقيم الإسلامية الراسخة
      </p>

      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        <Link
          href="/admissions"
          className="group relative inline-flex items-center justify-center rounded-full px-9 py-4 text-center text-sm font-extrabold text-white shadow-lg transition-all hover:shadow-xl active:scale-[0.98]"
          style={{ 
            background: 'linear-gradient(135deg, var(--ohs-dark-green), #154a2e)',
            boxShadow: '0 4px 20px rgba(30, 91, 58, 0.45)'
          }}
        >
          <span className="relative z-10 flex items-center gap-2">
            Begin Your Journey
            <ArrowRight 
              size={18} 
              className="transition-transform group-hover:translate-x-1" 
            />
          </span>
          <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
        </Link>
        <Link
          href="/about"
          className="group relative inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 px-9 py-4 text-center text-sm font-extrabold text-white backdrop-blur-sm transition-all hover:bg-white/20 active:scale-[0.98]"
        >
          <span className="relative z-10">Discover Our Story</span>
          <div className="absolute inset-0 rounded-full bg-white/5 opacity-0 transition-opacity group-hover:opacity-100" />
        </Link>
      </div>

      {/* School color gradient loading bar */}
      <div className="mt-12 h-2.5 w-full max-w-xl overflow-hidden rounded-full border border-white/15 bg-white/5">
        <div 
          className="h-full animate-gradient-slide rounded-full"
          style={{ 
            background: 'linear-gradient(90deg, var(--ohs-cream), var(--ohs-sky), var(--ohs-pale-green), var(--ohs-dark-green), var(--ohs-cream))',
            backgroundSize: '300% 100%'
          }} 
        />
      </div>
    </div>
  </div>

  {/* Keyframe animations - SAFE FOR SERVER COMPONENTS */}
  <style>{`
    @keyframes typewriter {
      from { width: 0 }
      to { width: 100% }
    }
    @keyframes blink {
      0%, 100% { border-color: transparent }
      50% { border-color: var(--ohs-sky) }
    }
    @keyframes gradient-slide {
      0% { background-position: 0% 50% }
      50% { background-position: 100% 50% }
      100% { background-position: 0% 50% }
    }
    .animate-gradient-slide {
      animation: gradient-slide 8s ease infinite;
      background-position: 0% 50%;
    }
  `}</style>
</section>

      {/* ABOUT (more “exaggerating words” + link + optional video placeholder) */}
      <section className="py-14">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
  <Kicker>ABOUT OKASHA HIGH SCHOOL</Kicker>

  <h2 className="text-3xl font-extrabold tracking-tight text-[color:var(--ohs-charcoal)] md:text-4xl">
    A Legacy of Excellence, Discipline &{" "}
    <span className="text-[color:var(--ohs-sky)]">Purpose</span>
  </h2>

  <p className="text-base text-slate-700">
    Founded in <span className="font-extrabold">1996</span>, Okasha High School has grown into
    a respected institution where students are shaped into high-performing learners and
    upright citizens. We combine rigorous academics with Islamic theology and Arabic studies
    to build strong minds, strong character, and confident leadership.
  </p>

  <p className="text-sm text-slate-600">
    Our campus in Mbikko (Buikwe District, near Jinja) provides a calm, structured environment
    where students thrive — both in the classroom and in personal development.
  </p>

  {/* SINGLE CONTAINER: All items flow together as badges */}
  <div className="flex flex-wrap items-center gap-3">
    <IconBadge
      icon={<GraduationCap size={20} />}
      label="ACADEMIC EXCELLENCE"
      tone="sky"
    />
    <IconBadge
      icon={<BookOpenCheck size={20} />}
      label="FAITH & CHARACTER"
      tone="cream"
    />
    <IconBadge
      icon={<Home size={20} />}
      label="DAY & BOARDING"
      tone="green"
    />
    {/* Button styled to match badge flow */}
    <Link
      href="/about"
      className="inline-flex items-center gap-2 rounded-full bg-[var(--ohs-dark-green)] px-5 py-2.5 text-sm font-extrabold text-white transition hover:opacity-95 active:scale-[0.99] whitespace-nowrap border border-[var(--ohs-dark-green)] hover:border-[var(--ohs-dark-green)]"
    >
      Read Full Story <ArrowRight size={18} />
    </Link>
  </div>
</div>

            {/* “Video” area (placeholder) — swap src when you have a video URL */}
            <div className="relative overflow-hidden rounded-3xl border bg-white shadow-sm">
              <div className="absolute inset-0 animate-pulse bg-slate-200" />
              <div className="relative aspect-video w-full">
                <iframe
                  className="h-full w-full"
                  src="https://www.youtube.com/embed/R-6xWoRKeH4?si=TXkBcVlfCU7gNhJ1"
                  title="OHS Introduction Video (placeholder)"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="border-t bg-white p-4">
                <div className="text-sm font-extrabold text-[color:var(--ohs-charcoal)]">
                  Hafidha Hussina Nassejje
                </div>
                <div className="mt-1 text-xs text-slate-600">
                  Former Student of Quran And Tafsir.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY OHS */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-4">
          <div className="max-w-3xl">
            <Kicker>WHY FAMILIES CHOOSE OHS</Kicker>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[color:var(--ohs-charcoal)] md:text-4xl">
              A Foundation for Lifelong{" "}
              <span className="text-[color:var(--ohs-sky)]">Success</span>
            </h2>
            <p className="mt-3 text-slate-600">
              We balance rigorous academics with moral development in a structured, supportive environment.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: <GraduationCap size={22} />,
                title: "Academic Rigor",
                desc:
                  "O-Level & A-Level excellence through focused teaching, continuous assessment, and revision culture.",
                tone: "sky" as const,
              },
              {
                icon: <BookOpenCheck size={22} />,
                title: "Faith Integration",
                desc:
                  "Islamic theology and Arabic studies woven into daily life to build integrity, discipline, and purpose.",
                tone: "cream" as const,
              },
              {
                icon: <Home size={22} />,
                title: "Structured Living",
                desc:
                  "Thoughtfully designed routines for day scholars and boarders with dedicated welfare and guidance.",
                tone: "green" as const,
              },
            ].map((item, i) => (
              <div
                key={i}
                className="group rounded-3xl border bg-white p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.99]"
              >
                <div className="mb-5 inline-flex items-center gap-3">
                  <span
                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border"
                    style={{
                      background:
                        item.tone === "green"
                          ? "var(--ohs-dark-green)"
                          : item.tone === "cream"
                          ? "var(--ohs-cream)"
                          : "var(--ohs-sky)",
                      color:
                        item.tone === "green" ? "white" : "var(--ohs-charcoal)",
                    }}
                  >
                    {item.icon}
                  </span>
                  <h3 className="text-xl font-extrabold text-[color:var(--ohs-charcoal)]">
                    {item.title}
                  </h3>
                </div>
                <p className="text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LATEST NEWS + EVENTS */}
      <section className="py-14">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <Kicker>LATEST UPDATES</Kicker>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[color:var(--ohs-charcoal)] md:text-4xl">
                News &{" "}
                <span className="text-[color:var(--ohs-sky)]">Events</span>
              </h2>
              <p className="mt-2 text-slate-600">
                Stay informed with school announcements and upcoming academic dates.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href="/news"
                className="inline-flex items-center justify-center gap-2 rounded-full border bg-white px-6 py-3 text-sm font-extrabold transition hover:bg-[color:var(--ohs-surface)] active:scale-[0.99]"
              >
                View all news <ArrowRight size={18} />
              </Link>
              <Link
                href="/calendar"
                className="inline-flex items-center justify-center gap-2 rounded-full border bg-white px-6 py-3 text-sm font-extrabold transition hover:bg-[color:var(--ohs-surface)] active:scale-[0.99]"
              >
                Full calendar <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {/* News */}
            <div className="rounded-3xl border bg-white p-6 shadow-sm">
              <div className="mb-4 inline-flex items-center gap-2 text-sm font-extrabold text-[color:var(--ohs-charcoal)]">
                <Newspaper size={18} className="text-[color:var(--ohs-dark-green)]" />
                LATEST NEWS
              </div>

              <div className="grid gap-4">
                {news.length === 0 ? (
                  <div className="text-sm text-slate-600">
                    No published news yet.
                  </div>
                ) : (
                  news.map((n: any) => (
                    <Link
                      key={n.id}
                      href={`/news/${n.slug}`}
                      className="group rounded-2xl border p-4 transition hover:bg-[color:var(--ohs-surface)] active:scale-[0.99]"
                    >
                      <div className="font-extrabold text-[color:var(--ohs-charcoal)] group-hover:text-[color:var(--ohs-dark-green)]">
                        {n.title}
                      </div>
                      <div className="mt-1 text-sm text-slate-600 line-clamp-2">
                        {n.excerpt ?? "Read the full update on the news page."}
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* Events */}
            <div className="rounded-3xl border bg-white p-6 shadow-sm">
              <div className="mb-4 inline-flex items-center gap-2 text-sm font-extrabold text-[color:var(--ohs-charcoal)]">
                <CalendarDays size={18} className="text-[color:var(--ohs-dark-green)]" />
                UPCOMING EVENTS
              </div>

              <div className="grid gap-4">
                {events.length === 0 ? (
                  <div className="text-sm text-slate-600">
                    No upcoming events published yet.
                  </div>
                ) : (
                  events.map((e: any) => (
                    <div
                      key={e.id}
                      className="rounded-2xl border p-4 transition hover:bg-[color:var(--ohs-surface)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="font-extrabold text-[color:var(--ohs-charcoal)]">
                          {e.title}
                        </div>
                        <span className="rounded-full border bg-white px-2 py-0.5 text-xs font-extrabold text-slate-600 capitalize">
                          {e.category}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-slate-600">
                        {fmtRange(e.starts_on, e.ends_on)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick CTA */}
            <div
              className="rounded-3xl border p-6 shadow-sm"
              style={{
                background:
                  "linear-gradient(135deg, var(--ohs-sky), white, var(--ohs-cream))",
              }}
            >
              <div className="mb-3 inline-flex items-center gap-2 text-sm font-extrabold text-[color:var(--ohs-charcoal)]">
                <ArrowRight size={18} className="text-[color:var(--ohs-dark-green)]" />
                QUICK ACTIONS
              </div>

              <p className="text-sm text-slate-700">
                Need admissions guidance or want to visit? Start here.
              </p>

              <div className="mt-5 grid gap-3">
                <Link
                  href="/admissions"
                  className="rounded-2xl px-5 py-3 text-center text-sm font-extrabold text-white transition hover:opacity-95 active:scale-[0.99]"
                  style={{ background: "var(--ohs-dark-green)" }}
                >
                  Admissions
                </Link>
                <Link
                  href="/contact"
                  className="rounded-2xl border bg-white px-5 py-3 text-center text-sm font-extrabold transition hover:bg-[color:var(--ohs-surface)] active:scale-[0.99]"
                >
                  Contact / Visit
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ADMINISTRATION PREVIEW */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <Kicker>LEADERSHIP</Kicker>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[color:var(--ohs-charcoal)] md:text-4xl">
                Administration &{" "}
                <span className="text-[color:var(--ohs-sky)]">Staff</span>
              </h2>
              <p className="mt-2 text-slate-600">
                A committed team focused on academic excellence, student welfare, and discipline.
              </p>
            </div>

            <Link
              href="/staff"
              className="inline-flex items-center justify-center gap-2 rounded-full border bg-white px-6 py-3 text-sm font-extrabold transition hover:bg-[color:var(--ohs-surface)] active:scale-[0.99]"
            >
              View all staff <Users2 size={18} />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {staff.length === 0 ? (
              <div className="text-sm text-slate-600">
                No staff published yet.
              </div>
            ) : (
              staff.map((m: any) => (
                <StaffMiniCard
                  key={m.id}
                  name={m.full_name}
                  role={m.role_title}
                  photoUrl={m.photo_url}
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* EXPLORE */}
      <section className="py-14">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center max-w-3xl mx-auto">
            <Kicker>EXPLORE</Kicker>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[color:var(--ohs-charcoal)] md:text-4xl">
              Explore Our{" "}
              <span className="text-[color:var(--ohs-sky)]">Community</span>
            </h2>
            <p className="mt-3 text-slate-600">
              Discover what makes Okasha High School a transformative educational experience.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <EditorialCard
              title="Academic Programs"
              desc="National curriculum and Islamic theology tracks — structured pathways for every learner’s potential."
              href="/programs"
              imageSrc="https://i.ibb.co/pj5cnrSq/Whats-App-Image-2025-08-05-at-8-55-39-PM.jpg"
            />
            <EditorialCard
              title="Meet Our Staff"
              desc="Dedicated educators and administrators committed to discipline, guidance and academic excellence."
              href="/staff"
              imageSrc="https://i.ibb.co/cWY5hZb/Whats-App-Image-2025-08-05-at-8-55-53-PM.jpg"
            />
          </div>
        </div>
      </section>

      {/* LOCATION CTA */}
      <section className="py-14">
        <div className="mx-auto max-w-6xl px-4">
          <div
            className="rounded-3xl border p-8 shadow-sm"
            style={{
              background:
                "linear-gradient(135deg, var(--ohs-cream), white, var(--ohs-sky))",
            }}
          >
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <Kicker>VISIT US</Kicker>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[color:var(--ohs-charcoal)]">
                  Mbikko, Buikwe District{" "}
                  <span className="text-[color:var(--ohs-dark-green)]">
                    (Near Jinja)
                  </span>
                </h2>
                <p className="mt-3 text-slate-700">
                  Experience our serene campus environment where academic excellence meets spiritual growth.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/contact"
                  className="rounded-full px-7 py-3 text-center text-sm font-extrabold text-white transition hover:opacity-95 active:scale-[0.99]"
                  style={{ background: "var(--ohs-dark-green)" }}
                >
                  Get Directions
                </Link>
                <Link
                  href="/calendar"
                  className="rounded-full border bg-white px-7 py-3 text-center text-sm font-extrabold transition hover:bg-[color:var(--ohs-surface)] active:scale-[0.99]"
                >
                  View Academic Calendar
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}