import { PageShell } from "@/components/public/PageShell";

export const revalidate = 3600;

export const metadata = {
  title: "Policies | Okasha High School",
  description: "School policies (placeholder).",
};

const policies = [
  { title: "Code of Conduct", note: "Placeholder summary. Add PDF later." },
  { title: "Attendance Policy", note: "Placeholder summary. Add details later." },
  { title: "Uniform Policy", note: "Placeholder summary. Add details later." },
  { title: "Safeguarding / Child Protection", note: "Placeholder summary. Add details later." },
];

export default function PoliciesPage() {
  return (
    <PageShell title="Policies" subtitle="Placeholder list. Later you can attach PDFs stored in R2 and served via CDN.">
      <div className="grid gap-4">
        {policies.map((p) => (
          <section key={p.title} className="rounded-2xl border bg-white p-6">
            <h2 className="font-semibold text-[color:var(--ohs-charcoal)]">{p.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{p.note}</p>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
