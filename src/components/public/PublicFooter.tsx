// src/components/public/PublicFooter.tsx
import Link from "next/link";

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-white/90 transition
                 hover:bg-white/10 hover:text-white active:scale-[0.99]"
    >
      <span>{children}</span>
      <span className="opacity-60 transition group-hover:translate-x-0.5">→</span>
    </Link>
  );
}

export default function PublicFooter() {
  return (
    <footer className="mt-16">
      <div className="relative overflow-hidden border-t">
        {/* Background image (same concept as pre-header) */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage: "url(/footer-bg.jpg)", // add to /public
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* Overlay for earthy feel (close to site colors) */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(15,23,42,0.92), rgba(30,41,59,0.92), rgba(15,23,42,0.94))",
          }}
        />

        {/* Soft highlight band */}
        <div
          aria-hidden
          className="absolute -top-24 left-1/2 h-48 w-[520px] -translate-x-1/2 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(234,220,175,0.30), rgba(135,206,235,0.18), rgba(0,0,0,0))",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-4 py-12">
          {/* Top grid */}
          <div className="grid gap-10 md:grid-cols-3">
            {/* Brand */}
            <div>
              <div className="text-xs font-extrabold tracking-[0.18em] text-white/70">
                OKASHA HIGH SCHOOL
              </div>

              <h2 className="mt-2 text-xl font-extrabold text-white">
                Education <span className="text-white/70">for both</span>{" "}
                <span
                  className="underline decoration-white/30 underline-offset-4"
                  style={{ color: "var(--ohs-sky)" }}
                >
                  Dunyā & Ākhirah
                </span>
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-white/80">
                Mixed Day & Boarding Secondary School • Established 1996 • Mbikko,
                Buikwe District (Jinja), Uganda.
              </p>

              <p className="mt-4 text-sm text-white/85">
                <span className="font-semibold text-white">MOTTO:</span>{" "}
                Education is Light —{" "}
                <span dir="rtl" className="font-ar text-base text-white">
                  العلم نور
                </span>
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80">
                  Day Section
                </span>
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80">
                  Boarding Section
                </span>
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80">
                  Islamic & Secular
                </span>
              </div>
            </div>

            {/* Contacts */}
            <div>
              <div className="text-xs font-extrabold tracking-[0.18em] text-white/70">
                CONTACTS
              </div>

              <div className="mt-4 grid gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-semibold text-white">Director</div>
                  <div className="mt-1 text-sm text-white/80">
                    Sheikh Abdrahman Twahir Kigenyi
                  </div>
                  <a
                    className="mt-2 inline-flex rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white transition
                               hover:bg-white/15 active:scale-[0.99]"
                    href="tel:+256702444301"
                  >
                    0702444301
                  </a>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-semibold text-white">Admissions Office</div>
                  <a
                    className="mt-2 inline-flex rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white transition
                               hover:bg-white/15 active:scale-[0.99]"
                    href="tel:+256740235451"
                  >
                    0740235451
                  </a>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-semibold text-white">Location</div>
                  <div className="mt-1 text-sm text-white/80">
                    Mbikko, Buikwe District — Jinja, Uganda
                  </div>
                </div>
              </div>
            </div>

            {/* Links */}
            <div>
              <div className="text-xs font-extrabold tracking-[0.18em] text-white/70">
                QUICK LINKS
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <FooterLink href="/about">About</FooterLink>
                <FooterLink href="/admissions">Admissions</FooterLink>
                <FooterLink href="/programs">Programs</FooterLink>
                <FooterLink href="/fees">Fees</FooterLink>
                <FooterLink href="/calendar">Calendar</FooterLink>
                <FooterLink href="/news">News</FooterLink>
                <FooterLink href="/policies">Policies</FooterLink>
                <FooterLink href="/contact">Contact</FooterLink>
              </div>

              <Link
                href="/portal"
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-extrabold text-slate-900 transition
                           hover:bg-white/95 active:scale-[0.99]"
              >
                PORTAL LOGIN
              </Link>

              <p className="mt-4 text-xs text-white/70" dir="rtl">
                مرحباً بكم — نسعد بتواصلكم معنا، ونسأل الله التوفيق لأبنائنا الطلاب.
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="mt-10 border-t border-white/10 pt-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-white/70">
                © {new Date().getFullYear()} Okasha High School. All rights reserved.
              </p>

              <div className="flex flex-wrap gap-2 text-xs text-white/70">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  Education is Light
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-ar" dir="rtl">
                  العلم نور
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}