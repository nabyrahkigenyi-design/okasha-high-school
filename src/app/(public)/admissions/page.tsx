import { PageShell } from "@/components/public/PageShell";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const revalidate = 3600;

export const metadata = {
  title: "Admissions | Okasha High School",
  description: "Admissions information and downloadable forms.",
};

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border bg-white/85 px-3 py-1 text-xs font-semibold text-slate-800">
      {children}
    </span>
  );
}

function Step({
  n,
  title,
  desc,
}: {
  n: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="relative rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div
          className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border text-sm font-bold"
          style={{ background: "var(--ohs-cream)" }}
        >
          {n}
        </div>
        <div>
          <div className="font-semibold text-[color:var(--ohs-charcoal)]">{title}</div>
          <p className="mt-1 text-sm text-slate-600">{desc}</p>
        </div>
      </div>
    </div>
  );
}

function DocCard({ d }: { d: any }) {
  return (
    <section className="group relative overflow-hidden rounded-3xl border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {/* subtle corner ribbon */}
      <div
        className="absolute -right-12 top-6 rotate-45 px-12 py-1 text-[11px] font-bold text-slate-900"
        style={{ background: "var(--ohs-sky)" }}
        aria-hidden
      >
        FORM
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate font-semibold text-[color:var(--ohs-charcoal)]">{d.title}</h2>
          {d.is_primary ? (
            <div className="mt-2 inline-flex rounded-full border bg-[color:var(--ohs-surface)] px-3 py-1 text-xs font-semibold text-slate-700">
              Primary Form
            </div>
          ) : null}
        </div>

        <a
          className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold hover:bg-[color:var(--ohs-surface)]"
          href={d.file_url}
          target="_blank"
          rel="noreferrer"
        >
          Download PDF
        </a>
      </div>

      {d.summary ? <p className="mt-3 text-sm text-slate-600">{d.summary}</p> : null}
      {d.file_name ? <p className="mt-2 text-xs text-slate-500">{d.file_name}</p> : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full border bg-[color:var(--ohs-surface)] px-3 py-1 text-xs font-semibold text-slate-700">
          Print & fill
        </span>
        <span className="rounded-full border bg-[color:var(--ohs-surface)] px-3 py-1 text-xs font-semibold text-slate-700">
          Submit to office
        </span>
      </div>

      <div className="mt-4 text-sm font-semibold text-slate-800">
        Open <span className="inline-block transition group-hover:translate-x-1">→</span>
      </div>
    </section>
  );
}

export default async function AdmissionsPage() {
  const sb = supabaseAdmin();

  const { data: docs } = await sb
    .from("admissions_documents")
    .select("id, title, summary, file_url, file_name, is_primary, sort_order")
    .eq("is_published", true)
    .order("is_primary", { ascending: false })
    .order("sort_order", { ascending: true })
    .limit(50);

  const list = docs ?? [];

  return (
    <PageShell
      title="Admissions"
      subtitle="Download official admission forms and follow the application steps below."
      watermark
    >
      {/* UNIQUE HERO (different from other pages) */}
      <section className="relative overflow-hidden rounded-3xl border bg-white shadow-sm">
        {/* wave-ish shapes */}
        <svg
          className="pointer-events-none absolute -left-12 -top-10 h-72 w-72 opacity-25"
          viewBox="0 0 200 200"
          aria-hidden="true"
        >
          <path
            fill="var(--ohs-sky)"
            d="M43.2,-64.4C56.8,-57.7,69.1,-47.8,73.3,-35.1C77.5,-22.5,73.7,-6.9,69.3,7.7C64.9,22.3,60,35.8,49.9,44.8C39.8,53.8,24.5,58.3,8.6,61.6C-7.4,64.9,-24,67,-38.5,61.5C-53,56.1,-65.4,43.1,-71.1,27.4C-76.9,11.7,-75.9,-6.7,-69.3,-21.5C-62.7,-36.2,-50.5,-47.2,-37.3,-54.5C-24.2,-61.9,-12.1,-65.6,1.2,-67.4C14.4,-69.2,28.8,-71.1,43.2,-64.4Z"
            transform="translate(100 100)"
          />
        </svg>

        <svg
          className="pointer-events-none absolute -right-12 -bottom-12 h-72 w-72 opacity-30"
          viewBox="0 0 200 200"
          aria-hidden="true"
        >
          <path
            fill="var(--ohs-cream)"
            d="M38.5,-61C52.2,-58,67.8,-52.7,74.8,-41.7C81.8,-30.7,80.3,-14,77.9,1.7C75.5,17.4,72.1,32.1,62.7,43C53.3,53.9,37.8,61,22.1,66.4C6.4,71.8,-9.5,75.5,-25,71.9C-40.5,68.3,-55.6,57.4,-63.6,43.4C-71.6,29.4,-72.5,12.3,-69.2,-3.1C-66,-18.4,-58.6,-32.1,-47.6,-39.4C-36.7,-46.7,-22.2,-47.7,-7.9,-55.6C6.5,-63.6,13,-78.6,24.4,-77.1C35.9,-75.7,52.2,-58.1,38.5,-61Z"
            transform="translate(100 100)"
          />
        </svg>

        <div
          className="relative p-6 md:p-10"
          style={{
            background:
              "linear-gradient(135deg, rgba(135,206,235,0.20), rgba(255,248,220,0.65), rgba(255,255,255,0.95))",
          }}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap gap-2">
                <Badge>Mixed Day & Boarding</Badge>
                <Badge>S1–S6</Badge>
                <Badge>Established 1996</Badge>
              </div>

              <h2 className="mt-4 text-2xl font-bold tracking-tight text-[color:var(--ohs-charcoal)] md:text-3xl">
                Join Okasha High School
              </h2>

              <p className="mt-2 text-sm text-slate-700 md:text-base">
                Admissions are processed through the school office. Download the official forms, prepare the required
                documents, and submit for review. Our team will guide you step-by-step.
              </p>

              <p className="mt-3 text-sm text-slate-700" dir="rtl">
                مرحباً بكم — يمكنكم تحميل استمارات القبول واتباع الخطوات أدناه للتسجيل.
              </p>
            </div>

            <div className="grid gap-2">
              <a
                className="rounded-xl px-5 py-3 text-center text-sm font-semibold text-white"
                style={{ background: "var(--ohs-dark-green)" }}
                href="tel:+256740235451"
              >
                Call Admissions: 0740235451
              </a>
              <a
                className="rounded-xl border bg-white px-5 py-3 text-center text-sm font-semibold hover:bg-[color:var(--ohs-surface)]"
                href="tel:+256702444301"
              >
                Director: 0702444301
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* STEPS (timeline look) */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-[color:var(--ohs-charcoal)]">Application Steps</h2>
        <p className="mt-2 text-sm text-slate-600">
          Follow these steps for a smooth application process. If you have questions, call the admissions office.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Step n="1" title="Download the form" desc="Use the official PDF form below or collect a copy from the school office." />
          <Step n="2" title="Prepare requirements" desc="Gather report cards, ID/guardian contacts, and photos. Boarding students should request the boarding list." />
          <Step n="3" title="Submit & confirm" desc="Submit the form to the admissions office. You may be contacted for an interview/assessment based on class level." />
        </div>
      </section>

      {/* REQUIREMENTS (rich checklist) */}
      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[color:var(--ohs-charcoal)]">Admission Requirements</h2>
          <p className="mt-2 text-sm text-slate-600">
            Requirements can vary depending on entry class (S1–S6). The list below is general guidance.
          </p>

          <div className="mt-4 grid gap-3">
            <div className="rounded-2xl border p-4" style={{ background: "var(--ohs-cream)" }}>
              <div className="font-semibold text-[color:var(--ohs-charcoal)]">Academic Documents</div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                <li>Latest report card / results slip</li>
                <li>PLE results (for S1 applicants) or equivalent</li>
                <li>Transfer letter (if coming from another school)</li>
                <li>UCE/UACE details where applicable</li>
              </ul>
            </div>

            <div className="rounded-2xl border p-4" style={{ background: "var(--ohs-sky)" }}>
              <div className="font-semibold text-[color:var(--ohs-charcoal)]">Student & Guardian Details</div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                <li>2–4 passport photos (recent)</li>
                <li>Parent/guardian contacts and location</li>
                <li>Medical notes (allergies/conditions) to support wellbeing</li>
                <li>Emergency contact details</li>
              </ul>
            </div>

            <div className="rounded-2xl border p-4 bg-white">
              <div className="font-semibold text-[color:var(--ohs-charcoal)]">Boarding Students</div>
              <p className="mt-2 text-sm text-slate-600">
                Boarding requires additional welfare items (bedding and personal necessities). The admissions office
                provides the latest boarding list.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border p-4" style={{ background: "var(--ohs-surface)" }}>
            <div className="text-sm font-semibold text-[color:var(--ohs-charcoal)]">Arabic / Islamic Track Note</div>
            <p className="mt-2 text-sm text-slate-700" dir="rtl">
              يُرحَّب بالطلاب الراغبين في دراسة العلوم الشرعية واللغة العربية، وتُراعى مستويات الطلاب عند الالتحاق.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border p-6 shadow-sm" style={{ background: "var(--ohs-surface)" }}>
          <h2 className="text-lg font-semibold text-[color:var(--ohs-charcoal)]">What you get at OHS</h2>
          <p className="mt-2 text-sm text-slate-600">
            Parents choose OHS for discipline, learning focus, and balanced education.
          </p>

          <div className="mt-4 grid gap-3">
            <div className="rounded-2xl border bg-white p-4">
              <div className="font-semibold text-[color:var(--ohs-charcoal)]">Academic Focus</div>
              <p className="mt-1 text-sm text-slate-600">
                Strong teaching, revision culture, and exam preparation.
              </p>
            </div>
            <div className="rounded-2xl border bg-white p-4">
              <div className="font-semibold text-[color:var(--ohs-charcoal)]">Discipline & Character</div>
              <p className="mt-1 text-sm text-slate-600">
                Respect, responsibility, and supportive guidance for learners.
              </p>
            </div>
            <div className="rounded-2xl border bg-white p-4">
              <div className="font-semibold text-[color:var(--ohs-charcoal)]">Day & Boarding Options</div>
              <p className="mt-1 text-sm text-slate-600">
                Flexible choice based on family needs and student welfare.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border bg-white p-4">
            <div className="font-semibold text-[color:var(--ohs-charcoal)]">Uniform guidance</div>
            <p className="mt-2 text-sm text-slate-600">
              Lower Secondary (S1–S4): Cream tops + Sky blue trousers. <br />
              Upper Secondary (S5–S6): Pale green tops + Dark green trousers.
            </p>
            <div className="mt-3 flex gap-2">
              <div className="h-8 w-12 rounded-lg border" style={{ background: "var(--ohs-cream)" }} />
              <div className="h-8 w-12 rounded-lg border" style={{ background: "var(--ohs-sky)" }} />
              <div className="h-8 w-12 rounded-lg border" style={{ background: "var(--ohs-pale-green)" }} />
              <div className="h-8 w-12 rounded-lg border" style={{ background: "var(--ohs-dark-green)" }} />
            </div>
          </div>
        </div>
      </section>

      {/* FORMS (DB-driven, premium layout) */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-[color:var(--ohs-charcoal)]">Download Admission Forms</h2>
        <p className="mt-2 text-sm text-slate-600">
          Use the official school documents below. If you do not see the form, contact admissions.
        </p>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {list.map((d) => (
            <DocCard key={d.id} d={d} />
          ))}
          {!list.length ? (
            <div className="rounded-2xl border bg-white p-6 text-sm text-slate-600">
              No admission documents published yet. Please call admissions:{" "}
              <a className="underline" href="tel:+256740235451">0740235451</a>
            </div>
          ) : null}
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-10 rounded-3xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[color:var(--ohs-charcoal)]">Frequently Asked Questions</h2>
        <div className="mt-4 grid gap-4">
          <details className="rounded-2xl border p-4">
            <summary className="cursor-pointer font-semibold text-slate-800">
              Do you accept both day and boarding students?
            </summary>
            <p className="mt-2 text-sm text-slate-600">
              Yes. OHS is a mixed school with both day and boarding sections. Availability depends on term capacity.
            </p>
          </details>

          <details className="rounded-2xl border p-4">
            <summary className="cursor-pointer font-semibold text-slate-800">
              Can students study both Arabic/Islamic and the national curriculum?
            </summary>
            <p className="mt-2 text-sm text-slate-600">
              Yes. The school integrates Islamic studies and Arabic alongside modern curriculum learning.
              The exact structure depends on class level and program.
            </p>
          </details>

          <details className="rounded-2xl border p-4">
            <summary className="cursor-pointer font-semibold text-slate-800">
              How do I confirm the correct fees before paying?
            </summary>
            <p className="mt-2 text-sm text-slate-600">
              Visit the Fees page and contact admissions for the latest confirmation before payment.
            </p>
          </details>
        </div>
      </section>

      {/* CTA (light theme, minimal green usage here) */}
      <section
        className="mt-10 rounded-3xl border p-6 shadow-sm"
        style={{ background: "linear-gradient(135deg, var(--ohs-sky), white, var(--ohs-cream))" }}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-[color:var(--ohs-charcoal)]">
              Need help with your application?
            </h3>
            <p className="mt-2 text-sm text-slate-700">
              Admissions Office: <a className="underline" href="tel:+256740235451">0740235451</a> • Director:{" "}
              <a className="underline" href="tel:+256702444301">0702444301</a>
            </p>
            <p className="mt-2 text-sm text-slate-700" dir="rtl">
              نحن في خدمتكم — تواصلوا معنا لمساعدتكم في التسجيل.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <a
              className="rounded-xl border bg-white px-5 py-3 text-center text-sm font-semibold hover:bg-[color:var(--ohs-surface)]"
              href="/fees"
            >
              View Fees
            </a>
            <a
              className="rounded-xl border bg-white px-5 py-3 text-center text-sm font-semibold hover:bg-[color:var(--ohs-surface)]"
              href="/contact"
            >
              Send a Message
            </a>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
