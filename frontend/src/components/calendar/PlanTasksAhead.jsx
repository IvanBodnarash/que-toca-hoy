export default function PlanTasksAhead({
  planForEvent,
  setPlanForEvent,
  planTimes,
  setPlanTimes,
  planBusy,
  setPlanOpen,
  doPlanAhead,
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40">
      <div className="w-[92%] max-w-sm rounded-2xl bg-white p-4 shadow-xl">
        <h3 className="text-lg font-semibold mb-2">Plan ahead</h3>
        <div className="text-md text-slate-700 mb-1">
          <p>
            {" "}
            Base: <b>{planForEvent.title}</b>
          </p>
          <p>
            {" "}
            Frequency: <b>{planForEvent.frequency}</b>
          </p>
        </div>

        <label className="text-sm text-slate-800">
          How many future{" "}
          {planForEvent.frequency === "daily"
            ? "days"
            : planForEvent.frequency === "weekly"
            ? "weeks"
            : planForEvent.frequency === "monthly"
            ? "months"
            : "occurrences"}
          ?
        </label>
        <input
          type="number"
          min={1}
          className="mt-1 w-full rounded-md border border-slate-500 px-3 py-2 focus:ring-2 outline-none text-slate-700 focus:ring-cyan-600"
          value={planTimes}
          onChange={(e) => setPlanTimes(e.target.value)}
        />

        <div className="flex flex-wrap gap-2 mt-2">
          {planForEvent.frequency === "daily" &&
            [3, 7, 14].map((n) => (
              <button
                key={n}
                onClick={() => setPlanTimes(n)}
                className="text-xs p-2 cursor-pointer transition-all rounded border border-slate-400 bg-slate-100 hover:bg-slate-200"
              >
                {n} days
              </button>
            ))}
          {planForEvent.frequency === "weekly" &&
            [2, 4, 8].map((n) => (
              <button
                key={n}
                onClick={() => setPlanTimes(n)}
                className="text-xs p-2 cursor-pointer transition-all rounded border border-slate-400 bg-slate-100 hover:bg-slate-200"
              >
                {n} weeks
              </button>
            ))}
          {planForEvent.frequency === "monthly" &&
            [2, 3, 6].map((n) => (
              <button
                key={n}
                onClick={() => setPlanTimes(n)}
                className="text-xs p-2 cursor-pointer transition-all rounded border border-slate-400 bg-slate-100 hover:bg-slate-200"
              >
                {n} months
              </button>
            ))}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={() => {
              if (!planBusy) {
                setPlanOpen(false);
                setPlanForEvent(null);
              }
            }}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={doPlanAhead}
            disabled={planBusy || Number(planTimes) < 1}
            className="px-4 py-2 rounded bg-cyan-900 text-white hover:bg-cyan-800 disabled:opacity-60 transition-all cursor-pointer"
          >
            {planBusy ? "Planning..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
