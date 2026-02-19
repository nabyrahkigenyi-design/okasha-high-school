"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Doc = {
  id: number;
  title: string;
  summary: string | null;
  file_url: string;
  file_name: string | null;
  category: string | null;
  sort_order: number | null;
};

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border bg-white/85 px-3 py-1 text-xs font-semibold text-slate-800">
      {children}
    </span>
  );
}

function CatPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
        active ? "bg-[color:var(--ohs-sky)] text-slate-900" : "bg-white/80 text-slate-700 hover:bg-white"
      }`}
    >
      {label}
    </button>
  );
}

function catLabel(c?: string | null) {
  const v = (c ?? "General").trim();
  return v.length ? v : "General";
}

function tileBg(i: number) {
  // rotate backgrounds so it doesn’t feel repetitive
  return i % 3 === 0 ? "var(--ohs-cream)" : i % 3 === 1 ? "var(--ohs-sky)" : "white";
}

export default function PolicyLibrary({ docs }: { docs: Doc[] }) {
  const [filter, setFilter] = useState<string>("All");

  const categories = useMemo(() => {
    const set = new Set<string>();
    docs.forEach((d) => set.add(catLabel(d.category)));
    return ["All", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [docs]);

  const filtered = useMemo(() => {
    if (filter === "All") return docs;
    return docs.filter((d) => catLabel(d.category) === filter);
  }, [docs, filter]);

  const featured = docs[0];

  return (
    <div className="grid gap-8">
      {/* UNIQUE HERO */}
      <section className="relative overflow-hidden rounded-3xl border bg-white shadow-sm">
        <svg
          className="pointer-events-none absolute -right-12 -top-16 h-72 w-72 opacity-25"
          viewBox="0 0 200 200"
          aria-hidden="true"
        >
          <path
            fill="var(--ohs-cream)"
            d="M34.1,-55.2C44.8,-52.9,54.2,-44.9,61.6,-34.7C69,-24.5,74.4,-12.2,73.4,-0.6C72.4,11,65,22,57.9,33.2C50.8,44.4,44,55.8,33.7,62.7C23.4,69.6,9.7,72, -4.1,77.6C-18,83.3,-31.9,92.1,-42.9,86.7C-53.9,81.3,-61.9,61.7,-68,44.1C-74.1,26.5,-78.3,10.9,-76.1,-3.3C-73.9,-17.6,-65.3,-30.5,-54.7,-38.8C-44.1,-47.1,-31.6,-50.8,-19.6,-54.2C-7.6,-57.6,4,-60.7,16.8,-61.6C29.7,-62.5,43.5,-61.4,34.1,-55.2Z"
            transform="translate(100 100)"
          />
        </svg>

        <svg
          className="pointer-events-none absolute -left-12 -bottom-14 h-72 w-72 opacity-25"
          viewBox="0 0 200 200"
          aria-hidden="true"
        >
          <path
            fill="var(--ohs-sky)"
            d="M41.7,-63.2C54.9,-58.4,66.8,-49.2,72.7,-36.8C78.6,-24.4,78.5,-8.9,75.7,6.1C72.9,21.1,67.5,35.6,58.3,46.5C49.1,57.4,36.2,64.7,22.2,67.8C8.1,70.9,-7,69.9,-22.1,67.1C-37.2,64.3,-52.3,59.7,-62.2,49C-72.2,38.3,-77,21.5,-76.9,5.1C-76.8,-11.4,-71.7,-27.5,-61.7,-39.2C-51.7,-50.9,-36.8,-58.1,-21.8,-62.9C-6.8,-67.7,8.4,-70,22.2,-68.6C36,-67.2,48.5,-62.6,41.7,-63.2Z"
            transform="translate(100 100)"
          />
        </svg>

        <div
          className="relative p-6 md:p-10"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,248,220,0.60), rgba(135,206,235,0.18), rgba(255,255,255,0.95))",
          }}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap gap-2">
                <Badge>Policy Library</Badge>
                <Badge>Updated by Administration</Badge>
                <Badge>Student welfare & discipline</Badge>
              </div>

              <h2 className="mt-4 text-2xl font-bold tracking-tight text-[color:var(--ohs-charcoal)] md:text-3xl">
                School Policies & Documents
              </h2>

              <p className="mt-2 text-sm text-slate-700 md:text-base">
                Download official school policies and key documents. Parents and students are encouraged to read
                and follow the school guidelines.
              </p>

              <p className="mt-3 text-sm text-slate-700" dir="rtl">
                هذه الوثائق رسمية — يرجى قراءتها والالتزام بها لضمان الانضباط وحسن السلوك.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <Link
                href="/admissions"
                className="rounded-2xl border bg-white px-4 py-3 text-center text-sm font-semibold hover:bg-[color:var(--ohs-surface)]"
              >
                Admissions
              </Link>
              <Link
                href="/contact"
                className="rounded-2xl border bg-white px-4 py-3 text-center text-sm font-semibold hover:bg-[color:var(--ohs-surface)]"
              >
                Ask the Office
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* “Read before joining” checklist (rich content) */}
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-[color:var(--ohs-charcoal)]">Read before joining</h3>
        <p className="mt-2 text-sm text-slate-600">
          These are common areas families usually ask about. The official PDF documents below provide full details.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border p-5" style={{ background: "var(--ohs-cream)" }}>
            <div className="font-semibold text-[color:var(--ohs-charcoal)]">Discipline & conduct</div>
            <p className="mt-2 text-sm text-slate-700">
              Expectations for student behavior, punctuality, respect, and school rules.
            </p>
          </div>
          <div className="rounded-2xl border p-5" style={{ background: "var(--ohs-sky)" }}>
            <div className="font-semibold text-[color:var(--ohs-charcoal)]">Attendance & reporting</div>
            <p className="mt-2 text-sm text-slate-700">
              Reporting dates, attendance requirements, and communication procedures.
            </p>
          </div>
          <div className="rounded-2xl border p-5 bg-white">
            <div className="font-semibold text-[color:var(--ohs-charcoal)]">Uniform & standards</div>
            <p className="mt-2 text-sm text-slate-700">
              Uniform guidance and presentation standards for lower and upper secondary students.
            </p>
          </div>
        </div>
      </section>

      {/* Featured policy */}
      {featured ? (
        <section className="overflow-hidden rounded-3xl border bg-white shadow-sm">
          <div
            className="p-6 md:p-8"
            style={{
              background:
                "linear-gradient(135deg, rgba(135,206,235,0.22), rgba(255,248,220,0.55), rgba(255,255,255,0.95))",
            }}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="inline-flex rounded-full border bg-white/85 px-3 py-1 text-xs font-bold text-slate-800">
                  Featured document
                </div>
                <h3 className="mt-3 text-xl font-bold tracking-tight text-[color:var(--ohs-charcoal)]">
                  {featured.title}
                </h3>
                <div className="mt-1 text-xs text-slate-600 capitalize">{catLabel(featured.category)}</div>
              </div>

              <a
                className="rounded-2xl border bg-white px-4 py-3 text-sm font-semibold hover:bg-[color:var(--ohs-surface)]"
                href={featured.file_url}
                target="_blank"
                rel="noreferrer"
              >
                Download PDF
              </a>
            </div>

            {featured.summary ? (
              <p className="mt-3 text-sm text-slate-700">{featured.summary}</p>
            ) : null}
            {featured.file_name ? (
              <p className="mt-2 text-xs text-slate-500">{featured.file_name}</p>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* Filters */}
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[color:var(--ohs-charcoal)]">Browse documents</h3>
            <p className="mt-1 text-sm text-slate-600">
              Filter by category to quickly find what you need.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <CatPill key={c} label={c} active={filter === c} onClick={() => setFilter(c)} />
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {filtered.map((d, i) => (
            <article
              key={d.id}
              className="group relative overflow-hidden rounded-3xl border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              {/* Corner ribbon for category */}
              <div
                className="absolute -right-12 top-6 rotate-45 px-12 py-1 text-[11px] font-bold text-slate-900"
                style={{ background: tileBg(i) }}
                aria-hidden
              >
                {catLabel(d.category).toUpperCase()}
              </div>

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="truncate font-semibold text-[color:var(--ohs-charcoal)]">{d.title}</h4>
                  <div className="mt-2 inline-flex">
                    <span className="rounded-full border bg-[color:var(--ohs-surface)] px-3 py-1 text-xs font-semibold text-slate-700 capitalize">
                      {catLabel(d.category)}
                    </span>
                  </div>
                </div>

                <a
                  className="rounded-2xl border bg-white px-4 py-2 text-sm font-semibold hover:bg-[color:var(--ohs-surface)]"
                  href={d.file_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  PDF
                </a>
              </div>

              {d.summary ? <p className="mt-3 text-sm text-slate-600 line-clamp-3">{d.summary}</p> : null}
              {d.file_name ? <p className="mt-2 text-xs text-slate-500">{d.file_name}</p> : null}

              <div className="mt-4 text-sm font-semibold text-slate-800">
                Download <span className="inline-block transition group-hover:translate-x-1">→</span>
              </div>
            </article>
          ))}

          {!filtered.length ? (
            <div className="rounded-2xl border bg-[color:var(--ohs-surface)] p-6 text-sm text-slate-700">
              No documents in this category yet.
            </div>
          ) : null}
        </div>
      </section>

      {/* Light CTA */}
      <section
        className="rounded-3xl border p-6 shadow-sm"
        style={{ background: "linear-gradient(135deg, var(--ohs-sky), white, var(--ohs-cream))" }}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-[color:var(--ohs-charcoal)]">
              Need clarification on a policy?
            </h3>
            <p className="mt-2 text-sm text-slate-700">
              Contact the school office for official guidance.
            </p>
            <p className="mt-2 text-sm text-slate-700" dir="rtl">
              للاستفسار عن سياسة معينة — تواصلوا مع إدارة المدرسة.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/contact"
              className="rounded-xl border bg-white px-5 py-3 text-center text-sm font-semibold hover:bg-[color:var(--ohs-surface)]"
            >
              Contact
            </Link>
            <Link
              href="/admissions"
              className="rounded-xl border bg-white px-5 py-3 text-center text-sm font-semibold hover:bg-[color:var(--ohs-surface)]"
            >
              Admissions
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
