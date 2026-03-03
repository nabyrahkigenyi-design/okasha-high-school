"use client";

export default function PrintControls() {
  return (
    <div className="no-print flex items-center justify-between gap-3 mb-4">
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50"
      >
        Print / Save as PDF
      </button>

      <div className="text-xs text-slate-500">
        Tip: choose “Save as PDF” in your browser print dialog.
      </div>
    </div>
  );
}