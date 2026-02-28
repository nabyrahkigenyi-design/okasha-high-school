// src/app/layout.tsx
import "./globals.css";
import Link from "next/link";
import { Inter, Amiri } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-ar-quran",
});

export const metadata = {
  metadataBase: new URL("https://okashahighschool.com"),
};

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group relative rounded-full px-3 py-2 text-[15px] font-semibold text-slate-800 transition hover:bg-slate-100 active:scale-[0.98]"
    >
      <span className="transition group-hover:text-slate-950">{children}</span>
      <span className="pointer-events-none absolute inset-x-3 -bottom-0.5 h-[2px] origin-left scale-x-0 rounded-full bg-[color:var(--ohs-sky)] transition group-hover:scale-x-100" />
    </Link>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${amiri.variable} scroll-smooth`}>
      <body className="min-h-screen bg-[color:var(--ohs-surface)] text-slate-900 font-sans">
        {/* PRE-HEADER - MOBILE OPTIMIZED (desktop unchanged) */}
        <div
          className="relative border-b text-white"
          style={{
            background: "linear-gradient(135deg, #0b1220, #0f172a 45%, #111827)",
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              background:
                "radial-gradient(circle at 18% 45%, rgba(102,183,230,0.35), rgba(0,0,0,0) 45%), radial-gradient(circle at 85% 30%, rgba(245,230,200,0.22), rgba(0,0,0,0) 45%)",
            }}
          />
          <div className="relative mx-auto max-w-6xl px-4 py-2.5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-white/90">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--ohs-sky)]" />
                  Admissions
                  <a
                    className="underline decoration-white/30 underline-offset-4 hover:text-[color:var(--ohs-sky)] transition"
                    href="tel:+256740235451"
                  >
                    0740235451
                  </a>
                </span>

                {/* HIDE EMAIL + LOCATION ON MOBILE ONLY */}
                <span className="hidden sm:inline text-white/25">•</span>
                <a
                  className="hidden sm:inline underline decoration-white/30 underline-offset-4 hover:text-[color:var(--ohs-sky)] transition"
                  href="mailto:info@okashahighschool.com"
                >
                  info@okashahighschool.com
                </a>

                <span className="hidden sm:inline text-white/25">•</span>
                <span className="hidden sm:inline text-white/80">Mbikko • Buikwe • Jinja</span>

                <span className="hidden md:inline text-white/25">•</span>
                <span className="hidden md:inline text-white/75">Mon–Sat • 8:00–17:00</span>
              </div>

              {/* Quranic-style Arabic greeting - enlarged on mobile */}
              <div 
                className="text-base font-ar-quran font-normal text-white/95 md:text-lg"
                dir="rtl"
                style={{ 
                  fontFamily: 'var(--font-ar-quran), serif',
                  fontSize: '1.05rem',
                  letterSpacing: '0.03em',
                  lineHeight: '1.5'
                }}
              >
                أهلاً وسهلاً بكم
              </div>
            </div>
          </div>
        </div>

        {/* HEADER - MOBILE OPTIMIZED (desktop unchanged) */}
        <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
            {/* Logo - ENLARGED ON MOBILE ONLY */}
            <Link href="/" className="flex items-center gap-3 active:scale-[0.99] transition">
              <div
                className="h-10 w-10 rounded-2xl border-2 border-[color:var(--ohs-sky)] shadow-md md:h-10 md:w-10"
                style={{
                  background: "linear-gradient(135deg, var(--ohs-cream) 25%, var(--ohs-sky) 65%, #ffffff 100%)",
                  boxShadow: "0 4px 12px rgba(102, 183, 230, 0.25)"
                }}
              />
              <div className="flex flex-col">
                <div className="flex items-baseline gap-2">
                  <div className="text-base font-extrabold tracking-tight text-[color:var(--ohs-charcoal)]">
                    OKASHA
                  </div>
                  <div className="text-base font-extrabold tracking-tight text-[color:var(--ohs-sky)]">
                    HIGH SCHOOL
                  </div>
                </div>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="text-xs text-slate-600">Education is Light</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--ohs-sky)] opacity-60" />
                  <span 
                    className="font-ar-quran font-normal not-italic text-slate-700"
                    dir="rtl"
                    style={{ 
                      fontFamily: 'var(--font-ar-quran), serif',
                      fontSize: '0.85rem',
                      fontWeight: 400,
                      letterSpacing: '0.04em',
                      lineHeight: '1.4'
                    }}
                  >
                    العلم نور
                  </span>
                </div>
              </div>
            </Link>

            {/* Desktop nav - unchanged */}
            <nav className="hidden items-center gap-1 md:flex">
              <NavLink href="/about">About</NavLink>
              <NavLink href="/admissions">Admissions</NavLink>
              <NavLink href="/programs">Programs</NavLink>
              <NavLink href="/staff">Staff</NavLink>
              <NavLink href="/calendar">Calendar</NavLink>
              <NavLink href="/news">News</NavLink>
              <NavLink href="/fees">Fees</NavLink>
              <NavLink href="/policies">Policies</NavLink>
              <NavLink href="/contact">Contact</NavLink>

              <Link
                href="/portal"
                className="ml-2 rounded-full bg-gradient-to-r from-[color:var(--ohs-dark-green)] to-[color:var(--ohs-charcoal)] px-5 py-2 text-sm font-extrabold text-white shadow-lg transition hover:from-[color:var(--ohs-charcoal)] hover:to-[color:var(--ohs-dark-green)] hover:shadow-xl active:scale-[0.98]"
              >
                Portal
              </Link>
            </nav>

            {/* Mobile - BEAUTIFUL BURGER ICON (desktop unchanged) */}
            <div className="flex items-center gap-2 md:hidden">
              <Link
                href="/portal"
                className="rounded-full bg-gradient-to-r from-[color:var(--ohs-dark-green)] to-[color:var(--ohs-charcoal)] px-4 py-2 text-xs font-extrabold text-white shadow-sm transition active:scale-[0.98]"
              >
                Portal
              </Link>

              {/* BEAUTIFUL CUSTOM BURGER ICON - MOBILE ONLY */}
              <details className="relative group">
                <summary className="list-none cursor-pointer rounded-xl border bg-white p-2.5 text-xl font-bold text-slate-800 shadow-sm transition hover:bg-slate-50 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-[color:var(--ohs-sky)] focus:ring-offset-2" aria-label="Open menu">
                  <div className="relative h-5 w-6">
                    <span className="absolute inset-x-0 top-0 block h-0.5 w-full origin-left rounded-full bg-slate-800 transition-transform group-open:translate-x-1 group-open:scale-x-75 group-open:opacity-0" />
                    <span className="absolute inset-x-0 top-1/2 block h-0.5 w-full -translate-y-1/2 origin-center rounded-full bg-slate-800 transition-transform group-open:rotate-45" />
                    <span className="absolute inset-x-0 bottom-0 block h-0.5 w-full origin-center rounded-full bg-slate-800 transition-transform group-open:-rotate-45" />
                  </div>
                </summary>

                <div className="absolute right-0 mt-2 w-64 origin-top-right overflow-hidden rounded-3xl border bg-white shadow-2xl ring-1 ring-black/5 transition opacity-100 group-open:animate-fade-in">
                  <div className="grid p-2 text-sm">
                    {[
                      ["About", "/about"],
                      ["Admissions", "/admissions"],
                      ["Programs", "/programs"],
                      ["Staff", "/staff"],
                      ["Calendar", "/calendar"],
                      ["News", "/news"],
                      ["Fees", "/fees"],
                      ["Policies", "/policies"],
                      ["Contact", "/contact"],
                    ].map(([label, href]) => (
                      <Link
                        key={href}
                        href={href}
                        className="rounded-2xl px-4 py-3 font-semibold text-slate-800 transition hover:bg-gradient-to-r hover:from-[color:var(--ohs-sky)] hover:to-[color:var(--ohs-cream)] hover:text-white active:scale-[0.99]"
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>
              </details>
            </div>
          </div>
        </header>

        {/* MAIN */}
        <main className="min-h-[70vh]">{children}</main>

        {/* FOOTER - MOBILE OPTIMIZED (desktop unchanged) */}
        <footer
          className="relative mt-16 text-white"
          style={{
            background: "linear-gradient(135deg, #0b1220, #0f172a 35%, #111827)",
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              background:
                "radial-gradient(circle at 20% 25%, rgba(245,230,200,0.25), rgba(0,0,0,0) 48%), radial-gradient(circle at 82% 60%, rgba(102,183,230,0.25), rgba(0,0,0,0) 52%)",
            }}
          />

          <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            {/* Main Footer Grid - 4 columns on large screens, 2 on medium, 1 on mobile */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {/* Column 1: About / Brand */}
              <div className="space-y-5">
                <div>
                  <div className="text-xs font-extrabold tracking-[0.18em] text-white/60">
                    OKASHA HIGH SCHOOL
                  </div>
                  <h2 className="mt-2 text-xl font-extrabold tracking-tight text-white">
                    EDUCATION IS{" "}
                    <span className="text-[color:var(--ohs-sky)]">LIGHT</span>
                  </h2>
                </div>

                <p className="text-sm leading-relaxed text-white/85">
                  A mixed day and boarding secondary school established in 1996. We integrate the
                  national curriculum with Islamic theology to nurture disciplined learners and
                  upright citizens.
                </p>

                {/* Quranic-style Arabic description */}
                <p 
                  className="mt-3 text-base font-ar-quran font-normal text-white/90"
                  dir="rtl"
                  style={{ 
                    fontFamily: 'var(--font-ar-quran), serif',
                    fontSize: '1.05rem',
                    fontWeight: 400,
                    lineHeight: '1.75',
                    letterSpacing: '0.03em'
                  }}
                >
                  مدرسة أوكاشا الثانوية — تربية متوازنة تجمع بين التفوق الأكاديمي والقيم الإسلامية
                </p>

                {/* BADGES: HIDDEN ON MOBILE, VISIBLE ON DESKTOP */}
                <div className="mt-3 hidden flex-wrap gap-2 md:flex">
                  {["Mixed School", "Day & Boarding", "Established 1996"].map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/85"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Column 2: Contact Information */}
              <div className="space-y-5">
                <div>
                  <div className="text-xs font-extrabold tracking-[0.18em] text-white/60">
                    CONTACT US
                  </div>
                  <h3 className="mt-2 text-lg font-bold text-white">Reach Our Campus</h3>
                </div>

                <div className="space-y-4 text-sm text-white/85">
                  <div className="flex items-start gap-3">
                    <span className="mt-1 flex-shrink-0 text-[color:var(--ohs-sky)]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                    </span>
                    <div>
                      <div className="font-semibold text-white">Our Campus</div>
                      <div className="mt-1">Mbikko, Buikwe District</div>
                      <div>Jinja, Uganda</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="mt-1 flex-shrink-0 text-[color:var(--ohs-sky)]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h.007a15.002 15.002 0 004.243-1.086c.228-.068.448-.144.66-.228M2.25 6.75a15.033 15.033 0 0115-1.086c.228.084.448.16.66.228m-6.75-6.75a7.5 7.5 0 11-10.607 10.607" />
                      </svg>
                    </span>
                    <div>
                      <div className="font-semibold text-white">Admissions Office</div>
                      <div className="mt-1">
                        <a
                          href="tel:+256740235451"
                          className="block hover:text-[color:var(--ohs-sky)] transition"
                        >
                          +256 740 235 451
                        </a>
                        <a
                          href="tel:+256752629926"
                          className="block hover:text-[color:var(--ohs-sky)] transition"
                        >
                          +256 752 629 926
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="mt-1 flex-shrink-0 text-[color:var(--ohs-sky)]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.34 0L2.67 11.916A2.25 2.25 0 011.6 9.993V9.75m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.34 0L2.67 11.916A2.25 2.25 0 011.6 9.993V6.75" />
                      </svg>
                    </span>
                    <div>
                      <div className="font-semibold text-white">Email</div>
                      <div className="mt-1">
                        <a
                          href="mailto:info@okashahighschool.com"
                          className="hover:text-[color:var(--ohs-sky)] transition"
                        >
                          info@okashahighschool.com
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 3: Quick Links */}
              <div className="space-y-5">
                <div>
                  <div className="text-xs font-extrabold tracking-[0.18em] text-white/60">
                    NAVIGATION
                  </div>
                  <h3 className="mt-2 text-lg font-bold text-white">Explore</h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "About Us", href: "/about" },
                    { label: "Admissions", href: "/admissions" },
                    { label: "Academic Programs", href: "/programs" },
                    { label: "Teaching Staff", href: "/staff" },
                    { label: "School Calendar", href: "/calendar" },
                    { label: "News & Events", href: "/news" },
                    { label: "Fee Structure", href: "/fees" },
                    { label: "School Policies", href: "/policies" },
                  ].map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white active:scale-[0.99]"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-white/25 transition group-hover:bg-[color:var(--ohs-sky)]" />
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Column 4: Actions & Hours */}
              <div className="space-y-5">
                <div>
                  <div className="text-xs font-extrabold tracking-[0.18em] text-white/60">
                    CAMPUS LIFE
                  </div>
                  <h3 className="mt-2 text-lg font-bold text-white">Important Info</h3>
                </div>

                <div className="space-y-4 rounded-2xl border border-white/15 bg-white/5 p-4">
                  <div>
                    <div className="text-xs font-extrabold tracking-wide text-white/70">SCHOOL HOURS</div>
                    <div className="mt-2 space-y-1.5 text-sm text-white/85">
                      <div>Monday – Friday: 8:00 AM – 5:00 PM</div>
                      <div>Saturday: 8:00 AM – 1:00 PM</div>
                      <div className="text-[color:var(--ohs-sky)]">Sunday: Closed</div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/15">
                    <div className="text-xs font-extrabold tracking-wide text-white/70">STUDENT PORTAL</div>
                    <Link
                      href="/portal"
                      className="mt-2 inline-flex items-center gap-2 rounded-xl bg-[color:var(--ohs-dark-green)] px-4 py-2.5 font-extrabold text-sm text-white transition hover:opacity-95 active:scale-[0.98]"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <line x1="7" y1="7" x2="17" y2="17" />
                      </svg>
                      Access Portal
                    </Link>
                  </div>
                </div>

                <div>
                  <Link
                    href="/admissions"
                    className="inline-flex w-full items-center justify-center rounded-xl bg-[color:var(--ohs-sky)] px-4 py-3 text-sm font-extrabold text-[color:var(--ohs-charcoal)] shadow-sm transition hover:opacity-95 active:scale-[0.98]"
                  >
                    APPLY NOW →
                  </Link>
                </div>
              </div>
            </div>

            {/* Divider & Copyright */}
            <div className="mt-12 border-t border-white/15 pt-8">
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <p className="text-xs text-white/60">
                  © {new Date().getFullYear()} Okasha High School. All rights reserved.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-white/70">
                  <span>Academic & Islamic Excellence</span>
                  <span className="hidden sm:inline">•</span>
                  <span>Mbikko, Buikwe District, Uganda</span>
                </div>
              </div>
            </div>
          </div>
        </footer>

        {/* Mobile menu animation - ONLY FOR MOBILE */}
        <style>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(-8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 180ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          details > summary::-webkit-details-marker {
            display: none;
          }
          @media (min-width: 768px) {
            .group-open\\:animate-fade-in {
              animation: none !important;
            }
          }
        `}</style>
      </body>
    </html>
  );
}