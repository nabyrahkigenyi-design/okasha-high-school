import { PageShell } from "@/components/public/PageShell";
import ContactForm from "./ContactForm";
import Link from "next/link";

export const revalidate = 3600;

export const metadata = {
  title: "Contact | Okasha High School",
  description: "Contact Okasha High School (OHS) in Mbikko, Buikwe District, Jinja, Uganda.",
};

function ActionButton({
  href,
  label,
  tone = "light",
}: {
  href: string;
  label: string;
  tone?: "light" | "sky" | "cream" | "dark";
}) {
  const style =
    tone === "dark"
      ? { className: "text-white", bg: "var(--ohs-dark-green)" } // keep dark-green here only for strong CTA
      : tone === "sky"
      ? { className: "text-slate-900", bg: "var(--ohs-sky)" }
      : tone === "cream"
      ? { className: "text-slate-900", bg: "var(--ohs-cream)" }
      : { className: "text-slate-900", bg: "white" };

  return (
    <a
      href={href}
      className={`rounded-2xl border px-4 py-3 text-center text-sm font-semibold shadow-sm hover:shadow-md transition ${style.className}`}
      style={{ background: style.bg }}
    >
      {label}
    </a>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border bg-white/85 px-3 py-1 text-xs font-semibold text-slate-800">
      {children}
    </span>
  );
}

export default function ContactPage() {
  return (
    <PageShell
      title="Contact"
      subtitle="Reach the school office for admissions, enquiries and official communication."
      watermark
    >
      {/* DISTINCT HERO BAND */}
      <section className="relative overflow-hidden rounded-3xl border bg-white shadow-sm">
        <svg
          className="pointer-events-none absolute -left-10 -top-12 h-64 w-64 opacity-25"
          viewBox="0 0 200 200"
          aria-hidden="true"
        >
          <path
            fill="var(--ohs-sky)"
            d="M40.7,-62.2C54.3,-56,68.3,-46.6,73.4,-34C78.5,-21.4,74.7,-5.5,70.5,9.8C66.2,25.1,61.4,39.8,51.2,49.2C41,58.7,25.4,62.8,9.7,66.2C-6,69.6,-22.1,72.3,-36.5,67.3C-50.9,62.3,-63.6,49.6,-70.3,35C-77.1,20.4,-77.8,3.9,-72.8,-9.9C-67.8,-23.7,-57.1,-34.8,-45.1,-42.7C-33.1,-50.6,-19.8,-55.3,-5.3,-57.5C9.3,-59.6,27.1,-68.4,40.7,-62.2Z"
            transform="translate(100 100)"
          />
        </svg>

        <svg
          className="pointer-events-none absolute -right-14 -bottom-14 h-72 w-72 opacity-30"
          viewBox="0 0 200 200"
          aria-hidden="true"
        >
          <path
            fill="var(--ohs-cream)"
            d="M35.4,-54.6C47.2,-54.1,59,-47.9,66.3,-38C73.6,-28.1,76.4,-14.1,74.6,-1.1C72.8,11.9,66.4,23.8,58.3,34.9C50.2,46,40.4,56.2,28.4,62.2C16.4,68.3,2.2,70.1,-12.1,70.4C-26.5,70.7,-41.1,69.6,-52.9,62.1C-64.7,54.6,-73.7,40.7,-77.5,25.6C-81.2,10.5,-79.8,-5.8,-74.5,-20.3C-69.2,-34.8,-60.1,-47.5,-47.5,-49.7C-34.9,-52,-17.5,-43.8,-2.7,-39.1C12.1,-34.4,23.6,-55.2,35.4,-54.6Z"
            transform="translate(100 100)"
          />
        </svg>

        <div
          className="relative p-6 md:p-10"
          style={{
            background:
              "linear-gradient(135deg, rgba(135,206,235,0.18), rgba(255,248,220,0.62), rgba(255,255,255,0.95))",
          }}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap gap-2">
                <Badge>Admissions support</Badge>
                <Badge>Official communication</Badge>
                <Badge>Mbikko • Buikwe • Jinja</Badge>
              </div>

              <h2 className="mt-4 text-2xl font-bold tracking-tight text-[color:var(--ohs-charcoal)] md:text-3xl">
                Get in touch with Okasha High School
              </h2>

              <p className="mt-2 text-sm text-slate-700 md:text-base">
                Use the form for messages, or call directly for urgent admissions and reporting queries.
              </p>

              <p className="mt-3 text-sm text-slate-700" dir="rtl">
                مرحباً بكم — يمكنكم الاتصال أو إرسال رسالة عبر النموذج.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <ActionButton href="tel:+256702444301" label="Call Director" tone="cream" />
              <ActionButton href="tel:+256740235451" label="Call Admissions" tone="sky" />
              {/* WhatsApp placeholder: replace number or remove if not used */}
              <ActionButton
                href="https://wa.me/256740235451"
                label="WhatsApp (Admissions)"
                tone="light"
              />
              <Link
                href="/portal"
                className="rounded-2xl border px-4 py-3 text-center text-sm font-semibold text-white shadow-sm hover:shadow-md transition"
                style={{ background: "var(--ohs-dark-green)" }}
              >
                Portal
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border bg-white/70 p-4">
              <div className="text-xs font-semibold text-slate-600">Response</div>
              <div className="mt-1 text-sm font-semibold text-slate-900">As soon as possible</div>
              <p className="mt-1 text-xs text-slate-600">During working hours, we reply promptly.</p>
            </div>
            <div className="rounded-2xl border bg-white/70 p-4">
              <div className="text-xs font-semibold text-slate-600">Best for</div>
              <div className="mt-1 text-sm font-semibold text-slate-900">Admissions & reporting</div>
              <p className="mt-1 text-xs text-slate-600">Call if you need quick confirmation.</p>
            </div>
            <div className="rounded-2xl border bg-white/70 p-4">
              <div className="text-xs font-semibold text-slate-600">Location</div>
              <div className="mt-1 text-sm font-semibold text-slate-900">Mbikko, Buikwe</div>
              <p className="mt-1 text-xs text-slate-600">Jinja, Uganda</p>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT: cards + map + form */}
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {/* LEFT: contacts + map */}
        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[color:var(--ohs-charcoal)]">Contacts & Location</h2>

          <div className="mt-4 grid gap-3 text-sm text-slate-700">
            <div className="rounded-2xl border p-4" style={{ background: "var(--ohs-cream)" }}>
              <div className="font-semibold">Director</div>
              <div className="text-slate-700">Sheikh Abdrahman Twahir Kigenyi</div>
              <a className="mt-1 inline-block underline" href="tel:+256702444301">
                0702444301
              </a>
            </div>

            <div className="rounded-2xl border p-4" style={{ background: "var(--ohs-sky)" }}>
              <div className="font-semibold">Admissions Office</div>
              <a className="mt-1 inline-block underline" href="tel:+256740235451">
                0740235451
              </a>
              <div className="mt-2 text-xs text-slate-600">
                For admissions guidance, documents, reporting dates, and boarding enquiries.
              </div>
            </div>

            <div className="rounded-2xl border p-4 bg-white">
              <div className="font-semibold">Address</div>
              <div className="text-slate-600">Mbikko, Buikwe District, Jinja, Uganda</div>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-3xl border">
            <iframe
              title="OHS Map"
              className="h-72 w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps?q=Mbikko%2C%20Buikwe%20District%2C%20Uganda&output=embed"
            />
          </div>

          <p className="mt-4 text-sm text-slate-700" dir="rtl">
            مرحباً بكم — موقع المدرسة في مبيكو، مقاطعة بويكوي، جينجا، أوغندا.
          </p>
        </section>

        {/* RIGHT: message form */}
        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[color:var(--ohs-charcoal)]">Send a message</h2>
          <p className="mt-2 text-sm text-slate-600">
            Use this form for official enquiries. For urgent issues, please call the admissions office.
          </p>

          <div className="mt-4">
            <ContactForm />
          </div>

          <div className="mt-6 rounded-2xl border p-4" style={{ background: "var(--ohs-surface)" }}>
            <div className="text-sm font-semibold text-[color:var(--ohs-charcoal)]">Tip</div>
            <p className="mt-1 text-sm text-slate-700">
              Include the student’s class (or intended class), whether you prefer day or boarding, and your contact number.
            </p>
            <p className="mt-2 text-sm text-slate-700" dir="rtl">
              الرجاء ذكر الصف المطلوب (أو الصف الحالي)، ونوع السكن (داخلي/خارجي)، ورقم التواصل.
            </p>
          </div>
        </section>
      </div>

      {/* LIGHT CTA */}
      <section
        className="mt-10 rounded-3xl border p-6 shadow-sm"
        style={{ background: "linear-gradient(135deg, var(--ohs-sky), white, var(--ohs-cream))" }}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-[color:var(--ohs-charcoal)]">
              Looking for admissions forms?
            </h3>
            <p className="mt-2 text-sm text-slate-700">
              Visit the admissions page to download official PDFs and follow the application steps.
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
              href="/fees"
            >
              Fees
            </a>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
