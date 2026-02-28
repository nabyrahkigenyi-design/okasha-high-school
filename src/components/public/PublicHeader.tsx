"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

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

export default function PublicHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const items = useMemo(
    () =>
      [
        ["About", "/about"],
        ["Admissions", "/admissions"],
        ["Programs", "/programs"],
        ["Staff", "/staff"],
        ["Calendar", "/calendar"],
        ["News", "/news"],
        ["Fees", "/fees"],
        ["Policies", "/policies"],
        ["Contact", "/contact"],
      ] as const,
    []
  );

  // Auto-close when route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Escape key closes menu
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* HEADER BAR */}
      <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          {/* Logo (kept same as you had) */}
          <Link href="/" className="flex items-center gap-3 active:scale-[0.99] transition">
            <div
              className="h-10 w-10 rounded-2xl border-2 border-[color:var(--ohs-sky)] shadow-md"
              style={{
                background:
                  "linear-gradient(135deg, var(--ohs-cream) 25%, var(--ohs-sky) 65%, #ffffff 100%)",
                boxShadow: "0 4px 12px rgba(102, 183, 230, 0.25)",
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
                    fontFamily: "var(--font-ar-quran), serif",
                    fontSize: "0.85rem",
                    fontWeight: 400,
                    letterSpacing: "0.04em",
                    lineHeight: "1.4",
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

          {/* Mobile actions */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/portal"
              className="rounded-full bg-gradient-to-r from-[color:var(--ohs-dark-green)] to-[color:var(--ohs-charcoal)] px-4 py-2 text-xs font-extrabold text-white shadow-sm transition active:scale-[0.98]"
            >
              Portal
            </Link>

            {/* NO BOX: icons outside the box */}
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
              className="inline-flex items-center justify-center rounded-full p-2 text-slate-900 transition active:scale-[0.96] focus:outline-none focus:ring-2 focus:ring-[color:var(--ohs-sky)] focus:ring-offset-2"
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* FULL SCREEN MOBILE MENU (premium animation) */}
      <div
        className={[
          "fixed inset-0 z-[60] md:hidden",
          open ? "pointer-events-auto" : "pointer-events-none",
        ].join(" ")}
      >
        {/* Backdrop */}
        <div
          onClick={() => setOpen(false)}
          className={[
            "absolute inset-0 bg-black/40 backdrop-blur-[2px]",
            "transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0",
          ].join(" ")}
        />

        {/* Panel */}
        <div
          className={[
            "absolute inset-0 bg-white",
            "transition-[opacity,transform] duration-300",
            "ease-[cubic-bezier(0.16,1,0.3,1)]",
            open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
          ].join(" ")}
          style={{ boxShadow: "0 20px 80px rgba(0,0,0,0.28)" }}
        >
          {/* Top bar inside overlay */}
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div className="text-sm font-extrabold tracking-wide text-slate-900">
              NAVIGATION
            </div>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center rounded-full p-2 text-slate-900 transition active:scale-[0.96] focus:outline-none focus:ring-2 focus:ring-[color:var(--ohs-sky)] focus:ring-offset-2"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Links */}
          <div className="px-5 py-5">
            <div className="grid gap-2">
              {items.map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)} // close immediately on tap
                  className={[
                    "group flex items-center justify-between",
                    "rounded-2xl border border-slate-200 bg-white",
                    "px-4 py-4 text-base font-semibold text-slate-900",
                    "shadow-sm transition active:scale-[0.99]",
                    "hover:border-slate-300 hover:shadow-md",
                  ].join(" ")}
                >
                  <span>{label}</span>
                  <span className="text-slate-400 transition group-hover:text-[color:var(--ohs-sky)]">
                    →
                  </span>
                </Link>
              ))}
            </div>

            <div className="mt-6">
              <Link
                href="/portal"
                onClick={() => setOpen(false)}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[color:var(--ohs-dark-green)] to-[color:var(--ohs-charcoal)] px-5 py-4 text-base font-extrabold text-white shadow-lg transition active:scale-[0.99]"
              >
                Go to Portal
              </Link>
            </div>

            <div className="mt-6 text-center text-xs text-slate-500">
              Tap outside or press <span className="font-semibold">Esc</span> to close
            </div>
          </div>
        </div>
      </div>
    </>
  );
}