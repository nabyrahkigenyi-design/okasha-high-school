"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

function strongEnough(pw: string) {
  return pw.length >= 8;
}

export default function ResetPasswordForm() {
  const sb = supabaseBrowser();

  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [pending, setPending] = useState(false);

  const [ready, setReady] = useState<boolean>(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ok = useMemo(() => strongEnough(pw1) && pw1 === pw2, [pw1, pw2]);

  // Supabase recovery links usually establish a session automatically in the browser.
  // We just check that a session exists; if not, we show a helpful message.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await sb.auth.getSession();
      if (cancelled) return;
      setReady(!!data.session);
    })();
    return () => {
      cancelled = true;
    };
  }, [sb]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;

    setPending(true);
    setError(null);
    setInfo(null);

    const { data } = await sb.auth.getSession();
    if (!data.session) {
      setPending(false);
      setError("Reset session not found. Please open the reset link from your email again.");
      return;
    }

    const { error } = await sb.auth.updateUser({ password: pw1 });

    setPending(false);
    if (error) {
      setError(error.message);
      return;
    }

    setInfo("Password updated. You can now sign in with your new password.");
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      {!ready ? (
        <div className="rounded-xl border bg-white/60 p-3 text-sm text-slate-700">
          Opened from email? If you don’t see the form working, go back and open the reset link again.
        </div>
      ) : null}

      <label className="grid gap-1">
        <span className="text-sm font-medium text-slate-800">New password</span>
        <input
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-900/5"
          type="password"
          autoComplete="new-password"
          value={pw1}
          onChange={(e) => setPw1(e.target.value)}
          required
          placeholder="At least 8 characters"
        />
        <span className="text-xs text-slate-500">Minimum 8 characters.</span>
      </label>

      <label className="grid gap-1">
        <span className="text-sm font-medium text-slate-800">Confirm password</span>
        <input
          className={[
            "w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-900/5",
            pw2.length > 0 && pw1 !== pw2 ? "border-red-300" : "border-slate-200",
          ].join(" ")}
          type="password"
          autoComplete="new-password"
          value={pw2}
          onChange={(e) => setPw2(e.target.value)}
          required
        />
        {pw2.length > 0 && pw1 !== pw2 ? (
          <span className="text-xs text-red-600">Passwords do not match.</span>
        ) : null}
      </label>

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

      <button
        disabled={pending || !ok}
        className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ background: "var(--ohs-dark-green)" }}
        type="submit"
      >
        {pending ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}