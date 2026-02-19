import { requireRole } from "@/lib/auth/require-role";

export default async function TeacherGradingPage() {
  await requireRole(["teacher"]);

  return (
    <div className="rounded-2xl border bg-white p-6">
      <div className="text-xs font-semibold tracking-widest text-slate-500">
        GRADING
      </div>
      <h1 className="mt-2 text-xl font-bold text-[color:var(--ohs-charcoal)]">
        Enter & Update Grades
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Placeholder page. This will allow you to select a class, choose a subject,
        and enter grades. Students/parents will see updates immediately on refresh.
      </p>

      <div className="mt-6 rounded-2xl border bg-[color:var(--ohs-surface)] p-4 text-sm text-slate-700">
        Next: add term selector, assessment type (test/exam/assignment), and grade entry table.
      </div>
    </div>
  );
}
