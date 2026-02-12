import Link from "next/link";
import { WatermarkedSection } from "@/components/WatermarkedSection";

export const revalidate = 3600;

export const metadata = {
  title: "Okasha High School | OHS",
  description:
    "Okasha High School (OHS) — Official school website and portal. (Content will be updated.)",
};

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border bg-white/70 px-3 py-1 text-xs text-slate-700">
      {children}
    </span>
  );
}

function Card({
  title,
  desc,
  href,
}: {
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-lg font-semibold text-[color:var(--ohs-charcoal)]">
          {title}
        </h3>
        <span className="text-slate-400 transition group-hover:translate-x-1">
          →
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-600">{desc}</p>
    </Link>
  );
}

export default function HomePage() {
  return (
    <main className="bg-[color:var(--ohs-surface)]">
      {/* HERO */}
      <WatermarkedSection>
        <section className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex flex-wrap justify-center gap-2">
              <Pill>Official Website</Pill>
              <Pill>Student & Parent Portal</Pill>
              <Pill>Modern + Faith-based</Pill>
            </div>

            <h1 className="mt-5 text-4xl font-bold tracking-tight text-[color:var(--ohs-charcoal)] md:text-5xl">
              Okasha High School
            </h1>

            <p className="mt-4 text-base text-slate-600 md:text-lg">
              Placeholder intro. We will replace this with the school’s real
              mission statement and key highlights.
            </p>

            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/admissions"
                className="rounded-xl px-6 py-3 font-medium text-white shadow-sm"
                style={{ background: "var(--ohs-dark-green)" }}
              >
                Admissions (Placeholder)
              </Link>
              <Link
                href="/portal"
                className="rounded-xl border bg-white px-6 py-3 font-medium"
              >
                Portal Login
              </Link>
            </div>

            {/* Visual band using uniform colors */}
            <div className="mx-auto mt-10 h-3 w-full max-w-xl overflow-hidden rounded-full border bg-white">
              <div className="flex h-full w-full">
                <div className="h-full w-1/4" style={{ background: "var(--ohs-cream)" }} />
                <div className="h-full w-1/4" style={{ background: "var(--ohs-sky)" }} />
                <div className="h-full w-1/4" style={{ background: "var(--ohs-pale-green)" }} />
                <div className="h-full w-1/4" style={{ background: "var(--ohs-dark-green)" }} />
              </div>
            </div>
          </div>
        </section>
      </WatermarkedSection>

      {/* QUICK LINKS */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-xl font-semibold text-[color:var(--ohs-charcoal)]">
          Explore
        </h2>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <Card
            title="About OHS"
            desc="Placeholder overview: history, vision, values, location."
            href="/about"
          />
          <Card
            title="Academic Programs"
            desc="Separate tracks: National Curriculum and Islamic Theology."
            href="/programs"
          />
          <Card
            title="Tuition & Fees"
            desc="Placeholder fee structure, term dates, payment guidance."
            href="/fees"
          />
        </div>
      </section>

      {/* TRACKS (clean, not verbose) */}
      <section className="mx-auto max-w-6xl px-4 pb-14">
        <div className="grid gap-6 md:grid-cols-2">
          <div
            className="rounded-2xl border p-6 shadow-sm"
            style={{ background: "var(--ohs-cream)" }}
          >
            <h3 className="text-lg font-semibold text-[color:var(--ohs-charcoal)]">
              National Curriculum
            </h3>
            <p className="mt-2 text-sm text-slate-700">
              Placeholder description. We will add subjects, structure, and outcomes.
            </p>
          </div>

          <div
            className="rounded-2xl border p-6 text-white shadow-sm"
            style={{ background: "var(--ohs-dark-green)" }}
          >
            <h3 className="text-lg font-semibold">Islamic Theology</h3>
            <p className="mt-2 text-sm text-white/90">
              Placeholder description. We will add modules, levels, and approach.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
