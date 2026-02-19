import { requireRole } from "@/lib/auth/require-role";

export default async function AdminClassesPage() {
  await requireRole(["admin"]);

  return (
    <div className="rounded-2xl border bg-white p-6">
      <div className="text-xs font-semibold tracking-widest text-slate-500">
        CLASSES
      </div>

      <h1 className="mt-2 text-xl font-bold text-[color:var(--ohs-charcoal)]">
        Classes & Streams
      </h1>

      <p className="mt-2 text-sm text-slate-600">
        Placeholder page. This will manage classes (S1–S6), streams, class teachers,
        capacity, and track options (secular / islamic).
      </p>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {["S1", "S2", "S3", "S4", "S5", "S6"].map((c) => (
          <div key={c} className="rounded-2xl border p-4">
            <div className="font-semibold text-[color:var(--ohs-charcoal)]">{c}</div>
            <p className="mt-1 text-sm text-slate-600">
              Streams, class teacher, enrollments (future).
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border bg-[color:var(--ohs-surface)] p-4 text-sm text-slate-700">
        Next: CRUD forms + assignments (teacher ↔ subject ↔ class) and student enrollments.
      </div>
    </div>
  );
}
