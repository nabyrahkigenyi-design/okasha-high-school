"use client";

import { useFormState, useFormStatus } from "react-dom";
import PdfField from "./PdfField";
import { upsertPolicy, deletePolicy, type PolicyActionState } from "./actions";

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

export default function PolicyEditor({
  selected,
}: {
  selected?: {
    id: number;
    title: string;
    summary: string | null;
    file_url: string;
    file_name: string | null;
    category: "admissions" | "conduct" | "uniform" | "safeguarding" | "general";
    sort_order: number;
    is_published: boolean;
  } | null;
}) {
  const initialState: PolicyActionState = { ok: true, message: "" };

  const [state, formAction] = useFormState<PolicyActionState, FormData>(
    upsertPolicy,
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
          <span className="text-sm">Summary (optional)</span>
          <textarea
            className="min-h-[120px] rounded-lg border px-3 py-2"
            name="summary"
            defaultValue={selected?.summary ?? ""}
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm">PDF file</span>
          <PdfField defaultUrl={selected?.file_url ?? ""} defaultName={selected?.file_name ?? ""} />
        </label>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-sm">Category</span>
            <select
              className="rounded-lg border px-3 py-2"
              name="category"
              defaultValue={selected?.category ?? "general"}
            >
              <option value="general">General</option>
              <option value="admissions">Admissions</option>
              <option value="conduct">Conduct</option>
              <option value="uniform">Uniform</option>
              <option value="safeguarding">Safeguarding</option>
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
          action={deletePolicy}
          className="mt-6 border-t pt-4"
          onSubmit={(e) => {
            if (!confirm("Delete this policy document? This cannot be undone.")) e.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={selected.id} />
          <button type="submit" className="text-sm text-red-600 underline hover:text-red-800">
            Delete this policy
          </button>
        </form>
      ) : null}
    </>
  );
}
