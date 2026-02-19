"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type FeeItem = {
  id: number;
  title: string;
  amount_text: string | null;
  notes: string | null;
  applies_to: string | null;
  sort_order: number | null;
};

function label(appliesTo?: string | null) {
  switch ((appliesTo ?? "").toLowerCase()) {
    case "s1-s4":
      return "S1–S4";
    case "s5-s6":
      return "S5–S6";
    case "boarding":
      return "Boarding";
    case "day":
      return "Day";
    default:
      return "General";
  }
}

function Pill({
  text,
  active,
  onClick,
}: {
  text: string;
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
      {text}
    </button>
  );
}

function FeeCard({ f, tone }: { f: FeeItem; tone: "cream" | "sky" | "white" }) {
  const bg =
    tone === "cream" ? "var(--ohs-cream)" : tone === "sky" ? "var(--ohs-sky)" : "white";

  return (
    <article className="rounded-3xl border p-6 shadow-sm" style={{ background: bg }}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-[color:var(--ohs-charcoal)]">{f.title}</h3>
          <div className="mt-2 inline-flex rounded-full border bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700">
            {label(f.applies_to)}
          </div>
        </div>

        <div className="shrink-0 text-right">
          <div className="text-xs font-semibold text-slate-600">Amount</div>
          <div className="mt-1 text-sm font-bold text-[color:var(--ohs-charcoal)]">
            {f.amount_text ?? "—"}
          </div>
        </div>
      </div>

      {f.notes ? (
        <p className="mt-3 text-sm text-slate-700">{f.notes}</p>
      ) : (
        <p className="mt-3 text-sm text-slate-600">Notes will be updated by administration.</p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full border bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700">
          Confirm with office
        </span>
        <span className="rounded-full border bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700">
          Keep receipts
        </span>
      </div>
    </article>
  );
}

export default function FeeGuide({ items }: { items: FeeItem[] }) {
  const [filter, setFilter] = useState<string>("All");

  const filters = ["All", "S1–S4", "S5–S6", "Day", "Boarding", "General"];

  const filtered = useMemo(() => {
    if (filter === "All") return items;
    const f = filter.toLowerCase();
    return items.filter((x) => label(x.applies_to).toLowerCase() === f);
  }, [items, filter]);

  const countBy = useMemo(() => {
    const map = new Map<string, number>();
    for (const it of items) {
      const k = label(it.applies_to);
      map.set(k, (map.get(k) ?? 0) + 1);
    }
    return map;
  }, [items]);

  return (
    <div className="grid gap-8">
      {/* UNIQUE HERO */}
      <section className="relative overflow-hidden rounded-3xl border bg-white shadow-sm">
        <svg
          className="pointer-events-none absolute -left-10 -top-16 h-72 w-72 opacity-25"
          viewBox="0 0 200 200"
          aria-hidden="true"
        >
          <path
            fill="var(--ohs-cream)"
            d="M43.6,-67.7C56.8,-60.7,67.6,-49.4,73.5,-36.1C79.5,-22.8,80.6,-7.6,77.5,6.6C74.4,20.8,67.1,34,57.1,44.8C47.1,55.6,34.4,64,20.2,69.2C6,74.4,-9.8,76.3,-25.2,72.7C-40.5,69,-55.4,59.8,-64.7,46.9C-74.1,34,-78,17,-76.6,0.8C-75.3,-15.4,-68.9,-30.7,-57.8,-39.5C-46.7,-48.3,-30.9,-50.6,-16.2,-57.9C-1.5,-65.2,12.1,-77.4,26.5,-77.3C41,-77.2,56.2,-64.1,43.6,-67.7Z"
            transform="translate(100 100)"
          />
        </svg>

        <svg
          className="pointer-events-none absolute -right-16 -bottom-16 h-80 w-80 opacity-20"
          viewBox="0 0 200 200"
          aria-hidden="true"
        >
          <path
            fill="var(--ohs-sky)"
            d="M36.9,-56.2C49.2,-49.8,61.7,-41.9,67.4,-30.6C73,-19.2,71.8,-4.4,67.8,9.1C63.8,22.6,56.9,34.9,47.4,45.2C37.8,55.5,25.6,63.7,12,67.9C-1.6,72.1,-16.6,72.3,-30.8,67.7C-45,63.1,-58.4,53.7,-66.7,41.1C-74.9,28.5,-78.1,12.8,-75.2,-1.1C-72.2,-15.1,-63,-27.3,-52.2,-34.8C-41.4,-42.3,-29,-45.1,-17.4,-54.6C-5.8,-64.1,5.1,-80.3,16.5,-79.2C27.9,-78.2,39.8,-60.7,36.9,-56.2Z"
            transform="translate(100 100)"
          />
        </svg>

        <div
          className="relative p-6 md:p-10"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,248,220,0.62), rgba(135,206,235,0.18), rgba(255,255,255,0.95))",
          }}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex rounded-full border bg-white/85 px-3 py-1 text-xs font-semibold text-slate-800">
                Fee Guide • Day & Boarding • S1–S6
              </div>

              <h2 className="mt-4 text-2xl font-bold tracking-tight text-[color:var(--ohs-charcoal)] md:text-3xl">
                Tuition & Fees Guide
              </h2>

              <p className="mt-2 text-sm text-slate-700 md:text-base">
                This section provides general guidance. Always confirm official figures with the school office before
                making payments.
              </p>

              <p className="mt-3 text-sm text-slate-700" dir="rtl">
                الرسوم إرشادية — يرجى تأكيد المبالغ من مكتب المدرسة قبل الدفع.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <a
                className="rounded-2xl border bg-white px-4 py-3 text-center text-sm font-semibold hover:bg-[color:var(--ohs-surface)]"
                href="tel:+256740235451"
              >
                Call Admissions
              </a>
              <Link
                href="/contact"
                className="rounded-2xl border bg-white px-4 py-3 text-center text-sm font-semibold hover:bg-[color:var(--ohs-surface)]"
              >
                Send a Message
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick guidance */}
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-[color:var(--ohs-charcoal)]">Quick guidance</h3>
        <p className="mt-2 text-sm text-slate-600">
          Useful tips for parents/guardians when paying fees and planning for the term.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border p-5" style={{ background: "var(--ohs-sky)" }}>
            <div className="font-semibold text-[color:var(--ohs-charcoal)]">Confirm figures</div>
            <p className="mt-2 text-sm text-slate-700">
              Fees can change per term. Please confirm totals with the school office before paying.
            </p>
          </div>
          <div className="rounded-2xl border p-5" style={{ background: "var(--ohs-cream)" }}>
            <div className="font-semibold text-[color:var(--ohs-charcoal)]">Keep receipts</div>
            <p className="mt-2 text-sm text-slate-700">
              Always keep payment proof. If possible, write the student name and class on the slip.
            </p>
          </div>
          <div className="rounded-2xl border p-5 bg-white">
            <div className="font-semibold text-[color:var(--ohs-charcoal)]">Boarding needs</div>
            <p className="mt-2 text-sm text-slate-700">
              Boarding students may have additional requirements. Request the official list from admissions.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[color:var(--ohs-charcoal)]">Browse fee items</h3>
            <p className="mt-1 text-sm text-slate-600">
              Filter items by class level or section.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <Pill
                key={f}
                text={
                  f === "All"
                    ? `All (${items.length})`
                    : `${f} (${countBy.get(f) ?? 0})`
                }
                active={filter === f}
                onClick={() => setFilter(f)}
              />
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {filtered.map((f, idx) => (
            <FeeCard
              key={f.id}
              f={f}
              tone={idx % 3 === 0 ? "cream" : idx % 3 === 1 ? "sky" : "white"}
            />
          ))}

          {!filtered.length ? (
            <div className="rounded-2xl border bg-[color:var(--ohs-surface)] p-6 text-sm text-slate-700">
              No fee items under this filter yet.
            </div>
          ) : null}
        </div>
      </section>

      {/* CTA */}
      <section
        className="rounded-3xl border p-6 shadow-sm"
        style={{ background: "linear-gradient(135deg, var(--ohs-sky), white, var(--ohs-cream))" }}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-[color:var(--ohs-charcoal)]">
              Want the official confirmation?
            </h3>
            <p className="mt-2 text-sm text-slate-700">
              Admissions Office: <a className="underline" href="tel:+256740235451">0740235451</a> • Director:{" "}
              <a className="underline" href="tel:+256702444301">0702444301</a>
            </p>
            <p className="mt-2 text-sm text-slate-700" dir="rtl">
              للتأكيد الرسمي — يرجى التواصل مع مكتب القبول أو إدارة المدرسة.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/admissions"
              className="rounded-xl border bg-white px-5 py-3 text-center text-sm font-semibold hover:bg-[color:var(--ohs-surface)]"
            >
              Admissions
            </Link>
            <Link
              href="/contact"
              className="rounded-xl border bg-white px-5 py-3 text-center text-sm font-semibold hover:bg-[color:var(--ohs-surface)]"
            >
              Contact
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
