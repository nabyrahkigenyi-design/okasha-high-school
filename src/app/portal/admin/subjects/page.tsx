import { requireRole } from "@/lib/auth/require-role";

export default async function AdminSubjectsPage() {
  await requireRole(["admin"]);

  return (
    <div className="rounded-2xl border bg-white p-6">
      <div className="text-xs font-semibold tracking-widest text-slate-500">
        SUBJECTS
      </div>
      <h1 className="mt-2 text-xl font-bold text-[color:var(--ohs-charcoal)]">
        Subjects
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Placeholder page. This will allow admins to create/edit subjects and
        connect them to tracks (secular / islamic), classes, and teachers.
      </p>

      <div className="mt-6 rounded-2xl border bg-[color:var(--ohs-surface)] p-4 text-sm text-slate-700">
        Next: build CRUD forms similar to News/Staff and write actions/queries
        to manage <code className="px-1">subjects</code>.
      </div>
    </div>
  );
}
