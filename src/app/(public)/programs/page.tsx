export const revalidate = 3600;

export const metadata = {
  title: "Programs | Okasha High School",
  description: "Academic programs split by track (placeholder).",
};

export default function ProgramsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-semibold text-[color:var(--ohs-charcoal)]">Programs</h1>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border bg-white p-6">
          <h2 className="text-lg font-semibold">National Curriculum</h2>
          <p className="mt-2 text-sm text-slate-600">
            Placeholder: subjects, assessment, UNEB focus, co-curricular.
          </p>
        </section>

        <section className="rounded-2xl border bg-white p-6">
          <h2 className="text-lg font-semibold">Islamic Theology</h2>
          <p className="mt-2 text-sm text-slate-600">
            Placeholder: modules, levels, approach, integration.
          </p>
        </section>
      </div>
    </main>
  );
}
