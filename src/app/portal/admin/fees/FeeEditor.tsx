"use client";

import { useFormState, useFormStatus } from "react-dom";
import { upsertFeeItem, deleteFeeItem, type FeeActionState } from "./actions";

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

export default function FeeEditor({
  selected,
}: {
  selected?: {
    id: number;
    title: string;
    amount_text: string | null;
    notes: string | null;
    applies_to: "s1-s4" | "s5-s6" | "boarding" | "day" | "general";
    sort_order: number;
    is_published: boolean;
  } | null;
}) {
  const initialState: FeeActionState = { ok: true, message: "" };

  const [state, formAction] = useFormState<FeeActionState, FormData>(
    upsertFeeItem,
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
          <span className="text-sm">Amount (text)</span>
          <input
            className="rounded-lg border px-3 py-2"
            name="amount_text"
            defaultValue={selected?.amount_text ?? ""}
            placeholder="e.g. UGX 450,000 per term"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm">Notes (optional)</span>
          <textarea
            className="min-h-[140px] rounded-lg border px-3 py-2"
            name="notes"
            defaultValue={selected?.notes ?? ""}
          />
        </label>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-sm">Applies to</span>
            <select
              className="rounded-lg border px-3 py-2"
              name="applies_to"
              defaultValue={selected?.applies_to ?? "general"}
            >
              <option value="general">General</option>
              <option value="s1-s4">S1–S4</option>
              <option value="s5-s6">S5–S6</option>
              <option value="boarding">Boarding</option>
              <option value="day">Day</option>
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
          <input
            name="is_published"
            type="checkbox"
            defaultChecked={selected?.is_published ?? true}
          />
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
          action={deleteFeeItem}
          className="mt-6 border-t pt-4"
          onSubmit={(e) => {
            if (!confirm("Delete this fee item?")) e.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={selected.id} />
          <button
            type="submit"
            className="text-sm text-red-600 underline hover:text-red-800"
          >
            Delete this fee item
          </button>
        </form>
      ) : null}
    </>
  );
}
