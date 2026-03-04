import Link from "next/link";
import { WatermarkedSection } from "@/components/WatermarkedSection";
import { requireRole } from "@/lib/auth/require-role";

function Card({
  title,
  desc,
  href,
  badge,
}: {
  title: string;
  desc: string;
  href?: string;
  badge?: string;
}) {
  const inner = (
    <div className="rounded-2xl border bg-white/70 p-5 transition hover:bg-white">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-base font-semibold text-slate-900">{title}</div>
          <p className="mt-1 text-sm text-slate-600">{desc}</p>
        </div>
        {badge ? <span className="portal-badge">{badge}</span> : null}
      </div>
      {href ? (
        <div className="mt-4">
          <span className="text-sm underline text-slate-700 hover:text-slate-950">
            Open
          </span>
        </div>
      ) : (
        <div className="mt-4 text-xs text-slate-500">Coming soon</div>
      )}
    </div>
  );

  return href ? (
    <Link className="block" href={href}>
      {inner}
    </Link>
  ) : (
    inner
  );
}

export default async function AdminSettingsPage() {
  await requireRole(["admin"]);

  return (
    <WatermarkedSection tone="portal" variant="mixed">
      <div className="grid gap-6">
        {/* Header */}
        <section className="portal-surface p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold tracking-widest text-slate-500">
                SETTINGS
              </div>
              <h1 className="mt-2 portal-title">School Settings</h1>
              <p className="mt-2 portal-subtitle">
                Configure global school information and platform defaults. This page is UI-ready and can be wired to database settings later.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link className="portal-btn" href="/portal/admin/dashboard">
                Back to dashboard
              </Link>
            </div>
          </div>

          {/* Quick summary cards */}
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border bg-white/70 p-4">
              <div className="text-sm font-semibold text-slate-900">Brand identity</div>
              <div className="mt-1 text-xs text-slate-600">
                Colors, watermark style, logo, header/footer.
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="portal-badge">Cream</span>
                <span className="portal-badge">Sky</span>
                <span className="portal-badge">Pale Green</span>
                <span className="portal-badge">Dark Green</span>
              </div>
            </div>

            <div className="rounded-2xl border bg-white/70 p-4">
              <div className="text-sm font-semibold text-slate-900">Portal defaults</div>
              <div className="mt-1 text-xs text-slate-600">
                Role rules, portal links, announcements behavior.
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="portal-badge">Admin</span>
                <span className="portal-badge">Teacher</span>
                <span className="portal-badge">Parent</span>
                <span className="portal-badge">Student</span>
              </div>
            </div>

            <div className="rounded-2xl border bg-white/70 p-4">
              <div className="text-sm font-semibold text-slate-900">Academics</div>
              <div className="mt-1 text-xs text-slate-600">
                Terms, grading, report rules, track settings.
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="portal-badge portal-badge-secular">Secular</span>
                <span className="portal-badge portal-badge-islamic">Islamic</span>
              </div>
            </div>
          </div>
        </section>

        {/* Settings grid */}
        <section className="portal-surface p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Configuration</h2>
              <p className="mt-1 text-sm text-slate-600">
                These sections will become editable as we connect settings to the database.
              </p>
            </div>
            <span className="portal-badge">Admin only</span>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <Card
              title="Branding"
              desc="Logo, site title, watermark style, homepage hero defaults, public header/footer content."
              badge="UI ready"
            />
            <Card
              title="Contact & Address"
              desc="Phone, email, location, maps link, office hours, contact form destination."
              badge="UI ready"
            />
            <Card
              title="Academic Defaults"
              desc="Default term selection, grading scale, promotion rules, report card settings."
              badge="UI ready"
            />
            <Card
              title="Portal Options"
              desc="Announcements visibility rules, student dashboard widgets, parent monitoring options."
              badge="UI ready"
            />
            <Card
              title="Uploads & CDN"
              desc="Upload limits, allowed file types, storage folders, CDN URLs (R2), PDF defaults."
              badge="UI ready"
            />
            <Card
              title="Security & Access"
              desc="RBAC policies, password resets, session rules, rate limiting and auditing defaults."
              badge="UI ready"
            />
          </div>

          <div className="mt-5 rounded-2xl border bg-white/70 p-4 text-sm text-slate-700">
            <div className="font-semibold text-slate-900">Next implementation step</div>
            <p className="mt-1 text-sm text-slate-600">
              When you’re ready, we will create a <span className="font-mono">school_settings</span> table (key/value or typed columns)
              and wire this page using server actions + Zod, with strong admin-only permissions.
            </p>
          </div>
        </section>
      </div>
    </WatermarkedSection>
  );
}