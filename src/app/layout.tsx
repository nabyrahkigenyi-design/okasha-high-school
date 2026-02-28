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
        {/* PRE-HEADER - SINGLE LINE (Arabic hidden on mobile) */}
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
          <div className="relative mx-auto max-w-6xl px-4 py-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[0.82rem] font-semibold text-white/90">
                {/* Mobile: Lucide Phone icon + number */}
                <a
                  href="tel:+256740235451"
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-gradient-to-r from-[color:var(--ohs-sky)] to-[color:var(--ohs-cream)] px-3 py-1 text-white shadow-sm transition hover:opacity-90 active:scale-[0.98] md:hidden"
                >
                  {/* Lucide Phone icon - perfect path */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span className="font-medium">0740 235 451</span>
                </a>

                {/* Mobile: Location badge */}
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 md:hidden">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[color:var(--ohs-sky)]">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span className="hidden xs:inline">Mbikko, Buikwe</span>
                  <span className="xs:hidden">Buikwe</span>
                </span>

                {/* Desktop: Full contact info */}
                <span className="hidden md:inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--ohs-sky)]" />
                  <span>Admissions:</span>
                  <a
                    className="font-medium underline decoration-white/30 underline-offset-4 hover:text-[color:var(--ohs-sky)] transition"
                    href="tel:+256740235451"
                  >
                    0740 235 451
                  </a>
                </span>

                <span className="hidden md:inline text-white/25">•</span>
                <span className="hidden md:inline text-white/80">Mbikko, Jinja</span>
                <span className="hidden lg:inline text-white/25">•</span>
                <span className="hidden lg:inline text-white/75">Mon–Sat: 8AM–5PM</span>
              </div>

              {/* Arabic greeting - HIDDEN ON MOBILE FOR SINGLE LINE */}
              <div 
                className="hidden text-base font-ar-quran font-normal text-white/95 md:block"
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

        {/* HEADER */}
        <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 active:scale-[0.99] transition">
              <div
                className="h-11 w-11 rounded-2xl border-2 border-[color:var(--ohs-sky)] shadow-md"
                style={{
                  background: "linear-gradient(135deg, var(--ohs-cream) 25%, var(--ohs-sky) 65%, #ffffff 100%)",
                  boxShadow: "0 4px 14px rgba(102, 183, 230, 0.32)"
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
                <div className="mt-0.5 hidden items-center gap-2 text-[0.82rem] text-slate-600 sm:flex">
                  <span>Education is Light</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--ohs-sky)] opacity-60" />
                  <span 
                    className="font-ar-quran font-normal not-italic"
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

            {/* Desktop nav */}
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

            {/* Mobile - BORDERLESS BURGER ICON */}
            <div className="flex items-center gap-2 md:hidden">
              <Link
                href="/portal"
                className="rounded-xl bg-gradient-to-r from-[color:var(--ohs-dark-green)] to-[color:var(--ohs-charcoal)] px-3.5 py-2 text-[0.85rem] font-extrabold text-white shadow-sm transition active:scale-[0.98]"
              >
                Portal
              </Link>

              {/* MOBILE MENU TOGGLE - pure CSS/HTML */}
              <input type="checkbox" id="mobile-menu" className="peer hidden" />

              {/* BURGER ICON (transforms to X) */}
              <label htmlFor="mobile-menu" className="block cursor-pointer">
                <div className="relative h-5 w-6">
                  <span className="absolute inset-x-0 top-0 block h-0.5 w-full origin-left rounded-full bg-slate-800 transition-transform peer-checked:translate-x-1 peer-checked:scale-x-0 peer-checked:opacity-0" />
                  <span className="absolute inset-x-0 top-1/2 block h-0.5 w-full -translate-y-1/2 origin-center rounded-full bg-slate-800 transition-transform peer-checked:rotate-45" />
                  <span className="absolute inset-x-0 bottom-0 block h-0.5 w-full origin-center rounded-full bg-slate-800 transition-transform peer-checked:-rotate-45" />
                </div>
              </label>

              {/* FULL-SCREEN MENU OVERLAY - pure CSS animation */}
              <div className="fixed inset-0 z-50 opacity-0 transition-opacity duration-300 peer-checked:opacity-100 peer-checked:animate-slide-up pointer-events-none peer-checked:pointer-events-auto">
                {/* Overlay - closes menu when clicked (pure HTML label) */}
                <label htmlFor="mobile-menu" className="absolute inset-0 bg-gradient-to-br from-[#0f172a] to-[#1e293b] opacity-95" />

                <div className="relative mx-auto flex h-full max-w-lg flex-col px-6 pt-8 pb-10">
                  {/* Close button */}
                  <label htmlFor="mobile-menu" className="absolute right-6 top-6 z-10 block h-8 w-8 cursor-pointer rounded-full bg-white/10 backdrop-blur-sm transition hover:bg-white/20 active:scale-95">
                    <div className="relative mx-auto mt-2 h-4 w-4">
                      <span className="absolute inset-0 block h-0.5 w-full origin-center rotate-45 bg-white" />
                      <span className="absolute inset-0 block h-0.5 w-full origin-center -rotate-45 bg-white" />
                    </div>
                  </label>

                  {/* Navigation links - each wrapped in label to close menu on click */}
                  <div className="mt-12 flex flex-col gap-1.5">
                    {[
                      { label: "Home", href: "/" },
                      { label: "About Us", href: "/about" },
                      { label: "Admissions", href: "/admissions" },
                      { label: "Academic Programs", href: "/programs" },
                      { label: "Teaching Staff", href: "/staff" },
                      { label: "School Calendar", href: "/calendar" },
                      { label: "News & Events", href: "/news" },
                      { label: "Fee Structure", href: "/fees" },
                      { label: "School Policies", href: "/policies" },
                      { label: "Contact Us", href: "/contact" },
                    ].map((link) => (
                      <label key={link.href} htmlFor="mobile-menu" className="block w-full">
                        <Link
                          href={link.href}
                          className="group relative block w-full rounded-2xl px-5 py-4 text-lg font-extrabold text-white/90 transition hover:text-white active:scale-[0.99]"
                        >
                          <span>{link.label}</span>
                          <span className="absolute -left-1.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[color:var(--ohs-sky)] opacity-0 transition group-hover:opacity-100" />
                        </Link>
                      </label>
                    ))}
                  </div>

                  {/* Bottom actions */}
                  <div className="mt-auto flex flex-col gap-3">
                    <label htmlFor="mobile-menu" className="block w-full">
                      <Link
                        href="/portal"
                        className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[color:var(--ohs-dark-green)] to-[color:var(--ohs-charcoal)] px-5 py-4 font-extrabold text-white transition hover:opacity-95 active:scale-[0.98]"
                      >
                        Student Portal
                      </Link>
                    </label>
                    
                    <div className="rounded-2xl border border-white/15 bg-white/5 p-4 text-center">
                      <div className="text-xs font-extrabold tracking-wide text-white/70">VISIT OUR CAMPUS</div>
                      <div className="mt-1.5 text-sm font-bold text-white">Mbikko, Buikwe District</div>
                      <div className="mt-0.5 text-sm text-[color:var(--ohs-sky)]">Near Jinja, Uganda</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN */}
        <main className="min-h-[70vh]">{children}</main>

        {/* FOOTER - unchanged (badges hidden on mobile) */}
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

                {/* BADGES HIDDEN ON MOBILE */}
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

              {/* Columns 2-4 - concise version for brevity (unchanged functionality) */}
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
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
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
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </span>
                    <div>
                      <div className="font-semibold text-white">Admissions</div>
                      <div className="mt-1">
                        <a href="tel:+256740235451" className="block hover:text-[color:var(--ohs-sky)] transition">+256 740 235 451</a>
                        <a href="tel:+256752629926" className="block hover:text-[color:var(--ohs-sky)] transition">+256 752 629 926</a>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-1 flex-shrink-0 text-[color:var(--ohs-sky)]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><polyline points="22,6 12,13 2,6" />
                      </svg>
                    </span>
                    <div>
                      <div className="font-semibold text-white">Email</div>
                      <div className="mt-1">
                        <a href="mailto:info@okashahighschool.com" className="hover:text-[color:var(--ohs-sky)] transition">info@okashahighschool.com</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <div className="text-xs font-extrabold tracking-[0.18em] text-white/60">
                    QUICK LINKS
                  </div>
                  <h3 className="mt-2 text-lg font-bold text-white">Navigate</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "About", href: "/about" },
                    { label: "Admissions", href: "/admissions" },
                    { label: "Programs", href: "/programs" },
                    { label: "Staff", href: "/staff" },
                    { label: "Calendar", href: "/calendar" },
                    { label: "News", href: "/news" },
                    { label: "Fees", href: "/fees" },
                    { label: "Policies", href: "/policies" },
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

              <div className="space-y-5">
                <div>
                  <div className="text-xs font-extrabold tracking-[0.18em] text-white/60">
                    CAMPUS LIFE
                  </div>
                  <h3 className="mt-2 text-lg font-bold text-white">Essential Info</h3>
                </div>
                <div className="space-y-4 rounded-2xl border border-white/15 bg-white/5 p-4">
                  <div>
                    <div className="text-xs font-extrabold tracking-wide text-white/70">SCHOOL HOURS</div>
                    <div className="mt-2 space-y-1 text-[0.85rem] text-white/85">
                      <div>Mon–Fri: 8:00 AM – 5:00 PM</div>
                      <div>Sat: 8:00 AM – 1:00 PM</div>
                      <div className="text-[color:var(--ohs-sky)]">Sun: Closed</div>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-white/15">
                    <div className="text-xs font-extrabold tracking-wide text-white/70">PORTAL ACCESS</div>
                    <Link
                      href="/portal"
                      className="mt-2 inline-flex items-center gap-2 rounded-xl bg-[color:var(--ohs-dark-green)] px-4 py-2.5 font-extrabold text-sm text-white transition hover:opacity-95 active:scale-[0.98] w-full justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><path d="M7 7h10v10H7z" />
                      </svg>
                      Student Portal
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

            <div className="mt-12 border-t border-white/15 pt-8">
              <div className="flex flex-col items-center justify-between gap-3 text-[0.82rem] text-white/60 sm:flex-row sm:gap-4">
                <p>© {new Date().getFullYear()} Okasha High School. All rights reserved.</p>
                <p className="text-white/70">Academic & Islamic Excellence • Mbikko, Uganda</p>
              </div>
            </div>
          </div>
        </footer>

        {/* Premium animations - SAFE FOR SERVER COMPONENTS */}
        <style>{`
          @keyframes slide-up {
            from {
              transform: translateY(40px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          .animate-slide-up {
            animation: slide-up 400ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          /* Prevent background scroll when menu open */
          #mobile-menu:checked ~ * {
            overflow: hidden;
          }
          @media (max-width: 767px) {
            #mobile-menu:checked ~ * {
              position: fixed;
              width: 100%;
            }
          }
        `}</style>
      </body>
    </html>
  );
}