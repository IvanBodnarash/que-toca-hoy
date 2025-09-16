export default function AlertBanner({ type = "success", msg, onClose }) {
  const isError = type === "error";
  const base = "flex items-start gap-2 rounded-md px-3 py-2 border text-sm";
  const cls = isError
    ? "bg-red-50 border-red-300 text-red-800"
    : "bg-emerald-50 border-emerald-300 text-emerald-800";
  const icon = isError ? "⚠️" : "✅";

  return (
    <div className={`${base} ${cls}`}>
      <div className="pt-0.5">{icon}</div>
      <div className="flex-1">{msg}</div>
      <button
        className="ml-2 rounded px-2 py-0.5 hover:bg-black/5"
        onClick={onClose}
        title="Close"
      >
        ✕
      </button>
    </div>
  );
}
