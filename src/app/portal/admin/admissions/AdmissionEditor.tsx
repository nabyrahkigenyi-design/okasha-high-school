"use client";

import { useFormState, useFormStatus } from "react-dom";
import PdfField from "./PdfField";
import { upsertAdmissionDoc, deleteAdmissionDoc, type AdmissionsActionState } from "./actions";

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

export default function AdmissionEditor({
  selected,
}: {
  selected?: {
    id: number;
    title: string;
    summary: string | null;
    file_url: string;
    file_name: string | null;
    is_primary: boolean;
    sort_order: number;
    is_published: boolean;
  } | null;
}) {
  const initialState: AdmissionsActionState = { ok: true, message: "" };

  const [state, formAction] = useFormState<AdmissionsActionState, FormData>(
    upsertAdmissionDoc,
    initialState
  );

  return (
    <>
      <form action={formAction} className="mt-4 grid gap-3">
        <input type="hidden" name="id" value={selected?.id ?? ""} />

        <label className="grid gap-1">
          <span className="text-sm">Title</span>
          <input className="rounded-lg border px-3 py-2" name="title" required defaultValue={selected?.title ?? ""} />
        </label>

        <label className="grid gap-1">
          <span className="text-sm">Summary (optional)</span>
          <textarea className="min-h-[140px] rounded-lg border px-3 py-2" name="summary" defaultValue={selected?.summary ?? ""} />
        </label>

        <label className="grid gap-1">
          <span className="text-sm">PDF file</span>
          <PdfField defaultUrl={selected?.file_url ?? ""} defaultName={selected?.file_name ?? ""} />
        </label>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-sm">Sort order</span>
            <input className="rounded-lg border px-3 py-2" name="sort_order" type="number" defaultValue={selected?.sort_order ?? 100} />
          </label>

          <label className="flex items-center gap-2 mt-6">
            <input name="is_primary" type="checkbox" defaultChecked={selected?.is_primary ?? false} />
            <span className="text-sm">Primary document</span>
          </label>
        </div>

        <label className="flex items-center gap-2">
          <input name="is_published" type="checkbox" defaultChecked={selected?.is_published ?? true} />
          <span className="text-sm">Published</span>
        </label>

        <div className="flex items-center gap-3">
          <SubmitButton />
          {state?.ok && state.message ? (
            <span className="text-sm text-green-700">{state.message}</span>
          ) : null}
          {!state?.ok && state?.error ? (
            <span className="text-sm text-red-600">{state.error}</span>
          ) : null}
        </div>
      </form>

      {selected?.id ? (
        <form
          action={deleteAdmissionDoc}
          className="mt-6 border-t pt-4"
          onSubmit={(e) => {
            if (!confirm("Delete this admissions document?")) e.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={selected.id} />
          <button type="submit" className="text-sm text-red-600 underline hover:text-red-800">
            Delete this document
          </button>
        </form>
      ) : null}
    </>
  );
}
