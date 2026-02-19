"use client";

import { useMemo, useState } from "react";

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [err, setErr] = useState<string | null>(null);

  const isSending = status === "sending";
  const disabled = isSending;

  const buttonText = useMemo(() => {
    if (status === "sending") return "Sending...";
    if (status === "sent") return "Sent ✓";
    return "Send message";
  }, [status]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setErr(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""), // optional (API can ignore for now)
      subject: String(form.get("subject") ?? ""), // optional
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
    setErr(data?.error ?? "Failed to send. Please try again or call the office.");
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 grid gap-4">
      {/* Honeypot field (hidden) */}
      <input
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />

      {/* Status panels */}
      {status === "sent" ? (
        <div
          className="rounded-2xl border p-4 text-sm"
          style={{ background: "var(--ohs-cream)" }}
          role="status"
        >
          <div className="font-semibold text-slate-900">Message sent</div>
          <p className="mt-1 text-slate-700">
            Thank you. We’ll respond as soon as possible during working hours.
          </p>
          <p className="mt-2 text-slate-700" dir="rtl">
            تم إرسال رسالتك بنجاح — سنرد عليكم في أقرب وقت ممكن.
          </p>
        </div>
      ) : null}

      {status === "error" ? (
        <div className="rounded-2xl border bg-white p-4 text-sm" role="alert">
          <div className="font-semibold text-red-700">Could not send</div>
          <p className="mt-1 text-slate-700">{err}</p>
          <p className="mt-2 text-slate-600">
            Tip: You can also call admissions:{" "}
            <a className="underline" href="tel:+256740235451">
              0740235451
            </a>
          </p>
        </div>
      ) : null}

      {/* Name */}
      <label className="grid gap-1">
        <span className="text-sm font-semibold text-slate-800">Full name</span>
        <input
          className="rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
          name="name"
          placeholder="e.g. Amina K."
          required
          minLength={2}
          disabled={disabled}
        />
        <span className="text-xs text-slate-500">Please use your real name for follow-up.</span>
      </label>

      {/* Email + Phone */}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1">
          <span className="text-sm font-semibold text-slate-800">Email</span>
          <input
            className="rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
            name="email"
            placeholder="name@example.com"
            type="email"
            required
            disabled={disabled}
          />
          <span className="text-xs text-slate-500">We reply to this email address.</span>
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-semibold text-slate-800">Phone (optional)</span>
          <input
            className="rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
            name="phone"
            placeholder="e.g. 07xx xxx xxx"
            inputMode="tel"
            disabled={disabled}
          />
          <span className="text-xs text-slate-500">If you prefer a call back.</span>
        </label>
      </div>

      {/* Subject */}
      <label className="grid gap-1">
        <span className="text-sm font-semibold text-slate-800">Subject</span>
        <select
          className="rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
          name="subject"
          defaultValue="Admissions"
          disabled={disabled}
        >
          <option>Admissions</option>
          <option>Fees & Payments</option>
          <option>Academic Programs</option>
          <option>Boarding / Welfare</option>
          <option>General Enquiry</option>
        </select>
        <span className="text-xs text-slate-500">
          Choose the closest topic so we route your message quickly.
        </span>
      </label>

      {/* Message */}
      <label className="grid gap-1">
        <span className="text-sm font-semibold text-slate-800">Message</span>
        <textarea
          className="min-h-[160px] rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
          name="message"
          placeholder="Write your message here… (Include class level, day/boarding, and contact details)"
          required
          minLength={10}
          disabled={disabled}
        />
        <span className="text-xs text-slate-500">
          Tip: Add the intended class (S1–S6) and whether you prefer Day or Boarding.
        </span>
      </label>

      {/* Submit */}
      <button
        disabled={disabled}
        className="rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
        style={{ background: "var(--ohs-dark-green)" }}
        type="submit"
      >
        {buttonText}
      </button>

      {/* Small note */}
      <p className="text-xs text-slate-500">
        By sending this message, you agree to be contacted by the school office regarding your enquiry.
      </p>
    </form>
  );
}
