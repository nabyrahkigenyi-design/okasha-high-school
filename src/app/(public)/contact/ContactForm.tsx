"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setErr(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      message: String(form.get("message") ?? ""),
      company: String(form.get("company") ?? ""), // honeypot
    };

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data?.ok) {
      setStatus("sent");
      (e.target as HTMLFormElement).reset();
      return;
    }

    setStatus("error");
    setErr(data?.error ?? "Failed to send.");
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 grid gap-3">
      {/* Honeypot field (hidden) */}
      <input
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />

      <input
        className="rounded-lg border px-3 py-2"
        name="name"
        placeholder="Your name"
        required
        minLength={2}
      />
      <input
        className="rounded-lg border px-3 py-2"
        name="email"
        placeholder="Your email"
        type="email"
        required
      />
      <textarea
        className="min-h-[140px] rounded-lg border px-3 py-2"
        name="message"
        placeholder="Message"
        required
        minLength={10}
      />

      {status === "sent" ? (
        <p className="text-sm text-green-700">Message sent.</p>
      ) : null}

      {status === "error" ? (
        <p className="text-sm text-red-600">{err}</p>
      ) : null}

      <button
        disabled={status === "sending"}
        className="rounded-xl px-4 py-2 font-medium text-white disabled:opacity-60"
        style={{ background: "var(--ohs-dark-green)" }}
        type="submit"
      >
        {status === "sending" ? "Sending..." : "Send"}
      </button>
    </form>
  );
}
