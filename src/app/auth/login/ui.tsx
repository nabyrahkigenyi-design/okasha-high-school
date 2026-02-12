"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function LoginForm() {
  const sb = supabaseBrowser();
  const sp = useSearchParams();
  const next = sp.get("next") || "/portal";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const { error } = await sb.auth.signInWithPassword({ email, password });

    setPending(false);
    if (error) setError(error.message);
    else window.location.href = next; // full navigation so middleware sees cookies
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block">
        <span className="text-sm">Email</span>
        <input
          className="mt-1 w-full rounded-lg border px-3 py-2"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>

      <label className="block">
        <span className="text-sm">Password</span>
        <input
          className="mt-1 w-full rounded-lg border px-3 py-2"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        disabled={pending}
        className="w-full rounded-lg px-4 py-2 font-medium text-white"
        style={{ background: "var(--ohs-dark-green)" }}
        type="submit"
      >
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
