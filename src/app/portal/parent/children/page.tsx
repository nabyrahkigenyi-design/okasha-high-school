import { requireRole } from "@/lib/auth/require-role";

export default async function ParentChildrenPage() {
  await requireRole(["parent"]);

  return (
    <div className="rounded-2xl border bg-white p-6">
      <div className="text-xs font-semibold tracking-widest text-slate-500">
        CHILDREN
      </div>
      <h1 className="mt-2 text-xl font-bold text-[color:var(--ohs-charcoal)]">
        My Children
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Placeholder page. This will list your linked students and allow you to
        switch between them for attendance/grades views.
      </p>
    </div>
  );
}
