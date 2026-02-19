import { requireRole } from "@/lib/auth/require-role";

export default async function AdminSettingsPage() {
  await requireRole(["admin"]);

  return (
    <div className="rounded-2xl border bg-white p-6">
      <div className="text-xs font-semibold tracking-widest text-slate-500">
        SETTINGS
      </div>
      <h1 className="mt-2 text-xl font-bold text-[color:var(--ohs-charcoal)]">
        School Settings
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Placeholder page. This will manage global school settings (logo, contacts,
        portal options, grading policies, term defaults, uploads/CDN config, etc.).
      </p>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border p-4">
          <div className="font-semibold">Branding</div>
          <p className="mt-1 text-sm text-slate-600">
            Logo, colors, watermark, header/footer content.
          </p>
        </div>
        <div className="rounded-2xl border p-4">
          <div className="font-semibold">Academic Defaults</div>
          <p className="mt-1 text-sm text-slate-600">
            Terms, grading scale, report settings.
          </p>
        </div>
      </div>
    </div>
  );
}
