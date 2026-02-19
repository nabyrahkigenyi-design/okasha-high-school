import { PageShell } from "@/components/public/PageShell";
import { supabaseAdmin } from "@/lib/supabase/admin";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const revalidate = 3600;

export const metadata = {
  title: "Academic Programs | Okasha High School",
  description: "Academic programs including secular national curriculum and Islamic theology.",
};

function TrackBadge({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center rounded-full border bg-white/80 px-3 py-1 text-xs font-medium text-slate-700">
      {text}
    </span>
  );
}

function TrackSection({
  title,
  description,
  items,
  theme,
}: {
  title: string;
  description?: string | null;
  items: any[];
  theme: "secular" | "islamic";
}) {
  const headerBg =
    theme === "secular"
      ? "linear-gradient(135deg, var(--ohs-cream), var(--ohs-sky))"
      : "linear-gradient(135deg, var(--ohs-pale-green), var(--ohs-dark-green))";

  const headerText = theme === "islamic" ? "text-white" : "text-[color:var(--ohs-charcoal)]";
  const subText = theme === "islamic" ? "text-white/90" : "text-slate-700";

  return (
    <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      {/* Track header */}
      <div className="p-6" style={{ background: headerBg }}>
        <div className="flex flex-wrap gap-2">
          <TrackBadge text={theme === "secular" ? "National Curriculum" : "Islamic Theology"} />
          <TrackBadge text="S1–S6" />
          <TrackBadge text="Day & Boarding" />
        </div>

        <h2 className={`mt-4 text-2xl font-bold tracking-tight ${headerText}`}>{title}</h2>
        {description ? <p className={`mt-2 text-sm ${subText}`}>{description}</p> : null}

        {theme === "islamic" ? (
          <p className="mt-3 text-sm text-white/95" dir="rtl">
            يهدف هذا المسار إلى بناء طالبٍ قويٍّ في العقيدة والأخلاق، متقنٍ للغة العربية والعلوم الشرعية.
          </p>
        ) : (
          <p className="mt-3 text-sm text-slate-700">
            Strengthening modern academic excellence, critical thinking, and preparation for national examinations.
          </p>
        )}
      </div>

      {/* Track items */}
      <div className="p-6">
        {items.length ? (
          <div className="grid gap-4">
            {items.map((it) => (
              <article key={it.id} className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-semibold text-[color:var(--ohs-charcoal)]">{it.title}</h3>
                  <span className="text-slate-400">→</span>
                </div>

                {it.summary ? <p className="mt-2 text-sm text-slate-600">{it.summary}</p> : null}

                {it.details_md ? (
                  <div className="prose prose-slate mt-4 max-w-none prose-a:text-[color:var(--ohs-dark-green)]">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{it.details_md}</ReactMarkdown>
                  </div>
                ) : null}

                {/* Quality bullets to feel like “real website” */}
                <div className="mt-4 grid gap-2 text-sm text-slate-700 md:grid-cols-2">
                  <div className="rounded-xl border bg-[color:var(--ohs-surface)] px-3 py-2">
                    Focus: Strong foundations & steady progress
                  </div>
                  <div className="rounded-xl border bg-[color:var(--ohs-surface)] px-3 py-2">
                    Assessment: Continuous + term examinations
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border bg-[color:var(--ohs-surface)] p-5 text-sm text-slate-600">
            No published items for this track yet. The administration will update this section.
          </div>
        )}
      </div>
    </section>
  );
}

export default async function ProgramsPage() {
  const sb = supabaseAdmin();

  const { data: tracks } = await sb
    .from("program_tracks")
    .select("key, title, description, sort_order")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  const { data: items } = await sb
    .from("program_items")
    .select("id, track_key, title, summary, details_md, sort_order")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  const byTrack = new Map<string, any[]>();
  (items ?? []).forEach((i) => {
    const arr = byTrack.get(i.track_key) ?? [];
    arr.push(i);
    byTrack.set(i.track_key, arr);
  });

  const secular = (tracks ?? []).find((t) => t.key === "secular");
  const islamic = (tracks ?? []).find((t) => t.key === "islamic");

  return (
    <PageShell
      title="Academic Programs"
      subtitle="Okasha High School offers both the national curriculum and Islamic theology — building excellence in academics and character."
      watermark
    >
      {/* RICH INTRO */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex flex-wrap gap-2">
              <TrackBadge text="Established 1996" />
              <TrackBadge text="Mixed School" />
              <TrackBadge text="Day & Boarding" />
              <TrackBadge text="Mbikko • Buikwe • Jinja" />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-[color:var(--ohs-charcoal)]">
              Two Strong Learning Tracks — One School Vision
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Our program structure supports learners to succeed academically while growing into disciplined,
              respectful and responsible young people. Students can benefit from an environment that values
              excellence and faith.
            </p>

            <p className="mt-3 text-sm text-slate-700" dir="rtl">
              نسعى لجمع العلوم الحديثة مع العلوم الشرعية، لتكوين جيلٍ واعٍ ونافعٍ لمجتمعه.
            </p>
          </div>

          <div className="grid gap-2">
            <a
              className="rounded-xl px-5 py-3 text-center text-sm font-semibold text-white"
              style={{ background: "var(--ohs-dark-green)" }}
              href="/admissions"
            >
              Apply for Admission
            </a>
            <a className="rounded-xl border bg-white px-5 py-3 text-center text-sm font-semibold" href="/contact">
              Ask a Question
            </a>
          </div>
        </div>
      </section>

      {/* STATIC “SCHOOL WEBSITE” CONTENT */}
      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border p-6 shadow-sm" style={{ background: "var(--ohs-cream)" }}>
          <h3 className="font-semibold text-[color:var(--ohs-charcoal)]">Learning Outcomes</h3>
          <p className="mt-2 text-sm text-slate-700">
            Strong literacy, numeracy, sciences, and ethical discipline — producing confident learners and leaders.
          </p>
        </div>
        <div className="rounded-2xl border p-6 shadow-sm" style={{ background: "var(--ohs-sky)" }}>
          <h3 className="font-semibold text-[color:var(--ohs-charcoal)]">Student Support</h3>
          <p className="mt-2 text-sm text-slate-700">
            Guidance, mentoring, structured routines, and close monitoring for both day scholars and boarders.
          </p>
        </div>
        <div className="rounded-2xl border p-6 shadow-sm text-white" style={{ background: "var(--ohs-dark-green)" }}>
          <h3 className="font-semibold">Character & Faith</h3>
          <p className="mt-2 text-sm text-white/90">
            Respect, responsibility and Islamic values — strengthening identity, confidence, and community service.
          </p>
        </div>
      </section>

      {/* TRACK SECTIONS (DB-driven) */}
      <div className="mt-10 grid gap-8">
        {secular ? (
          <TrackSection
            title={secular.title}
            description={secular.description}
            items={byTrack.get("secular") ?? []}
            theme="secular"
          />
        ) : null}

        {islamic ? (
          <TrackSection
            title={islamic.title}
            description={islamic.description}
            items={byTrack.get("islamic") ?? []}
            theme="islamic"
          />
        ) : null}
      </div>

      {/* FAQ / PATHWAYS */}
      <section className="mt-10 rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[color:var(--ohs-charcoal)]">Program Pathways</h2>
        <p className="mt-2 text-sm text-slate-600">
          Below is typical guidance for how students progress through our academic structure.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border p-5">
            <h3 className="font-semibold text-[color:var(--ohs-charcoal)]">O-Level (S1–S4)</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
              <li>Core subjects + continuous assessment</li>
              <li>Study skills, discipline, and strong academic foundations</li>
              <li>Co-curricular activities for holistic growth</li>
            </ul>
          </div>
          <div className="rounded-2xl border p-5">
            <h3 className="font-semibold text-[color:var(--ohs-charcoal)]">A-Level (S5–S6)</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
              <li>Advanced subject combinations (based on offerings)</li>
              <li>Leadership responsibilities and academic maturity</li>
              <li>Preparation for university, careers, and life skills</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border p-5" style={{ background: "var(--ohs-surface)" }}>
          <div className="text-sm font-semibold text-[color:var(--ohs-charcoal)]">Arabic / Islamic Studies</div>
          <p className="mt-2 text-sm text-slate-700" dir="rtl">
            تشمل الدراسة: القرآن الكريم، الفقه، الحديث، السيرة، واللغة العربية — وتُراعى مستويات الطلاب عند الالتحاق.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-10 rounded-2xl border p-6 text-white shadow-sm" style={{ background: "var(--ohs-dark-green)" }}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-semibold">Need help choosing a track?</h3>
            <p className="mt-2 text-sm text-white/90">
              Contact the admissions office for guidance based on class level, background, and goals.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <a className="rounded-xl bg-white px-5 py-3 text-center text-sm font-semibold text-slate-900" href="/admissions">
              Admissions
            </a>
            <a className="rounded-xl border border-white/30 px-5 py-3 text-center text-sm font-semibold text-white" href="/contact">
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
