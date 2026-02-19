// src/app/layout.tsx
import "./globals.css";
import Link from "next/link";
import { Cairo, Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const cairo = Cairo({ subsets: ["arabic"], variable: "--font-ar" });

export const metadata = {
  metadataBase: new URL("https://okashahighschool.com"),
};

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="nav-pill tap-press">
      <span className="link-soft">{children}</span>
    </Link>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${cairo.variable} scroll-smooth`}>
      <body className="min-h-screen bg-[color:var(--ohs-surface)] text-slate-900 font-sans">
    
        {/* PRE-HEADER */}
<div
  className="bg-image-overlay border-b text-white"
  style={{
    backgroundImage: "url('/footer-bg.jpg')",
  }}
>
  <div className="mx-auto max-w-6xl px-4 py-3">
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs">
      <div className="flex flex-wrap items-center gap-3">
        <span>
          Director:{" "}
          <a className="underline hover:text-[color:var(--ohs-sky)] transition" href="tel:+256702444301">
            0702444301
          </a>
        </span>

        <span>
          Admissions:{" "}
          <a className="underline hover:text-[color:var(--ohs-sky)] transition" href="tel:+256740235451">
            0740235451
          </a>
        </span>

        <span>Mbikko • Buikwe • Jinja</span>
      </div>

      <div className="font-ar" dir="rtl">
        أهلاً وسهلاً بكم
      </div>
    </div>
  </div>
</div>



        {/* HEADER */}
        <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 tap-press">
              <div
                className="h-9 w-9 rounded-xl border"
                style={{
                  background:
                    "linear-gradient(135deg, var(--ohs-cream), var(--ohs-sky), var(--ohs-pale-green), var(--ohs-dark-green))",
                }}
              />
              <div className="leading-tight">
                <div className="text-sm font-extrabold tracking-tight text-[color:var(--ohs-charcoal)]">
                  OKASHA <span className="heading-accent">HIGH SCHOOL</span>
                </div>
                <div className="text-xs text-slate-600">
                  Education is Light • <span className="font-ar">العلم نور</span>
                </div>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden items-center gap-2 text-sm md:flex">
              <NavLink href="/about">About</NavLink>
              <NavLink href="/admissions">Admissions</NavLink>
              <NavLink href="/programs">Programs</NavLink>
              <NavLink href="/staff">Staff</NavLink>
              <NavLink href="/calendar">Calendar</NavLink>
              <NavLink href="/news">News</NavLink>
              <NavLink href="/fees">Fees</NavLink>
              <NavLink href="/policies">Policies</NavLink>
              <NavLink href="/contact">Contact</NavLink>

              <Link href="/portal" className="portal-cta tap-press ml-1">
                Portal
              </Link>
            </nav>

            {/* Mobile: Portal + Menu */}
            <div className="flex items-center gap-2 md:hidden">
              <Link
                href="/portal"
                className="rounded-full px-4 py-2 text-xs font-extrabold text-white tap-press"
                style={{ background: "var(--ohs-dark-green)" }}
              >
                Portal
              </Link>

              <details className="relative">
                <summary className="list-none cursor-pointer rounded-full border bg-white px-4 py-2 text-sm tap-press">
                  ☰
                </summary>
                <div className="absolute right-0 mt-2 w-64 rounded-3xl border bg-white p-2 shadow-lg">
                  <div className="grid gap-1 text-sm">
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
                        className="rounded-2xl px-4 py-3 hover:bg-[color:var(--ohs-surface)] tap-press link-soft"
                        href={href}
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

        {/* FOOTER (advanced, dull background + unique shapes) */}
        {/* FOOTER */}
<footer
  className="bg-image-overlay text-white"
  style={{
    backgroundImage: "url('/footer-bg.jpg')",
  }}
>
  <div className="mx-auto max-w-6xl px-4 py-16">
    <div className="grid gap-12 md:grid-cols-3">
      {/* Column 1 */}
      <div>
        <div className="heading-kicker text-white/70">
          OKASHA HIGH SCHOOL
        </div>

        <h2 className="mt-2 text-2xl font-extrabold tracking-tight">
          EDUCATION IS{" "}
          <span className="text-[color:var(--ohs-sky)]">LIGHT</span>
        </h2>

        <p className="mt-4 text-sm text-white/90 max-w-md">
          Mixed day and boarding secondary school established in 1996,
          integrating the national curriculum with Islamic theology
          to nurture disciplined and responsible learners.
        </p>

        <p className="mt-3 text-sm font-ar text-white/90" dir="rtl">
          مدرسة أوكاشا الثانوية — تربية متوازنة تجمع بين التفوق الأكاديمي والقيم الإسلامية.
        </p>
      </div>

      {/* Column 2 */}
      <div>
        <div className="heading-kicker text-white/70">
          CONTACT
        </div>

        <ul className="mt-4 space-y-3 text-sm text-white/90">
          <li>
            Director:{" "}
            <a className="underline hover:text-[color:var(--ohs-sky)] transition" href="tel:+256702444301">
              0702444301
            </a>
          </li>
          <li>
            Admissions:{" "}
            <a className="underline hover:text-[color:var(--ohs-sky)] transition" href="tel:+256740235451">
              0740235451
            </a>
          </li>
          <li>Mbikko, Buikwe District</li>
          <li>Jinja, Uganda</li>
          <li>Office Hours: Mon–Sat • 8:00–17:00</li>
        </ul>
      </div>

      {/* Column 3 */}
      <div>
        <div className="heading-kicker text-white/70">
          QUICK LINKS
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          {[
            ["About", "/about"],
            ["Admissions", "/admissions"],
            ["Programs", "/programs"],
            ["Fees", "/fees"],
            ["Policies", "/policies"],
            ["Calendar", "/calendar"],
            ["News", "/news"],
            ["Contact", "/contact"],
          ].map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="hover:text-[color:var(--ohs-sky)] transition"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>

    {/* Bottom line */}
    <div className="mt-12 border-t border-white/20 pt-6 text-xs text-white/70 flex flex-col gap-2 sm:flex-row sm:justify-between">
      <p>© {new Date().getFullYear()} Okasha High School</p>
      <p>Established 1996 • Academic & Islamic Excellence</p>
    </div>
  </div>
</footer>



      </body>
    </html>
  );
}
