import { History } from "lucide-react";

export default function BuyListActivity({
  setActivityLog,
  activityLog,
  showLog,
}) {
  return (
    <aside className={`md:w-2/5 ${showLog ? "" : "hidden lg:block"}`}>
      <div className="bg-white rounded-xl border border-slate-300 shadow-sm p-3">
        <div className="flex items-center border-b-2 border-slate-400 border-dashed pb-2 justify-between mb-2">
          <div className="flex items-center gap-2 text-slate-700 font-semibold">
            <History className="size-5" />
            <span>Activity</span>
          </div>
          <button
            onClick={() => setActivityLog([])}
            className="text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
          >
            Clear
          </button>
        </div>
        {activityLog.length === 0 ? (
          <p className="text-slate-400 text-sm">No activity yet</p>
        ) : (
          <ul className="space-y-2 max-h-80 overflow-auto">
            {activityLog.map((a, i) => (
              <li
                key={i}
                className={`${
                  a.color === "green"
                    ? "text-green-600"
                    : a.color === "cyan"
                    ? "text-cyan-800"
                    : ""
                } text-sm flex justify-between gap-3`}
              >
                <span className="truncate">{a.message}</span>
                <span className="text-slate-400 shrink-0">{a.timestamp}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
