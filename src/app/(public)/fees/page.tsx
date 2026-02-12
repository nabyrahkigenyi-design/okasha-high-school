export const revalidate = 3600;

export const metadata = {
  title: "Tuition & Fees | Okasha High School",
  description: "Fees and payment info (placeholder).",
};

export default function FeesPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-semibold text-[color:var(--ohs-charcoal)]">Tuition & Fees</h1>
      <p className="mt-4 max-w-3xl text-slate-600">
        Placeholder: termly fees, what is included, payment methods, contacts.
      </p>
    </main>
  );
}
