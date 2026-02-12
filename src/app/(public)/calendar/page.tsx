import { PageShell } from "@/components/public/PageShell";

export const revalidate = 3600;

export const metadata = {
  title: "Calendar | Okasha High School",
  description: "Academic calendar and key dates (placeholder).",
};

const events = [
  { date: "TBD", title: "Term Opens (Placeholder)", note: "Replace with real dates." },
  { date: "TBD", title: "Mid-term Break (Placeholder)", note: "Replace with real dates." },
  { date: "TBD", title: "Term Ends (Placeholder)", note: "Replace with real dates." },
];

export default function CalendarPage() {
  return (
    <PageShell
      title="Calendar"
      subtitle="Placeholder calendar. Later we will power this from the database and show current term events."
    >
      <div className="overflow-hidden rounded-2xl border bg-white">
        <div className="grid grid-cols-3 border-b bg-[color:var(--ohs-surface)] px-5 py-3 text-sm font-medium text-slate-700">
          <div>Date</div>
          <div className="col-span-2">Event</div>
        </div>

        <ul>
          {events.map((e, idx) => (
            <li key={idx} className="grid grid-cols-3 px-5 py-4 text-sm border-b last:border-b-0">
              <div className="text-slate-600">{e.date}</div>
              <div className="col-span-2">
                <div className="font-medium text-[color:var(--ohs-charcoal)]">{e.title}</div>
                <div className="text-slate-600">{e.note}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </PageShell>
  );
}
