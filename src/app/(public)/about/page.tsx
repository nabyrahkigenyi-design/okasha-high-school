import { PageShell } from "@/components/public/PageShell";

export const revalidate = 3600;

export const metadata = {
  title: "About | Okasha High School",
  description: "History, values and leadership of Okasha High School (OHS).",
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="text-xs font-semibold text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-bold text-[color:var(--ohs-charcoal)]">{value}</div>
    </div>
  );
}

function ValueBadge({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center rounded-full border bg-white/80 px-3 py-1 text-xs font-semibold text-slate-800">
      {text}
    </span>
  );
}

export default function AboutPage() {
  return (
    <PageShell
      title="About Okasha High School"
      subtitle="A mixed day and boarding secondary school established in 1996, integrating national curriculum education with Islamic theology."
      watermark
    >
      <div className="grid gap-8">
        {/* DISTINCT HERO BAND */}
        <section className="relative overflow-hidden rounded-3xl border bg-white shadow-sm">
          {/* Decorative blobs */}
          <svg
            className="pointer-events-none absolute -left-12 -top-12 h-64 w-64 opacity-25"
            viewBox="0 0 200 200"
            aria-hidden="true"
          >
            <path
              fill="var(--ohs-sky)"
              d="M45.4,-60.2C58.9,-51.1,69.9,-39.4,74.3,-25.3C78.7,-11.2,76.5,5.4,69.1,19.6C61.7,33.8,49,45.6,34.7,54C20.4,62.5,4.5,67.6,-12.1,69.3C-28.7,70.9,-46,69.1,-58.4,58.8C-70.8,48.4,-78.3,29.6,-77.9,12.1C-77.5,-5.4,-69.2,-21.6,-58.4,-33.4C-47.5,-45.1,-34.1,-52.4,-20.4,-61.9C-6.7,-71.3,7.3,-83,21.6,-81.2C35.9,-79.4,50.4,-64.9,45.4,-60.2Z"
              transform="translate(100 100)"
            />
          </svg>

          <svg
            className="pointer-events-none absolute -right-16 -bottom-16 h-72 w-72 opacity-30"
            viewBox="0 0 200 200"
            aria-hidden="true"
          >
            <path
              fill="var(--ohs-cream)"
              d="M35.9,-55.4C47.4,-49.7,58,-40.2,64.4,-28.2C70.8,-16.2,73.1,-1.7,70.9,12.1C68.7,25.8,62,38.8,51.5,48.7C41,58.6,26.7,65.4,11.4,69.3C-3.9,73.2,-20.1,74.3,-33.6,68.4C-47,62.5,-57.7,49.5,-63.1,35.1C-68.5,20.7,-68.6,4.8,-65.5,-10.3C-62.5,-25.4,-56.2,-39.7,-45.1,-46.7C-34.1,-53.7,-18.3,-53.3,-3.5,-48C11.3,-42.6,22.6,-66.2,35.9,-55.4Z"
              transform="translate(100 100)"
            />
          </svg>

          <div
            className="relative p-6 md:p-10"
            style={{
              background:
                "linear-gradient(135deg, rgba(135,206,235,0.22), rgba(255,248,220,0.6), rgba(255,255,255,0.9))",
            }}
          >
            <div className="max-w-3xl">
              <div className="flex flex-wrap gap-2">
                <ValueBadge text="Established 1996" />
                <ValueBadge text="Mixed Day & Boarding" />
                <ValueBadge text="National + Islamic Studies" />
                <ValueBadge text="Mbikko • Buikwe • Jinja" />
              </div>

              <h2 className="mt-4 text-2xl font-bold tracking-tight text-[color:var(--ohs-charcoal)] md:text-3xl">
                Building knowledge, character, and future leaders
              </h2>

              <p className="mt-3 text-sm text-slate-700 md:text-base">
                Okasha High School (OHS) is a modern secondary school with a strong reputation for discipline,
                academic focus, and faith-based character development. We offer a learning environment where
                students grow in confidence, responsibility, and excellence.
              </p>

              <div className="mt-4 rounded-2xl border bg-white/70 p-4">
                <div className="text-sm font-semibold text-[color:var(--ohs-charcoal)]">
                  Motto: “Education is Light” — <span dir="rtl">العلم نور</span>
                </div>
                <p className="mt-2 text-sm text-slate-700" dir="rtl">
                  العلم نور يهدي الإنسان إلى الحق والعمل الصالح، ويصنع مستقبلاً مشرقاً للأفراد والمجتمعات.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section>
          <h2 className="text-lg font-semibold text-[color:var(--ohs-charcoal)]">At a glance</h2>
          <p className="mt-2 text-sm text-slate-600">
            Quick highlights about the school (these figures can be updated later).
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Founded" value="1996" />
            <Stat label="Sections" value="Day + Boarding" />
            <Stat label="Levels" value="S1–S6" />
            <Stat label="Focus" value="Academics + Faith" />
          </div>
        </section>

        {/* TIMELINE (Distinct layout) */}
        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[color:var(--ohs-charcoal)]">Our journey</h2>
          <p className="mt-2 text-sm text-slate-600">
            A brief history of growth, improvement, and commitment to excellence.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border p-5" style={{ background: "var(--ohs-cream)" }}>
              <div className="text-xs font-semibold text-slate-600">1996</div>
              <div className="mt-1 font-semibold text-[color:var(--ohs-charcoal)]">School established</div>
              <p className="mt-2 text-sm text-slate-700">
                Founded with the goal of providing disciplined education and strong moral upbringing.
              </p>
            </div>

            <div className="rounded-2xl border p-5" style={{ background: "var(--ohs-sky)" }}>
              <div className="text-xs font-semibold text-slate-700">Growth</div>
              <div className="mt-1 font-semibold text-[color:var(--ohs-charcoal)]">Programs expanded</div>
              <p className="mt-2 text-sm text-slate-700">
                Increased capacity, strengthened national curriculum delivery, and structured Islamic studies.
              </p>
            </div>

            <div className="rounded-2xl border p-5 bg-white">
              <div className="text-xs font-semibold text-slate-600">Today</div>
              <div className="mt-1 font-semibold text-[color:var(--ohs-charcoal)]">Modern learning culture</div>
              <p className="mt-2 text-sm text-slate-700">
                A balanced environment for academics, discipline, leadership, and student welfare.
              </p>
            </div>
          </div>
        </section>

        {/* APPROACH (upgrade your existing section, richer content) */}
        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[color:var(--ohs-charcoal)]">Our approach</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border p-5" style={{ background: "var(--ohs-cream)" }}>
              <div className="text-sm font-semibold text-[color:var(--ohs-charcoal)]">Academic Excellence</div>
              <p className="mt-2 text-sm text-slate-700">
                Strong subject teaching, revision culture, continuous assessment, and preparation for national exams.
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
                <li>O-Level & A-Level support</li>
                <li>Study routines and guidance</li>
                <li>Teacher mentorship</li>
              </ul>
            </div>

            <div className="rounded-2xl border p-5" style={{ background: "var(--ohs-sky)" }}>
              <div className="text-sm font-semibold text-[color:var(--ohs-charcoal)]">Faith & Character</div>
              <p className="mt-2 text-sm text-slate-700">
                Islamic theology and Arabic studies that build discipline, manners, confidence, and responsibility.
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
                <li>Arabic language development</li>
                <li>Qur’an studies & morals</li>
                <li>Respectful school culture</li>
              </ul>
            </div>

            <div className="rounded-2xl border p-5 bg-white">
              <div className="text-sm font-semibold text-[color:var(--ohs-charcoal)]">Day & Boarding Life</div>
              <p className="mt-2 text-sm text-slate-700">
                Structured routines, student safety, welfare support, and supervised learning time.
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
                <li>Boarding support & guidance</li>
                <li>Healthy discipline routines</li>
                <li>Student wellbeing focus</li>
              </ul>
            </div>
          </div>
        </section>

        {/* FACILITIES & ACTIVITIES (rich and different) */}
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[color:var(--ohs-charcoal)]">Facilities</h2>
            <p className="mt-2 text-sm text-slate-600">
              Our environment supports learning, worship, and student welfare.
            </p>
            <div className="mt-4 grid gap-3">
              <div className="rounded-2xl border p-4">
                <div className="font-semibold text-[color:var(--ohs-charcoal)]">Classrooms & Learning Spaces</div>
                <p className="mt-1 text-sm text-slate-600">
                  A focused environment for teaching, revision and mentorship.
                </p>
              </div>
              <div className="rounded-2xl border p-4">
                <div className="font-semibold text-[color:var(--ohs-charcoal)]">Boarding & Welfare</div>
                <p className="mt-1 text-sm text-slate-600">
                  Structured routines, supervision, and student wellbeing support.
                </p>
              </div>
              <div className="rounded-2xl border p-4">
                <div className="font-semibold text-[color:var(--ohs-charcoal)]">Islamic Environment</div>
                <p className="mt-1 text-sm text-slate-600">
                  Encouraging prayer, manners, discipline, and respect in daily life.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border p-6 shadow-sm" style={{ background: "var(--ohs-surface)" }}>
            <h2 className="text-lg font-semibold text-[color:var(--ohs-charcoal)]">Activities & Student Life</h2>
            <p className="mt-2 text-sm text-slate-600">
              Beyond academics, students grow through co-curricular participation.
            </p>

            <div className="mt-4 grid gap-3">
              <div className="rounded-2xl border bg-white p-4">
                <div className="font-semibold text-[color:var(--ohs-charcoal)]">Sports & Fitness</div>
                <p className="mt-1 text-sm text-slate-600">
                  Discipline, teamwork and healthy competition.
                </p>
              </div>
              <div className="rounded-2xl border bg-white p-4">
                <div className="font-semibold text-[color:var(--ohs-charcoal)]">Debate & Leadership</div>
                <p className="mt-1 text-sm text-slate-600">
                  Confidence building, communication skills, and student leadership training.
                </p>
              </div>
              <div className="rounded-2xl border bg-white p-4">
                <div className="font-semibold text-[color:var(--ohs-charcoal)]">Qur’an & Arabic Enrichment</div>
                <p className="mt-1 text-sm text-slate-600">
                  Programs supporting memorization, recitation, and Arabic fluency.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ARABIC MISSION (keep, but styled as a feature block) */}
        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[color:var(--ohs-charcoal)]">رسالة المدرسة</h2>
          <div className="mt-3 rounded-2xl border p-5" style={{ background: "var(--ohs-cream)" }}>
            <p className="text-sm text-slate-700 leading-relaxed" dir="rtl">
              نسعى لتربية جيلٍ متعلمٍ ومهذبٍ يجمع بين العلوم الحديثة والعلوم الشرعية،
              ويخدم مجتمعه ودينه ووطنه، ويتميز بالانضباط والأمانة وحسن الخلق.
            </p>
          </div>
        </section>

        {/* CTA (no heavy green) */}
        <section
          className="rounded-3xl border p-6 shadow-sm"
          style={{ background: "linear-gradient(135deg, var(--ohs-sky), white, var(--ohs-cream))" }}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-bold tracking-tight text-[color:var(--ohs-charcoal)]">
                Ready to learn with us?
              </h3>
              <p className="mt-2 text-sm text-slate-700">
                Explore admissions, view programs, or contact the school office for guidance.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <a
                className="rounded-xl border bg-white px-5 py-3 text-center text-sm font-semibold hover:bg-[color:var(--ohs-surface)]"
                href="/admissions"
              >
                Admissions
              </a>
              <a
                className="rounded-xl border bg-white px-5 py-3 text-center text-sm font-semibold hover:bg-[color:var(--ohs-surface)]"
                href="/programs"
              >
                Programs
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
      </div>
    </PageShell>
  );
}
