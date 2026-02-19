import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { contactLimiter } from "@/lib/rate-limit";

export const runtime = "nodejs";

const Schema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(120),
  phone: z.string().max(40).optional().or(z.literal("")),
  subject: z.string().max(80).optional().or(z.literal("")),
  message: z.string().min(10).max(5000),
  company: z.string().optional(), // honeypot
});

function getClientIp(req: Request) {
  // Vercel / proxies
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  const ri = req.headers.get("x-real-ip");
  return ri ?? "unknown";
}

function clean(s?: string | null) {
  return (s ?? "").toString().trim();
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const { success } = await contactLimiter.limit(ip);

    if (!success) {
      return NextResponse.json(
        { ok: false, error: "Too many requests. Try again later." },
        { status: 429 }
      );
    }

    const json = await req.json();
    const parsed = Schema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid form data." },
        { status: 400 }
      );
    }

    // Honeypot: bots fill hidden fields
    if (parsed.data.company && parsed.data.company.trim().length > 0) {
      return NextResponse.json({ ok: true }); // pretend success
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const to = process.env.CONTACT_TO_EMAIL ?? "info@ohs.ac.ug";
    const from = process.env.MAIL_FROM ?? "Okasha High School <no-reply@ohs.ac.ug>";

    const subjectLine = clean(parsed.data.subject)
      ? `OHS Contact: ${clean(parsed.data.subject)} — ${parsed.data.name}`
      : `OHS Contact Form: ${parsed.data.name}`;

    const phone = clean(parsed.data.phone);

    const text =
      `New message from OHS website contact form\n\n` +
      `Name: ${parsed.data.name}\n` +
      `Email: ${parsed.data.email}\n` +
      (phone ? `Phone: ${phone}\n` : "") +
      (clean(parsed.data.subject) ? `Subject: ${clean(parsed.data.subject)}\n` : "") +
      `IP: ${ip}\n\n` +
      `Message:\n${parsed.data.message}\n`;

    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: parsed.data.email,
      subject: subjectLine,
      text,
    });

    if (error) {
      return NextResponse.json(
        { ok: false, error: "Email delivery failed." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Server error." },
      { status: 500 }
    );
  }
}
