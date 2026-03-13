"use client";

export default function PrintButton() {
  return (
    <button
      className="portal-btn portal-btn-primary"
      type="button"
      onClick={() => window.print()}
    >
      Print / Save PDF
    </button>
  );
}