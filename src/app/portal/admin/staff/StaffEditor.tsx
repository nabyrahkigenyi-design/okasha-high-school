"use client";

import { useFormState, useFormStatus } from "react-dom";
import PhotoField from "./PhotoField";
import { upsertStaffMember, deleteStaffMember, type StaffActionState } from "./actions";

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

export default function StaffEditor({
  selected,
}: {
  selected?: {
    id: number;
    full_name: string;
    role_title: string;
    department: string | null;
    bio: string | null;
    photo_url: string | null;
    sort_order: number;
    is_published: boolean;
  } | null;
}) {
  const initialState: StaffActionState = { ok: true, message: "" };

  const [state, formAction] = useFormState<StaffActionState, FormData>(
    upsertStaffMember,
    initialState
  );

  return (
    <>
      <form action={formAction} className="mt-4 grid gap-3">
        <input type="hidden" name="id" value={selected?.id ?? ""} />

        <label className="grid gap-1">
          <span className="text-sm">Full name</span>
          <input
            className="rounded-lg border px-3 py-2"
            name="full_name"
            required
            defaultValue={selected?.full_name ?? ""}
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm">Role / Title</span>
          <input
            className="rounded-lg border px-3 py-2"
            name="role_title"
            required
            defaultValue={selected?.role_title ?? ""}
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm">Department (optional)</span>
          <input
            className="rounded-lg border px-3 py-2"
            name="department"
            defaultValue={selected?.department ?? ""}
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm">Photo</span>
          <PhotoField defaultValue={selected?.photo_url ?? ""} />
        </label>

        <label className="grid gap-1">
          <span className="text-sm">Bio (optional)</span>
          <textarea
            className="min-h-[180px] rounded-lg border px-3 py-2"
            name="bio"
            defaultValue={selected?.bio ?? ""}
          />
        </label>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-sm">Sort order (lower = higher)</span>
            <input
              className="rounded-lg border px-3 py-2"
              name="sort_order"
              type="number"
              defaultValue={selected?.sort_order ?? 100}
            />
          </label>

          <label className="flex items-center gap-2 mt-6">
            <input
              name="is_published"
              type="checkbox"
              defaultChecked={selected?.is_published ?? true}
            />
            <span className="text-sm">Published</span>
          </label>
        </div>

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
          action={deleteStaffMember}
          className="mt-6 border-t pt-4"
          onSubmit={(e) => {
            if (!confirm("Delete this staff member? This cannot be undone.")) e.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={selected.id} />
          <button type="submit" className="text-sm text-red-600 underline hover:text-red-800">
            Delete this staff member
          </button>
        </form>
      ) : null}
    </>
  );
}
