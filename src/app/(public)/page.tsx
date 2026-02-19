import Link from "next/link";
import { WatermarkedSection } from "@/components/WatermarkedSection";
import HeroCarousel from "./HeroCarousel";

export const revalidate = 3600;

export const metadata = {
  title: "Okasha High School | OHS",
  description:
    "Okasha High School (OHS) — Mixed day and boarding secondary school established in 1996, integrating the national curriculum with Islamic theology.",
};

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border bg-white/70 px-3 py-1 text-xs font-semibold text-slate-800">
      {children}
    </span>
  );
}

function BigLinkCard({
  title,
  desc,
  href,
  accent,
}: {
  title: string;
  desc: string;
  href: string;
  accent: "sky" | "cream" | "surface";
}) {
  const bg =
    accent === "sky"
      ? "var(--ohs-sky)"
      : accent === "cream"
      ? "var(--ohs-cream)"
      : "var(--ohs-surface)";

  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-3xl border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      {/* twisted/rotated watermark accent */}
      <div
        className="absolute -right-16 top-6 h-20 w-44 rotate-12 rounded-3xl border opacity-70"
        style={{ background: bg }}
        aria-hidden
      />
      <div
        className="absolute -left-20 bottom-6 h-16 w-44 -rotate-12 rounded-3xl border opacity-40"
        style={{ background: bg }}
        aria-hidden
      />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-bold tracking-tight text-[color:var(--ohs-charcoal)]">
            {title}
          </h3>
          <span className="text-slate-500 transition group-hover:translate-x-1">→</span>
        </div>
        <p className="mt-2 text-sm text-slate-600">{desc}</p>
      </div>
    </Link>
  );
}

function FeatureCard({
  title,
  desc,
  tone,
}: {
  title: string;
  desc: string;
  tone: "cream" | "sky" | "white";
}) {
  const bg =
    tone === "cream"
      ? "var(--ohs-cream)"
      : tone === "sky"
      ? "var(--ohs-sky)"
      : "white";

  return (
    <div className="rounded-3xl border p-6 shadow-sm" style={{ background: bg }}>
      <h3 className="text-base font-semibold text-[color:var(--ohs-charcoal)]">{title}</h3>
      <p className="mt-2 text-sm text-slate-700">{desc}</p>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="bg-[color:var(--ohs-surface)]">
      {/* HERO FULL-BLEED IMAGE + OVERLAY */}
      <WatermarkedSection variant="ribbons">
        <section className="mx-auto max-w-6xl px-4 py-8 md:py-12">
          <div className="relative overflow-hidden rounded-[28px] border bg-white shadow-sm">
            {/* Background carousel fills hero */}
            <div className="absolute inset-0">
              <HeroCarousel
                images={[
                  // placeholders; swap with R2/CDN later
                  {
                    src: "https://i.ibb.co/prh924y4/Whats-App-Image-2025-08-05-at-8-55-51-PM.jpg",
                    alt: "School campus (placeholder)",
                  },
                  {
                    src: "https://i.ibb.co/pj5cnrSq/Whats-App-Image-2025-08-05-at-8-55-39-PM.jpg",
                    alt: "Students learning (placeholder)",
                  },
                  {
                    src: "https://i.ibb.co/cWY5hZb/Whats-App-Image-2025-08-05-at-8-55-53-PM.jpg",
                    alt: "School activities (placeholder)",
                  },
                ]}
                intervalMs={5000}
              />
            </div>

            {/* Overlays to make text readable */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, rgba(0,0,0,0.55), rgba(0,0,0,0.15) 55%, rgba(0,0,0,0.35))",
              }}
              aria-hidden
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 20% 25%, rgba(135,206,235,0.30), rgba(0,0,0,0) 55%), radial-gradient(circle at 80% 70%, rgba(255,248,220,0.22), rgba(0,0,0,0) 55%)",
              }}
              aria-hidden
            />

            {/* content */}
            <div className="relative p-6 md:p-10">
              <div className="flex flex-wrap gap-2">
                <Pill>Established 1996</Pill>
                <Pill>Mixed Day & Boarding</Pill>
                <Pill>National + Islamic Studies</Pill>
              </div>

              <h1 className="mt-4 max-w-2xl text-4xl font-extrabold tracking-tight text-white md:text-5xl">
                Okasha High School
              </h1>

              <p className="mt-4 max-w-2xl text-base text-white/90 md:text-lg">
                Education is light — building disciplined learners with strong academics, leadership,
                and faith-based character.
              </p>

              <p className="mt-3 max-w-2xl text-sm text-white/90 font-ar" dir="rtl">
                العلمُ نورٌ — نُربي جيلاً يجمع بين العلوم الحديثة والعلوم الشرعية مع الانضباط وحسن الخلق.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/admissions"
                  className="rounded-2xl px-6 py-3 text-center text-sm font-semibold text-white shadow-sm"
                  style={{ background: "var(--ohs-dark-green)" }}
                >
                  Admissions
                </Link>

                <Link
                  href="/portal"
                  className="rounded-2xl border border-white/30 bg-white/15 px-6 py-3 text-center text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/20"
                >
                  Portal Login
                </Link>

                <Link
                  href="/programs"
                  className="rounded-2xl border border-white/30 bg-white/15 px-6 py-3 text-center text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/20"
                >
                  Programs
                </Link>
              </div>

              {/* uniform band */}
              <div className="mt-7 max-w-xl overflow-hidden rounded-full border border-white/20 bg-white/15 backdrop-blur-sm">
                <div className="flex h-3 w-full">
                  <div className="h-full w-1/4" style={{ background: "var(--ohs-cream)" }} />
                  <div className="h-full w-1/4" style={{ background: "var(--ohs-sky)" }} />
                  <div className="h-full w-1/4" style={{ background: "var(--ohs-pale-green)" }} />
                  <div className="h-full w-1/4" style={{ background: "var(--ohs-dark-green)" }} />
                </div>
              </div>

              {/* twisted watermark accents inside hero */}
              <div className="pointer-events-none absolute -right-10 top-10 hidden md:block">
                <div
                  className="h-24 w-56 rotate-12 rounded-3xl border border-white/25 bg-white/10 backdrop-blur-sm"
                  aria-hidden
                />
              </div>
              <div className="pointer-events-none absolute -left-10 bottom-10 hidden md:block">
                <div
                  className="h-20 w-56 -rotate-12 rounded-3xl border border-white/25 bg-white/10 backdrop-blur-sm"
                  aria-hidden
                />
              </div>
            </div>
          </div>
        </section>
      </WatermarkedSection>

      {/* HIGHLIGHTS */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-[color:var(--ohs-charcoal)]">Why families choose OHS</h2>
            <p className="mt-2 text-sm text-slate-600">
              A balanced learning environment — strong academics, good discipline, and supportive student life.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Pill>Discipline</Pill>
            <Pill>Performance</Pill>
            <Pill>Character</Pill>
            <Pill>Leadership</Pill>
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <FeatureCard
            tone="sky"
            title="Academic Excellence"
            desc="Focused teaching, continuous assessment, revision culture, and exam preparation for O-Level & A-Level."
          />
          <FeatureCard
            tone="cream"
            title="Faith & Character"
            desc="Islamic theology and Arabic studies that strengthen manners, integrity, discipline, and purpose."
          />
          <FeatureCard
            tone="white"
            title="Day & Boarding"
            desc="A structured routine for both day scholars and boarders, with student welfare and guidance."
          />
        </div>
      </section>

      {/* EXPLORE (kept, you liked it) */}
      <section className="mx-auto max-w-6xl px-4 pb-12">
        <h2 className="text-xl font-bold text-[color:var(--ohs-charcoal)]">Explore</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <BigLinkCard
            title="About OHS"
            desc="Our story since 1996, our motto, values, and what makes OHS special."
            href="/about"
            accent="cream"
          />
          <BigLinkCard
            title="Academic Programs"
            desc="National curriculum and Islamic theology tracks — structured and clearly presented."
            href="/programs"
            accent="sky"
          />
          <BigLinkCard
            title="Tuition & Fees"
            desc="A clear fee guide with categories and office confirmation."
            href="/fees"
            accent="surface"
          />
        </div>
      </section>

      {/* LOCATION STRIP */}
      <section className="mx-auto max-w-6xl px-4 pb-12">
        <div
          className="rounded-3xl border p-6 shadow-sm"
          style={{ background: "linear-gradient(135deg, var(--ohs-sky), white, var(--ohs-cream))" }}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-bold tracking-tight text-[color:var(--ohs-charcoal)]">
                Visit us in Mbikko, Buikwe District (Jinja)
              </h3>
              <p className="mt-2 text-sm text-slate-700">
                Find our location, send a message, or check the academic calendar.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href="/contact"
                className="rounded-2xl border bg-white px-5 py-3 text-center text-sm font-semibold hover:bg-[color:var(--ohs-surface)]"
              >
                Contact & Map
              </Link>
              <Link
                href="/calendar"
                className="rounded-2xl border bg-white px-5 py-3 text-center text-sm font-semibold hover:bg-[color:var(--ohs-surface)]"
              >
                View Calendar
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
