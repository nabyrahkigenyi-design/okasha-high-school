export const revalidate = 3600;

export const metadata = {
  title: "Admissions | Okasha High School",
  description: "Admissions information (placeholder).",
};

export default function AdmissionsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-semibold text-[color:var(--ohs-charcoal)]">Admissions</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border bg-white p-6">
          <h2 className="text-lg font-semibold">Requirements</h2>
          <p className="mt-2 text-sm text-slate-600">Placeholder requirements list.</p>
        </section>
        <section className="rounded-2xl border bg-white p-6">
          <h2 className="text-lg font-semibold">How to Apply</h2>
          <p className="mt-2 text-sm text-slate-600">Placeholder steps + contact.</p>
        </section>
      </div>
    </main>
  );
}
