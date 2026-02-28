// src/components/public/PublicHeader.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/programs", label: "Programs" },
  { href: "/admissions", label: "Admissions" },
  { href: "/fees", label: "Fees" },
  { href: "/staff", label: "Staff" },
  { href: "/calendar", label: "Calendar" },
  { href: "/news", label: "News" },
  { href: "/policies", label: "Policies" },
  { href: "/contact", label: "Contact" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function PublicHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll when menu open (better mobile UX)
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const portalLabel = "Portal";
  const motto = useMemo(() => {
    return (
      <>
        <span className="font-medium">EDUCATION IS LIGHT</span>{" "}
        <span className="opacity-80">•</span>{" "}
        <span dir="rtl" className="font-ar">
          العلم نور
        </span>
      </>
    );
  }, []);

  return (
    <header className="sticky top-0 z-50">
      {/* PRE-HEADER (background image + overlay, consistent with footer later) */}
      <div className="relative border-b">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage: "url(/header-bg.jpg)", // placeholder image (add to /public)
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(0px)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(15,23,42,0.72), rgba(15,23,42,0.55), rgba(15,23,42,0.72))",
          }}
        />
        <div className="relative mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-xs text-white">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--ohs-sky)]" />
              Mixed Day & Boarding • Established 1996
            </span>

            <span className="hidden sm:inline">|</span>

            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--ohs-cream)]" />
              Mbikko, Buikwe District — Jinja, Uganda
            </span>
          </div>

          <div className="hidden sm:block">{motto}</div>
        </div>
      </div>

      {/* MAIN HEADER */}
      <div className="border-b bg-white/92 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          {/* LOGO */}
          <Link href="/" className="group flex items-center gap-2">
            <div
              className="h-10 w-10 rounded-2xl border shadow-sm transition-transform duration-200 group-active:scale-[0.98]"
              style={{
                background:
                  "linear-gradient(135deg, var(--ohs-cream), var(--ohs-sky), var(--ohs-cream))",
              }}
            />
            <div className="leading-tight">
              <div className="text-[13px] font-extrabold tracking-wide text-[color:var(--ohs-charcoal)] sm:text-sm">
                OKASHA HIGH SCHOOL
              </div>
              <div className="text-[11px] text-slate-600 sm:text-xs">
                <span className="font-medium">Education is Light</span>{" "}
                <span className="opacity-70">•</span>{" "}
                <span dir="rtl" className="font-ar">
                  العلم نور
                </span>
              </div>
            </div>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((n) => {
              const active = isActive(pathname, n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={[
                    "rounded-xl px-3 py-2 text-sm font-semibold transition",
                    "hover:bg-[color:var(--ohs-surface)] hover:text-slate-950",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/30",
                    active ? "bg-[color:var(--ohs-surface)] text-slate-950" : "text-slate-700",
                  ].join(" ")}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-2">
            {/* Portal (keep previous darker look on desktop) */}
            <Link
              href="/portal"
              className="hidden rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.99] md:inline-flex"
            >
              {portalLabel}
            </Link>

            {/* Mobile Portal button */}
            <Link
              href="/portal"
              className="inline-flex rounded-xl px-3 py-2 text-xs font-semibold text-white shadow-sm transition active:scale-[0.99] md:hidden"
              style={{ background: "var(--ohs-dark-green)" }}
            >
              {portalLabel}
            </Link>

            {/* Mobile menu */}
            <button
              onClick={() => setOpen((v) => !v)}
              className="inline-flex rounded-xl border bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-[color:var(--ohs-surface)] active:scale-[0.99] md:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              {open ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE DRAWER (overlay + slide panel) */}
      {open ? (
        <div className="md:hidden">
          {/* overlay */}
          <button
            aria-label="Close menu overlay"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-black/35"
          />

          {/* panel */}
          <div className="fixed inset-x-0 top-[104px] z-50 max-h-[calc(100vh-104px)] overflow-auto bg-white shadow-2xl">
            <div className="mx-auto max-w-6xl px-4 py-4">
              <div className="rounded-2xl border bg-white p-2">
                <nav className="grid gap-1">
                  {nav.map((n) => {
                    const active = isActive(pathname, n.href);
                    return (
                      <Link
                        key={n.href}
                        href={n.href}
                        className={[
                          "rounded-xl px-4 py-3 text-sm font-semibold transition",
                          "hover:bg-[color:var(--ohs-surface)] active:scale-[0.99]",
                          active
                            ? "bg-[color:var(--ohs-surface)] text-slate-950"
                            : "text-slate-700",
                        ].join(" ")}
                      >
                        {n.label}
                      </Link>
                    );
                  })}
                </nav>

                <div className="mt-3 grid gap-2 p-2">
                  <Link
                    href="/portal"
                    className="rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.99]"
                  >
                    Portal Login
                  </Link>

                  <div className="rounded-xl border bg-[color:var(--ohs-surface)] px-4 py-3 text-xs text-slate-700">
                    <div className="font-semibold tracking-wide text-slate-900">
                      QUICK NOTE
                    </div>
                    <div className="mt-1">
                      For admissions help, visit <span className="font-semibold">Admissions</span> or use{" "}
                      <span className="font-semibold">Contact</span>.
                    </div>
                  </div>
                </div>
              </div>

              {/* little spacing for safe bottom */}
              <div className="h-6" />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}