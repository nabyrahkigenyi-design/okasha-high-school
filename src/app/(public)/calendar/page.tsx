import { PageShell } from "@/components/public/PageShell";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const revalidate = 3600;

export const metadata = {
  title: "Calendar | Okasha High School",
  description: "Academic calendar and key dates.",
};

function fmtRange(starts: string, ends?: string | null) {
  if (!ends || ends === starts) return starts;
  return `${starts} → ${ends}`;
}

function toMonthKey(dateStr: string) {
  // expects YYYY-MM-DD
  const d = new Date(dateStr);
  const label = d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  return label;
}

function CatBadge({ cat }: { cat?: string | null }) {
  const c = (cat ?? "general").toLowerCase().trim();

  // Use sky/cream/charcoal variations (avoid green emphasis)
  const style =
    c.includes("exam") || c.includes("test")
      ? { bg: "var(--ohs-sky)", text: "text-slate-900" }
      : c.includes("holiday") || c.includes("break")
      ? { bg: "var(--ohs-cream)", text: "text-slate-900" }
      : c.includes("report") || c.includes("opening") || c.includes("closing")
      ? { bg: "var(--ohs-surface)", text: "text-slate-900" }
      : { bg: "white", text: "text-slate-800" };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${style.text}`}
      style={{ background: style.bg }}
    >
      {(cat ?? "General").toString()}
    </span>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border bg-white/80 px-3 py-1 text-xs font-semibold text-slate-800">
      {children}
    </span>
  );
}

export default async function CalendarPage() {
  const sb = supabaseAdmin();
  const { data: events } = await sb
    .from("calendar_events")
    .select("id, title, description, starts_on, ends_on, category, sort_order")
    .eq("is_published", true)
    .order("starts_on", { ascending: true })
    .order("sort_order", { ascending: true })
    .limit(500);

  const list = events ?? [];

  // Group events by month for a “real calendar” feel
  const groups = new Map<string, typeof list>();
  for (const e of list) {
    const k = toMonthKey(e.starts_on);
    groups.set(k, [...(groups.get(k) ?? []), e]);
  }
  const monthKeys = Array.from(groups.keys());

  // Top highlights: first few upcoming
  const highlights = list.slice(0, 6);

  return (
    <PageShell
      title="Calendar"
      subtitle="Key academic dates and school events. (Updated by administration.)"
      watermark
    >
      {/* DISTINCT HERO */}
      <section className="relative overflow-hidden rounded-3xl border bg-white shadow-sm">
        {/* Decorative shapes (different placement from other pages) */}
        <svg
          className="pointer-events-none absolute -left-10 bottom-0 h-64 w-64 opacity-25"
          viewBox="0 0 200 200"
          aria-hidden="true"
        >
          <path
            fill="var(--ohs-cream)"
            d="M33.6,-52.8C45.8,-51.4,59.8,-46.7,68.6,-37.3C77.4,-27.9,81,-13.9,79.4,-0.9C77.8,12.1,71,24.2,62.1,34.5C53.2,44.8,42.2,53.2,29.9,58.8C17.6,64.4,4,67.2,-10,68.3C-24,69.4,-48,68.7,-61,59.6C-74,50.6,-75.9,33.2,-73.2,17.3C-70.5,1.4,-63.2,-13.1,-54.3,-24.6C-45.4,-36.1,-34.9,-44.7,-23.1,-48.3C-11.3,-51.9,1.8,-50.5,15.3,-53.3C28.8,-56.1,57.5,-54.2,33.6,-52.8Z"
            transform="translate(100 100)"
          />
        </svg>

        <svg
          className="pointer-events-none absolute -right-14 -top-14 h-72 w-72 opacity-25"
          viewBox="0 0 200 200"
          aria-hidden="true"
        >
          <path
            fill="var(--ohs-sky)"
            d="M42.9,-66.1C56.5,-59.6,69.1,-50.4,74.5,-38C79.9,-25.6,78,-10,73.9,4C69.7,18,63.2,30.4,54.2,41.4C45.1,52.4,33.4,62,19.8,66.2C6.2,70.4,-9.4,69.2,-25.3,65C-41.1,60.8,-57.1,53.5,-66.1,41C-75.1,28.5,-77.2,10.8,-73.7,-4.8C-70.3,-20.4,-61.2,-33.9,-50.4,-43.1C-39.7,-52.3,-27.3,-57.1,-14.3,-62.1C-1.2,-67.2,12.5,-72.6,26.1,-72.6C39.7,-72.6,52.9,-67.9,42.9,-66.1Z"
            transform="translate(100 100)"
          />
        </svg>

        <div
          className="relative p-6 md:p-10"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,248,220,0.55), rgba(135,206,235,0.18), rgba(255,255,255,0.95))",
          }}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap gap-2">
                <Pill>Key dates</Pill>
                <Pill>Exams & reporting</Pill>
                <Pill>Holidays & school events</Pill>
              </div>

              <h2 className="mt-4 text-2xl font-bold tracking-tight text-[color:var(--ohs-charcoal)] md:text-3xl">
                Academic Calendar & Events
              </h2>
              <p className="mt-2 text-sm text-slate-700 md:text-base">
                Stay updated with reporting dates, assessments, term activities, and key school events.
              </p>

              <p className="mt-3 text-sm text-slate-700" dir="rtl">
                تابع مواعيد الدراسة والاختبارات والفعاليات المهمة على مدار العام.
              </p>
            </div>

            <div className="grid gap-2">
              <a
                className="rounded-xl border bg-white px-5 py-3 text-center text-sm font-semibold hover:bg-[color:var(--ohs-surface)]"
                href="/news"
              >
                Latest News
              </a>
              <a
                className="rounded-xl border bg-white px-5 py-3 text-center text-sm font-semibold hover:bg-[color:var(--ohs-surface)]"
                href="/contact"
              >
                Ask the Office
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* HIGHLIGHTS */}
      <section className="mt-10 rounded-3xl border bg-white p-6 shadow-sm">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-lg font-semibold text-[color:var(--ohs-charcoal)]">Upcoming highlights</h2>
          <span className="text-xs text-slate-500">Next {highlights.length} events</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {highlights.length ? (
            highlights.map((e) => (
              <span key={e.id} className="inline-flex items-center gap-2 rounded-full border bg-[color:var(--ohs-surface)] px-3 py-2 text-xs font-semibold text-slate-800">
                <span className="text-slate-600">{e.starts_on}</span>
                <span className="text-slate-400">•</span>
                <span className="truncate max-w-[220px]">{e.title}</span>
              </span>
            ))
          ) : (
            <span className="text-sm text-slate-600">No published events yet.</span>
          )}
        </div>
      </section>

      {/* MONTH GROUPS */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-[color:var(--ohs-charcoal)]">All events</h2>
        <p className="mt-2 text-sm text-slate-600">
          Events are grouped by month for easy navigation. Categories help you quickly identify exam dates, reporting, and holidays.
        </p>

        <div className="mt-6 grid gap-8">
          {monthKeys.map((m, idx) => {
            const ms = groups.get(m) ?? [];
            const bg = idx % 2 === 0 ? "var(--ohs-surface)" : "white";

            return (
              <section key={m} className="rounded-3xl border p-6 shadow-sm" style={{ background: bg }}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-base font-bold tracking-tight text-[color:var(--ohs-charcoal)]">
                    {m}
                  </h3>
                  <span className="text-xs text-slate-500">
                    {ms.length} event{ms.length === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="mt-4 grid gap-3">
                  {ms.map((e) => (
                    <article
                      key={e.id}
                      className="rounded-2xl border bg-white p-5 shadow-sm"
                    >
                      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                        <div className="flex items-start gap-3">
                          <div className="rounded-2xl border px-3 py-2 text-xs font-bold text-slate-800" style={{ background: "var(--ohs-cream)" }}>
                            {fmtRange(e.starts_on, e.ends_on)}
                          </div>
                          <div>
                            <div className="font-semibold text-[color:var(--ohs-charcoal)]">{e.title}</div>
                            {e.description ? (
                              <p className="mt-1 text-sm text-slate-600">{e.description}</p>
                            ) : null}
                          </div>
                        </div>

                        <div className="mt-1 md:mt-0">
                          <CatBadge cat={e.category} />
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}

          {!list.length ? (
            <div className="rounded-2xl border bg-white p-6 text-sm text-slate-600">
              No calendar events published yet. Please check again later.
            </div>
          ) : null}
        </div>
      </section>

      {/* CTA (light theme) */}
      <section
        className="mt-10 rounded-3xl border p-6 shadow-sm"
        style={{ background: "linear-gradient(135deg, var(--ohs-cream), white, var(--ohs-sky))" }}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-[color:var(--ohs-charcoal)]">
              Need confirmation for a reporting date?
            </h3>
            <p className="mt-2 text-sm text-slate-700">
              Visit the News page for official announcements or contact the school office for clarity.
            </p>
            <p className="mt-2 text-sm text-slate-700" dir="rtl">
              للاستفسار عن المواعيد — تابع الأخبار أو تواصل مع إدارة المدرسة.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <a
              className="rounded-xl border bg-white px-5 py-3 text-center text-sm font-semibold hover:bg-[color:var(--ohs-surface)]"
              href="/news"
            >
              View News
            </a>
            <a
              className="rounded-xl border bg-white px-5 py-3 text-center text-sm font-semibold hover:bg-[color:var(--ohs-surface)]"
              href="/contact"
            >
              Contact
            </a>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
