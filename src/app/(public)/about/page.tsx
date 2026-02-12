export const revalidate = 3600;

export const metadata = {
  title: "About | Okasha High School",
  description: "About Okasha High School (placeholder content).",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-semibold text-[color:var(--ohs-charcoal)]">About</h1>
      <p className="mt-4 max-w-3xl text-slate-600">
        Placeholder content. Add the official background, mission, vision, and values.
      </p>
    </main>
  );
}
