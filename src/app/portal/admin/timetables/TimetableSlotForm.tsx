"use client";

import { useMemo, useState } from "react";

type Subject = {
  id: number;
  name: string;
  code: string | null;
};

type Teacher = {
  id: string;
  full_name: string;
};

type TeacherAssignment = {
  subject_id: number;
  teacher_id: string;
  subjects?: { id: number; name: string; code: string | null } | { id: number; name: string; code: string | null }[] | null;
  teachers?: { id: string; full_name: string } | { id: string; full_name: string }[] | null;
};

type Editing = {
  id?: number;
  period_no?: number | null;
  subject_id?: number | null;
  teacher_id?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  room?: string | null;
  note?: string | null;
} | null;

function one<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

export function TimetableSlotForm({
  action,
  termId,
  classId,
  day,
  subjects,
  teacherAssignments,
  editing,
}: {
  action: (formData: FormData) => void;
  termId: number;
  classId: number;
  day: string;
  subjects: Subject[];
  teacherAssignments: TeacherAssignment[];
  editing: Editing;
}) {
  const [subjectId, setSubjectId] = useState<string>(
    editing?.subject_id ? String(editing.subject_id) : String(subjects[0]?.id ?? "")
  );

  const eligibleTeachers = useMemo(() => {
    const sid = Number(subjectId);
    if (!sid) return [];

    const seen = new Set<string>();
    const out: Teacher[] = [];

    for (const row of teacherAssignments) {
      if (row.subject_id !== sid) continue;
      const t = one(row.teachers);
      if (!t?.id || seen.has(t.id)) continue;
      seen.add(t.id);
      out.push({ id: t.id, full_name: t.full_name });
    }

    return out.sort((a, b) => a.full_name.localeCompare(b.full_name));
  }, [subjectId, teacherAssignments]);

  const defaultTeacherValue =
    editing?.teacher_id && eligibleTeachers.some((t) => t.id === editing.teacher_id)
      ? editing.teacher_id
      : "";

  return (
    <form action={action} className="mt-4 grid gap-3">
      <input type="hidden" name="id" value={editing?.id ?? ""} />
      <input type="hidden" name="term_id" value={termId} />
      <input type="hidden" name="class_id" value={classId} />
      <input type="hidden" name="day_of_week" value={day} />

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1">
          <span className="text-sm">Period No</span>
          <input
            className="portal-input"
            type="number"
            name="period_no"
            min={1}
            max={30}
            required
            defaultValue={editing?.period_no ?? ""}
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm">Subject</span>
          <select
            className="portal-select"
            name="subject_id"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code ? `${s.code} — ` : ""}
                {s.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1">
          <span className="text-sm">Starts</span>
          <input
            className="portal-input"
            type="time"
            name="start_time"
            required
            defaultValue={editing?.start_time ?? ""}
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm">Ends</span>
          <input
            className="portal-input"
            type="time"
            name="end_time"
            required
            defaultValue={editing?.end_time ?? ""}
          />
        </label>
      </div>

      <label className="grid gap-1">
        <span className="text-sm">Teacher (optional)</span>
        <select
          key={`${subjectId}-${defaultTeacherValue}`}
          className="portal-select"
          name="teacher_id"
          defaultValue={defaultTeacherValue}
        >
          <option value="">—</option>
          {eligibleTeachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.full_name}
            </option>
          ))}
        </select>

        <div className="text-xs text-slate-500">
          Only teachers assigned to this class and subject are shown.
        </div>
      </label>

      <label className="grid gap-1">
        <span className="text-sm">Room (optional)</span>
        <input className="portal-input" name="room" defaultValue={editing?.room ?? ""} placeholder="Room A1" />
      </label>

      <label className="grid gap-1">
        <span className="text-sm">Note (optional)</span>
        <textarea className="portal-input min-h-[110px]" name="note" defaultValue={editing?.note ?? ""} />
      </label>

      <button className="portal-btn portal-btn-primary w-fit" type="submit">
        {editing ? "Save changes" : "Create slot"}
      </button>
    </form>
  );
}