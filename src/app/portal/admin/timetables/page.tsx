import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { ToastGate } from "@/components/ToastGate";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import { upsertSlot, deleteSlot, copyDay, copyFromTerm } from "./actions";
import {
  getSlotOrNull,
  listClasses,
  listSubjects,
  listTeacherAssignmentsForClass,
  listTerms,
  listTimetableSlots,
} from "./queries";
import { TimetableSlotForm } from "./TimetableSlotForm";

type Rel<T> = T | T[] | null | undefined;
function one<T>(v: Rel<T>): T | null {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

const DAYS = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
] as const;

type DayKey = (typeof DAYS)[number]["key"];

function shortTime(t: string | null) {
  if (!t) return "";
  return String(t).slice(0, 5);
}

export default async function AdminTimetablesPage({
  searchParams,
}: {
  searchParams: Promise<{
    termId?: string;
    classId?: string;
    day?: string;
    id?: string;
    ok?: string;
    err?: string;
  }>;
}) {
  await requireRole(["admin"]);
  const params = await searchParams;

  const terms = await listTerms();
  const classes = await listClasses();
  const subjects = await listSubjects();

  const termId = params.termId
    ? Number(params.termId)
    : (terms.find((t: any) => t.is_active)?.id ?? terms[0]?.id ?? 0);

  const classId = params.classId ? Number(params.classId) : (classes[0]?.id ?? 0);
  const day = ((params.day as DayKey | undefined) ?? "mon") as DayKey;

  const selectedId = params.id ? Number(params.id) : 0;
  const editing = selectedId ? await getSlotOrNull(selectedId) : null;

  const slots = termId && classId && day ? await listTimetableSlots({ termId, classId, day }) : [];
  const teacherAssignments = termId && classId ? await listTeacherAssignmentsForClass(termId, classId) : [];

  const termName = terms.find((t: any) => t.id === termId)?.name ?? `Term ${termId}`;
  const cls = classes.find((c: any) => c.id === classId);
  const dayLabel = DAYS.find((d) => d.key === day)?.label ?? day;

  const baseHref = (extra?: Record<string, string | number>) => {
    const qs = new URLSearchParams();
    if (termId) qs.set("termId", String(termId));
    if (classId) qs.set("classId", String(classId));
    if (day) qs.set("day", String(day));
    if (extra) Object.entries(extra).forEach(([k, v]) => qs.set(k, String(v)));
    return `/portal/admin/timetables?${qs.toString()}`;
  };

  return (
    <div className="grid gap-6">
      <ToastGate ok={params.ok} err={params.err} okText="Timetable saved." />

      <section className="portal-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="portal-title">Timetable Editor</h1>
            <p className="portal-subtitle">Manage lesson slots per term, class and day.</p>
          </div>
          <Link className="portal-btn" href="/portal/admin/dashboard">
            Admin Dashboard
          </Link>
        </div>

        <form method="get" className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
          <label className="grid gap-1">
            <span className="text-sm">Term</span>
            <select className="portal-select" name="termId" defaultValue={String(termId)}>
              {terms.map((t: any) => (
                <option key={t.id} value={t.id}>
                  {t.name} {t.is_active ? "(active)" : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-sm">Class</span>
            <select className="portal-select" name="classId" defaultValue={String(classId)}>
              {classes.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name} • {c.level} • {c.track_key}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-sm">Day</span>
            <select className="portal-select" name="day" defaultValue={String(day)}>
              {DAYS.map((d) => (
                <option key={d.key} value={d.key}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-end">
            <button className="portal-btn portal-btn-primary" type="submit">
              Open
            </button>
          </div>
        </form>

        <div className="mt-4 rounded-xl border bg-white/70 p-4">
          <div className="font-medium">
            {termName} • {cls?.name ?? classId} • {dayLabel}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Only teachers assigned to this class and subject can be selected.
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <div className="rounded-2xl border bg-white/70 p-4">
            <div className="text-sm font-semibold">Copy Day</div>
            <form action={copyDay} className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <input type="hidden" name="term_id" value={termId} />
              <input type="hidden" name="class_id" value={classId} />

              <label className="grid gap-1">
                <span className="text-xs text-slate-600">From</span>
                <select className="portal-select" name="from_day" defaultValue={String(day)}>
                  {DAYS.map((d) => (
                    <option key={d.key} value={d.key}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1">
                <span className="text-xs text-slate-600">To</span>
                <select className="portal-select" name="to_day" defaultValue={String(day === "sun" ? "mon" : "tue")}>
                  {DAYS.map((d) => (
                    <option key={d.key} value={d.key}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex items-end">
                <button className="portal-btn portal-btn-primary" type="submit">
                  Copy
                </button>
              </div>
            </form>
          </div>

          <div className="rounded-2xl border bg-white/70 p-4">
            <div className="text-sm font-semibold">Copy from another term</div>
            <form action={copyFromTerm} className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <input type="hidden" name="class_id" value={classId} />

              <label className="grid gap-1">
                <span className="text-xs text-slate-600">Source term</span>
                <select className="portal-select" name="source_term_id" defaultValue={String(terms[1]?.id ?? termId)}>
                  {terms.map((t: any) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1">
                <span className="text-xs text-slate-600">Target term</span>
                <select className="portal-select" name="target_term_id" defaultValue={String(termId)}>
                  {terms.map((t: any) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex items-end">
                <button className="portal-btn portal-btn-primary" type="submit">
                  Copy
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="portal-surface p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">{editing ? "Edit slot" : "New slot"}</h2>
              <p className="text-sm portal-muted">{editing ? "Update lesson details." : "Create a new lesson slot."}</p>
            </div>
            <Link className="portal-btn" href={baseHref()}>
              New
            </Link>
          </div>

          <TimetableSlotForm
            action={upsertSlot}
            termId={termId}
            classId={classId}
            day={day}
            subjects={subjects}
            teacherAssignments={teacherAssignments}
            editing={editing}
          />
        </section>

        <section className="portal-surface p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Slots</h2>
            <span className="portal-badge">{slots.length} total</span>
          </div>

          {slots.length === 0 ? (
            <div className="mt-4 text-sm portal-muted">No slots yet for this day.</div>
          ) : (
            <div className="mt-4 grid gap-3">
              {slots.map((x: any) => {
                const subj: any = one(x.subjects);
                const teacher: any = one(x.teachers);

                return (
                  <div key={x.id} className="rounded-2xl border bg-white/70 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate">
                          Period {x.period_no ?? "—"} • {subj?.name ?? "Subject"}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {shortTime(x.start_time)}–{shortTime(x.end_time)}
                          {x.room ? ` • Room: ${x.room}` : ""}
                          {subj?.code ? ` • ${subj.code}` : ""}
                          {teacher?.full_name ? ` • ${teacher.full_name}` : ""}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Link className="portal-btn" href={baseHref({ id: x.id })}>
                          Edit
                        </Link>

                        <form action={deleteSlot}>
                          <input type="hidden" name="id" value={x.id} />
                          <input type="hidden" name="termId" value={termId} />
                          <input type="hidden" name="classId" value={classId} />
                          <input type="hidden" name="day" value={day} />
                          <ConfirmSubmitButton
                            className="portal-btn portal-btn-danger"
                            confirmText={`Delete period ${x.period_no ?? "?"} for ${dayLabel}?`}
                          >
                            Delete
                          </ConfirmSubmitButton>
                        </form>
                      </div>
                    </div>

                    {x.note ? <div className="mt-3 text-sm text-slate-700 whitespace-pre-wrap">{x.note}</div> : null}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}