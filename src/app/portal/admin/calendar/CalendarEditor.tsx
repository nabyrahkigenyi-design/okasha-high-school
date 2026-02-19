"use client";

import { useFormState, useFormStatus } from "react-dom";
import { upsertCalendarEvent, deleteCalendarEvent, type CalendarActionState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="rounded-xl px-4 py-2 font-medium text-white disabled:opacity-60"
      style={{ background: "var(--ohs-dark-green)" }}
      type="submit"
    >
      {pending ? "Saving..." : "Save"}
    </button>
  );
}

export default function CalendarEditor({
  selected,
}: {
  selected?: {
    id: number;
    title: string;
    description: string | null;
    starts_on: string;
    ends_on: string | null;
    category: "term" | "exam" | "holiday" | "event" | "general";
    sort_order: number;
    is_published: boolean;
  } | null;
}) {
  const initialState: CalendarActionState = { ok: true, message: "" };

  const [state, formAction] = useFormState<CalendarActionState, FormData>(
    upsertCalendarEvent,
    initialState
  );

  return (
    <>
      <form action={formAction} className="mt-4 grid gap-3">
        <input type="hidden" name="id" value={selected?.id ?? ""} />

        <label className="grid gap-1">
          <span className="text-sm">Title</span>
          <input
            className="rounded-lg border px-3 py-2"
            name="title"
            required
            defaultValue={selected?.title ?? ""}
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm">Description (optional)</span>
          <textarea
            className="min-h-[140px] rounded-lg border px-3 py-2"
            name="description"
            defaultValue={selected?.description ?? ""}
          />
        </label>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-sm">Starts on</span>
            <input
              className="rounded-lg border px-3 py-2"
              type="date"
              name="starts_on"
              required
              defaultValue={selected?.starts_on ?? ""}
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm">Ends on (optional)</span>
            <input
              className="rounded-lg border px-3 py-2"
              type="date"
              name="ends_on"
              defaultValue={selected?.ends_on ?? ""}
            />
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-sm">Category</span>
            <select
              className="rounded-lg border px-3 py-2"
              name="category"
              defaultValue={selected?.category ?? "general"}
            >
              <option value="general">General</option>
              <option value="term">Term</option>
              <option value="exam">Exam</option>
              <option value="holiday">Holiday</option>
              <option value="event">Event</option>
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-sm">Sort order</span>
            <input
              className="rounded-lg border px-3 py-2"
              name="sort_order"
              type="number"
              defaultValue={selected?.sort_order ?? 100}
            />
          </label>
        </div>

        <label className="flex items-center gap-2">
          <input name="is_published" type="checkbox" defaultChecked={selected?.is_published ?? true} />
          <span className="text-sm">Published</span>
        </label>

        <div className="flex items-center gap-3">
          <SubmitButton />

          {state.ok && state.message ? (
            <span className="text-sm text-green-700">{state.message}</span>
          ) : null}

          {!state.ok && state.error ? (
            <span className="text-sm text-red-600">{state.error}</span>
          ) : null}
        </div>
      </form>

      {selected?.id ? (
        <form
          action={deleteCalendarEvent}
          className="mt-6 border-t pt-4"
          onSubmit={(e) => {
            if (!confirm("Delete this event? This cannot be undone.")) e.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={selected.id} />
          <button type="submit" className="text-sm text-red-600 underline hover:text-red-800">
            Delete this event
          </button>
        </form>
      ) : null}
    </>
  );
}
