// src/app/auth/login/page.tsx
import Link from "next/link";
import { Suspense } from "react";
import LoginForm from "./ui";
import { WatermarkedSection } from "@/components/WatermarkedSection";

export const dynamic = "force-dynamic";
export const metadata = { title: "Login | Okasha High School" };

export default function LoginPage() {
  return (
    <WatermarkedSection variant="mixed" patternOpacity={0.05}>
      <main className="mx-auto w-full max-w-screen-lg px-3 sm:px-4 lg:px-6 py-10 sm:py-14">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left: Brand + intro */}
          <section className="portal-surface p-6 sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1 text-xs font-semibold tracking-wide text-slate-700">
              OHS PORTAL
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "var(--ohs-dark-green)" }}
                aria-hidden
              />
              Secure sign-in
            </div>

            <h1 className="mt-4 text-2xl sm:text-3xl font-semibold text-[color:var(--ohs-charcoal)]">
              Welcome back
            </h1>

            <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-prose">
              Sign in to access the Okasha High School portal for students, parents,
              teachers and administrators.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border bg-white/70 p-4">
                <div className="text-sm font-semibold text-slate-900">For Students</div>
                <p className="mt-1 text-xs text-slate-600">
                  View timetable, assignments, grades and announcements.
                </p>
              </div>
              <div className="rounded-2xl border bg-white/70 p-4">
                <div className="text-sm font-semibold text-slate-900">For Parents</div>
                <p className="mt-1 text-xs text-slate-600">
                  Monitor attendance and academic progress.
                </p>
              </div>
              <div className="rounded-2xl border bg-white/70 p-4">
                <div className="text-sm font-semibold text-slate-900">For Teachers</div>
                <p className="mt-1 text-xs text-slate-600">
                  Manage classes, attendance, assignments and grading.
                </p>
              </div>
              <div className="rounded-2xl border bg-white/70 p-4">
                <div className="text-sm font-semibold text-slate-900">For Admins</div>
                <p className="mt-1 text-xs text-slate-600">
                  Control users, academics, content and settings.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <Link className="portal-btn" href="/">
                Back to website
              </Link>
              <span className="text-xs text-slate-500">
                If you don’t have access, contact the school office.
              </span>
            </div>
          </section>

          {/* Right: Login form */}
          <section className="portal-surface p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold tracking-widest text-slate-500">
                  SIGN IN
                </div>
                <h2 className="mt-2 text-xl font-semibold text-[color:var(--ohs-charcoal)]">
                  Portal Login
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Enter your email and password to continue.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border bg-white/70 p-5">
              <Suspense fallback={<div className="text-sm text-slate-600">Loading…</div>}>
                <LoginForm />
              </Suspense>
            </div>

            <div className="mt-4 rounded-xl border bg-white/60 p-3 text-xs text-slate-600">
              Tip: If you were given a temporary password, sign in and change it
              immediately in your account settings (when available).
            </div>
          </section>
        </div>
      </main>
    </WatermarkedSection>
  );
}