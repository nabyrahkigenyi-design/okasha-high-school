import { PageShell } from "@/components/public/PageShell";

export const revalidate = 3600;

export const metadata = {
  title: "Staff | Okasha High School",
  description: "School leadership and staff (placeholder).",
};

const staff = [
  { name: "Head Teacher (Placeholder)", role: "School Leadership", note: "Bio to be added." },
  { name: "Deputy Head Teacher (Placeholder)", role: "School Leadership", note: "Bio to be added." },
  { name: "Director of Studies (Placeholder)", role: "Academics", note: "Bio to be added." },
  { name: "Islamic Studies Coordinator (Placeholder)", role: "Islamic Theology", note: "Bio to be added." },
];

export default function StaffPage() {
  return (
    <PageShell
      title="Staff"
      subtitle="Placeholder staff list. We will add photos, departments, and official bios."
      watermark
    >
      <div className="grid gap-5 md:grid-cols-2">
        {staff.map((s) => (
          <article key={s.name} className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full border bg-[color:var(--ohs-cream)]" aria-hidden />
              <div>
                <h2 className="font-semibold text-[color:var(--ohs-charcoal)]">{s.name}</h2>
                <p className="text-sm text-slate-600">{s.role}</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-600">{s.note}</p>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
