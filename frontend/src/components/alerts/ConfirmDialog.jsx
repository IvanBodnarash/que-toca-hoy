import { useEffect } from "react";

export default function ConfirmDialog({
  open,
  title = "Confirm",
  message = "Are you sure?",
  confirmText = "Yes",
  cancelText = "Cancel",
  danger = false,
  busy = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    const onKey = (e) => {
      if (!open) return;
      if (e.key === "Escape") onCancel?.();
      if (e.key === "Enter") onConfirm?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel, onConfirm]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel?.();
      }}
    >
      <div className="w-[83%] max-w-md rounded-2xl bg-white p-4 shadow-xl">
        <div className="mb-2 text-lg font-semibold">{title}</div>
        <div className="text-sm text-slate-700">{message}</div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            className="rounded-md border px-3 py-1.5 transition-all cursor-pointer bg-slate-500 text-white hover:bg-slate-600"
            onClick={onCancel}
            disabled={busy}
          >
            {cancelText}
          </button>
          <button
            className={`rounded-md px-3 py-1.5 text-white ${
              danger
                ? "bg-red-600 hover:bg-red-800 transition-all cursor-pointer"
                : "bg-cyan-900 hover:bg-cyan-800"
            }`}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
