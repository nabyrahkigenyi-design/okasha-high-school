// src/components/public/PublicHeader.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { useLang } from "./i18n";

const nav = [
  { href: "/", en: "Home", ar: "الرئيسية" },
  { href: "/about", en: "About", ar: "عن المدرسة" },
  { href: "/programs", en: "Programs", ar: "البرامج" },
  { href: "/admissions", en: "Admissions", ar: "القبول" },
  { href: "/fees", en: "Fees", ar: "الرسوم" },
  { href: "/staff", en: "Staff", ar: "الطاقم" },
  { href: "/news", en: "News", ar: "الأخبار" },
  { href: "/contact", en: "Contact", ar: "اتصل بنا" },
];

export default function PublicHeader() {
  const { lang, setLang, dir } = useLang();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div
            className="h-9 w-9 rounded-xl border"
            style={{
              background:
                "linear-gradient(135deg, var(--ohs-cream), var(--ohs-sky), var(--ohs-pale-green), var(--ohs-dark-green))",
            }}
          />
          <div className="leading-tight">
            <div className="text-sm font-semibold text-[color:var(--ohs-charcoal)]">Okasha High School</div>
            <div className="text-xs text-slate-600">{lang === "ar" ? "العلم نور" : "Education is Light"}</div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {/* Desktop nav */}
          <nav className="hidden items-center gap-5 text-sm md:flex">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="text-slate-700 hover:text-slate-900">
                {lang === "ar" ? n.ar : n.en}
              </Link>
            ))}
          </nav>

          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            className="rounded-xl border bg-white px-3 py-2 text-xs font-medium"
            aria-label="Toggle language"
          >
            {lang === "en" ? "AR" : "EN"}
          </button>

          <Link
            href="/portal"
            className="hidden rounded-xl px-4 py-2 text-sm font-medium text-white md:inline-flex"
            style={{ background: "var(--ohs-dark-green)" }}
          >
            {lang === "ar" ? "بوابة المدرسة" : "Portal"}
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex rounded-xl border bg-white px-3 py-2 text-sm md:hidden"
            aria-label="Open menu"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open ? (
        <div className="border-t bg-white md:hidden" dir={dir}>
          <nav className="mx-auto grid max-w-6xl gap-1 px-4 py-3 text-sm">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2 hover:bg-[color:var(--ohs-surface)]"
              >
                {lang === "ar" ? n.ar : n.en}
              </Link>
            ))}
            <Link
              href="/portal"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-xl px-3 py-2 text-center font-medium text-white"
              style={{ background: "var(--ohs-dark-green)" }}
            >
              {lang === "ar" ? "تسجيل الدخول" : "Portal Login"}
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
