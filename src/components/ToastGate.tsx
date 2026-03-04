"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type ToastType = "success" | "error";

function Toast({
  type,
  message,
  onClose,
}: {
  type: ToastType;
  message: string;
  onClose: () => void;
}) {
  const base =
    "pointer-events-auto w-full max-w-md rounded-2xl border px-4 py-3 shadow-lg backdrop-blur";
  const styles =
    type === "success"
      ? "border-green-200 bg-green-50/90 text-green-900"
      : "border-red-200 bg-red-50/90 text-red-900";

  return (
    <div className={`${base} ${styles}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm leading-snug">{message}</div>
        <button
          className="rounded-lg px-2 py-1 text-xs font-semibold opacity-80 hover:opacity-100"
          onClick={onClose}
          type="button"
          aria-label="Close toast"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

/**
 * ToastGate
 * - Reads ok/err from the URL (server sets these via redirect)
 * - Shows a toast once
 * - Cleans the URL (removes ok/err) so refreshing doesn't re-toast
 *
 * Works anywhere (public or portal), but styled to fit portal nicely.
 */
export function ToastGate({
  ok,
  err,
  okText,
  durationMs = 3200,
}: {
  ok?: string;
  err?: string;
  okText: string;
  durationMs?: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const [toast, setToast] = React.useState<{ type: ToastType; message: string } | null>(null);

  React.useEffect(() => {
    // Prefer error if both exist
    if (err) {
      setToast({ type: "error", message: safeDecode(err) });
      cleanUrl();
      return;
    }
    if (ok) {
      setToast({ type: "success", message: okText });
      cleanUrl();
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ok, err]);

  React.useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), durationMs);
    return () => window.clearTimeout(t);
  }, [toast, durationMs]);

  function cleanUrl() {
    // remove ok & err only, keep everything else
    const next = new URLSearchParams(sp.toString());
    next.delete("ok");
    next.delete("err");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function safeDecode(v: string) {
    try {
      return decodeURIComponent(v);
    } catch {
      return v;
    }
  }

  if (!toast) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[60] flex w-[min(92vw,420px)] flex-col gap-2">
      <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
    </div>
  );
}