import { useEffect, useState } from "react";

export default function ReassignDialog({
  open,
  users = [],
  initialUserId = null,
  busy = false,
  onSave,
  onCancel,
}) {
  const [value, setValue] = useState(initialUserId || "");

  useEffect(() => {
    if (open) setValue(initialUserId || "");
  }, [open, initialUserId]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel?.();
      }}
    >
      <div className="w-[92%] max-w-md rounded-2xl bg-white p-4 shadow-xl">
        <div className="mb-2 text-lg font-semibold">Reassign task</div>
        <div className="text-sm text-slate-700 mb-3">
          Choose a new assignee for this task.
        </div>

        <select
          className="w-full border rounded p-2"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={busy}
        >
          <option value="" disabled>
            Select user
          </option>
          {users.map((u) => (
            <option key={u.idUser} value={u.idUser}>
              {u.username || u.name || `User ${u.idUser}`}
            </option>
          ))}
        </select>

        <div className="mt-4 flex justify-end gap-2">
          <button
            className="rounded-md border border-slate-500 px-3 py-1.5 cursor-pointer hover:bg-slate-200 transition-all"
            onClick={onCancel}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            className="rounded-md px-3 py-1.5 text-white bg-cyan-900 hover:bg-cyan-800 disabled:opacity-60 transition-all cursor-pointer"
            onClick={() => onSave?.(value)}
            disabled={busy || !value}
          >
            {busy ? "..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
