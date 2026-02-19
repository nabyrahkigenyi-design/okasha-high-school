import { requireRole } from "@/lib/auth/require-role";

export default async function StudentAnnouncementsPage() {
  await requireRole(["student"]);

  return (
    <div className="rounded-2xl border bg-white p-6">
      <div className="text-xs font-semibold tracking-widest text-slate-500">
        ANNOUNCEMENTS
      </div>
      <h1 className="mt-2 text-xl font-bold text-[color:var(--ohs-charcoal)]">
        Announcements
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Placeholder page. Admin and teacher announcements will appear here for students.
      </p>
    </div>
  );
}
