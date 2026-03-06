import Link from "next/link";
import { ToastGate } from "@/components/ToastGate";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import { addParentStudentLink, removeParentStudentLink } from "./actions";
import { listLinks, searchParents, searchStudents } from "./queries";
import { requireRole } from "@/lib/rbac";

export default async function AdminParentLinksPage({
  searchParams,
}: {
  searchParams: Promise<{ parentId?: string; qParent?: string; qStudent?: string; ok?: string; err?: string }>;
}) {
  await requireRole(["admin"]);
  const params = await searchParams;

  const parentId = params.parentId ?? "";
  const qParent = (params.qParent ?? "").trim();
  const qStudent = (params.qStudent ?? "").trim();

  const parents = await searchParents(qParent);
  const students = await searchStudents(qStudent);
  const links = parentId ? await listLinks(parentId) : [];

  const selectedParent = parentId ? parents.find((p: any) => p.id === parentId) : null;

  return (
    <div className="grid gap-6">
      <ToastGate ok={params.ok} err={params.err} okText="Link saved." />

      <section className="portal-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="portal-title">Parent Links</h1>
            <p className="portal-subtitle">Link parent accounts to their children (students).</p>
          </div>
          <Link className="portal-btn" href="/portal/admin/users">
            Back to Users
          </Link>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border bg-white/70 p-4">
            <div className="text-sm font-semibold">Find parent</div>
            <form method="get" className="mt-2 flex gap-2">
              <input className="portal-input" name="qParent" placeholder="Search parent name…" defaultValue={qParent} />
              <button className="portal-btn" type="submit">
                Search
              </button>
            </form>

            <div className="mt-3 divide-y rounded-xl border bg-white/70">
              {parents.map((p: any) => (
                <Link
                  key={p.id}
                  className="block px-3 py-2 hover:bg-[color:var(--ohs-surface)]"
                  href={`/portal/admin/parent-links?parentId=${p.id}&qParent=${encodeURIComponent(qParent)}&qStudent=${encodeURIComponent(qStudent)}`}
                >
                  <div className="font-medium">{p.full_name ?? p.id}</div>
                  <div className="text-xs text-slate-500">{p.id}</div>
                </Link>
              ))}
              {parents.length === 0 ? <div className="px-3 py-4 text-sm portal-muted">No parents found.</div> : null}
            </div>
          </div>

          <div className="rounded-2xl border bg-white/70 p-4">
            <div className="text-sm font-semibold">Find student</div>
            <form method="get" className="mt-2 flex gap-2">
              <input type="hidden" name="parentId" value={parentId} />
              <input className="portal-input" name="qStudent" placeholder="Search student name or admission no…" defaultValue={qStudent} />
              <button className="portal-btn" type="submit">
                Search
              </button>
            </form>

            {parentId ? (
              <form action={addParentStudentLink} className="mt-3 grid gap-2">
                <input type="hidden" name="parent_id" value={parentId} />
                <label className="grid gap-1">
                  <span className="text-sm">Select student to link</span>
                  <select className="portal-select" name="student_id" defaultValue={students[0]?.id ?? ""}>
                    {students.map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.full_name} {s.admission_no ? `(${s.admission_no})` : ""}
                      </option>
                    ))}
                  </select>
                </label>
                <button className="portal-btn portal-btn-primary w-fit" type="submit">
                  Link student
                </button>
              </form>
            ) : (
              <div className="mt-3 text-sm portal-muted">Select a parent first.</div>
            )}
          </div>
        </div>
      </section>

      {parentId ? (
        <section className="portal-surface p-5">
          <h2 className="text-lg font-semibold">Linked students</h2>
          <p className="mt-1 text-sm portal-muted">
            Parent: <span className="font-medium">{selectedParent?.full_name ?? parentId}</span>
          </p>

          <div className="mt-4 divide-y rounded-xl border bg-white/70">
            {links.map((l: any) => (
              <div key={l.student_id} className="px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-medium">{l.students?.full_name ?? l.student_id}</div>
                  <div className="text-xs text-slate-500">{l.students?.admission_no ?? ""}</div>
                </div>

                <form action={removeParentStudentLink}>
                  <input type="hidden" name="parent_id" value={parentId} />
                  <input type="hidden" name="student_id" value={l.student_id} />
                  <ConfirmSubmitButton className="portal-btn portal-btn-danger" confirmText="Remove this link?">
                    Unlink
                  </ConfirmSubmitButton>
                </form>
              </div>
            ))}

            {links.length === 0 ? (
              <div className="px-4 py-6 text-sm portal-muted">No linked students yet.</div>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}