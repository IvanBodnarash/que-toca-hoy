export default function NewTaskModal({onCreate, title, setTitle, date, setDate}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-5/6 z-55 min-h-48 rounded-2xl bg-white p-4 shadow-xl">
        <section className="space-y-3">
          <h2 className="font-semibold">Add task</h2>
          <form
            onSubmit={onCreate}
            className="grid grid-cols-1 md:grid-cols-6 gap-2"
          >
            <input
              className="rounded border p-2 md:col-span-2"
              placeholder="Title *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              type="date"
              className="rounded border p-2"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <input
              type="time"
              className="rounded border p-2"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
            <input
              type="time"
              className="rounded border p-2"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
            <label className="flex items-center gap-2 text-sm md:col-span-2">
              <input
                type="checkbox"
                checked={isGroupTask}
                onChange={(e) => setIsGroupTask(e.target.checked)}
              />
              Group task (multiple assignees)
            </label>

            {isGroupTask ? (
              <select
                multiple
                className="rounded border p-2 md:col-span-6 h-28"
                value={assignees}
                onChange={(e) =>
                  setAssignees(
                    Array.from(e.target.selectedOptions).map((o) => o.value)
                  )
                }
              >
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {label(m.userId)}
                  </option>
                ))}
              </select>
            ) : (
              <select
                className="rounded border p-2 md:col-span-2"
                value={assignees[0] || ""}
                onChange={(e) => setAssignees([e.target.value])}
              >
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {label(m.userId)}
                  </option>
                ))}
              </select>
            )}

            <button className="rounded bg-cyan-900 text-white p-2 md:col-span-6">
              Create
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
