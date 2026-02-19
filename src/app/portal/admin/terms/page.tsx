import { requireRole } from "@/lib/auth/require-role";

export default async function AdminTermsPage() {
  await requireRole(["admin"]);

  return (
    <div className="rounded-2xl border bg-white p-6">
      <div className="text-xs font-semibold tracking-widest text-slate-500">
        TERMS
      </div>
      <h1 className="mt-2 text-xl font-bold text-[color:var(--ohs-charcoal)]">
        Academic Terms
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Placeholder page. This will manage academic terms (Term I/II/III),
        year, start/end dates, and “current term” selection.
      </p>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {["Term I", "Term II", "Term III"].map((t) => (
          <div key={t} className="rounded-2xl border p-4">
            <div className="font-semibold">{t}</div>
            <p className="mt-1 text-sm text-slate-600">
              Dates, status, grading window (future).
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
