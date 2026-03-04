// src/app/auth/reset/page.tsx
import Link from "next/link";
import { WatermarkedSection } from "@/components/WatermarkedSection";
import ResetPasswordForm from "./ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Reset Password | Okasha High School" };

export default function ResetPasswordPage() {
  return (
    <WatermarkedSection variant="mixed" patternOpacity={0.05}>
      <main className="mx-auto w-full max-w-md px-3 sm:px-4 py-10 sm:py-14">
        <section className="portal-surface p-6 sm:p-8">
          <div className="text-xs font-semibold tracking-widest text-slate-500">
            PASSWORD RESET
          </div>
          <h1 className="mt-2 text-xl font-semibold text-[color:var(--ohs-charcoal)]">
            Set a new password
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Enter a new password for your account.
          </p>

          <div className="mt-5 rounded-2xl border bg-white/70 p-5">
            <ResetPasswordForm />
          </div>

          <div className="mt-4">
            <Link className="text-sm underline text-slate-700 hover:text-slate-950" href="/auth/login">
              Back to login
            </Link>
          </div>
        </section>
      </main>
    </WatermarkedSection>
  );
}