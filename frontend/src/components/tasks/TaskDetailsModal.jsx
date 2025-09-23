export default function TaskDetailsModal({
  open,
  task,
  usersMap,
  role, // "admin" | "user"
  onClose,
  onToggleDoneForUser, // (taskId, userId) => void
  onDelete, // (taskId) => void
}) {
  if (!open || !task) return null;

  const label = (uid) =>
    usersMap.get(String(uid)) || String(uid);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
      <div className="w-[92%] max-w-lg rounded-xl bg-white p-4 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{task.title}</h3>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded hover:bg-gray-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium">Date:</span>{" "}
            {task.date || "—"}
          </div>
          <div>
            <span className="font-medium">Time:</span>{" "}
            {task.start ? task.start : "—"}{" "}
            {task.end ? `– ${task.end}` : ""}
          </div>

          <div className="pt-2">
            <div className="font-medium mb-1">Assignees</div>
            <div className="flex flex-wrap gap-2">
              {(task.assignees || []).map((uid) => (
                <label
                  key={uid}
                  className="inline-flex items-center gap-2 rounded border px-2 py-1"
                >
                  <input
                    type="checkbox"
                    checked={!!task.doneBy?.[uid]}
                    onChange={() => onToggleDoneForUser(task.id, uid)}
                  />
                  {label(uid)}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-2">
          {role === "admin" ? (
            <button
              onClick={() => onDelete(task.id)}
              className="px-3 py-2 rounded bg-red-600 text-white"
            >
              Delete task
            </button>
          ) : (
            <div />
          )}
          <button onClick={onClose} className="px-3 py-2 rounded border">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}