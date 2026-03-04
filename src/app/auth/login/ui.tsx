"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export default function LoginForm() {
  const sb = supabaseBrowser();
  const sp = useSearchParams();
  const next = sp.get("next") || "/portal";

  const [mode, setMode] = useState<"login" | "reset">("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPw, setShowPw] = useState(false);
  const [pending, setPending] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const emailOk = useMemo(() => (email.length === 0 ? true : isValidEmail(email)), [email]);

  async function onSubmitLogin(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;

    setPending(true);
    setError(null);
    setInfo(null);

    const { error } = await sb.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setPending(false);

    if (error) setError(error.message);
    else window.location.href = next; // full navigation so middleware sees cookies
  }

  async function onSubmitReset(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;

    setPending(true);
    setError(null);
    setInfo(null);

    try {
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/reset`
          : undefined;

      const { error } = await sb.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      });

      setPending(false);

      if (error) {
        setError(error.message);
        return;
      }

      setInfo("Password reset email sent. Check your inbox (and spam folder).");
    } catch {
      setPending(false);
      setError("Failed to send reset email. Please try again.");
    }
  }

  return (
    <div className="grid gap-4">
      {/* Mode toggle */}
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-semibold text-slate-900">
          {mode === "login" ? "Sign in" : "Reset password"}
        </div>

        {mode === "reset" ? (
          <button
            type="button"
            className="text-xs font-semibold underline text-slate-700 hover:text-slate-950"
            onClick={() => {
              setMode("login");
              setError(null);
              setInfo(null);
            }}
          >
            Back to login
          </button>
        ) : null}
      </div>

      <form onSubmit={mode === "login" ? onSubmitLogin : onSubmitReset} className="grid gap-4">
        {/* Email */}
        <label className="grid gap-1">
          <span className="text-sm font-medium text-slate-800">Email</span>
          <input
            className={[
              "w-full rounded-xl border bg-white px-3 py-2.5 text-sm",
              "outline-none transition",
              "focus:border-slate-300 focus:ring-4 focus:ring-slate-900/5",
              !emailOk ? "border-red-300" : "border-slate-200",
            ].join(" ")}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-invalid={!emailOk}
          />
          {!emailOk ? (
            <span className="text-xs text-red-600">Please enter a valid email address.</span>
          ) : (
            <span className="text-xs text-slate-500">Use the email provided by the school.</span>
          )}
        </label>

        {/* Password (login only) */}
        {mode === "login" ? (
          <label className="grid gap-1">
            <span className="text-sm font-medium text-slate-800">Password</span>

            <div className="relative">
              <input
                className={[
                  "w-full rounded-xl border bg-white px-3 py-2.5 pr-20 text-sm",
                  "outline-none transition",
                  "focus:border-slate-300 focus:ring-4 focus:ring-slate-900/5",
                  error ? "border-red-300" : "border-slate-200",
                ].join(" ")}
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg border bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-[color:var(--ohs-surface)]"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? "Hide" : "Show"}
              </button>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-slate-500">
                Keep your password private.
              </span>

              <button
                type="button"
                className="text-xs font-semibold underline text-slate-700 hover:text-slate-950"
                onClick={() => {
                  setMode("reset");
                  setError(null);
                  setInfo(null);
                }}
              >
                Forgot password?
              </button>
            </div>
          </label>
        ) : (
          <div className="rounded-xl border bg-white/60 p-3 text-xs text-slate-600">
            We’ll email you a secure reset link. Open it on this device to set a new password.
          </div>
        )}

        {/* Info / Error */}
        {info ? (
          <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
            {info}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {/* Submit */}
        <button
          disabled={pending || !emailOk}
          className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ background: "var(--ohs-dark-green)" }}
          type="submit"
        >
          {pending
            ? mode === "login"
              ? "Signing in..."
              : "Sending..."
            : mode === "login"
            ? "Sign in"
            : "Send reset link"}
        </button>

        {/* Small footer helpers */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
          <span>
            Having trouble? <span className="font-semibold">Contact the school office.</span>
          </span>
          <span className="text-slate-500">
            Redirect: <span className="font-mono">{next}</span>
          </span>
        </div>
      </form>
    </div>
  );
}